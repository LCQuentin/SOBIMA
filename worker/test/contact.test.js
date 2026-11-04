// Lancer : node --test worker/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifierPlan, detecterFormat, nettoyerNom, TAILLE_MAX_FICHIER } from "../src/fichiers.js";
import { traiterContact } from "../src/contact.js";

const octets = (...parties) => new Uint8Array(parties.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));
const fichier = (contenu, nom) => new File([contenu], nom);

const PDF = octets("%PDF-1.7\n1 0 obj << /Type /Catalog /OpenAction [3 0 R /Fit] >> endobj\n%%EOF");
const PNG = octets([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "IHDR....");
const JPG = octets([0xff, 0xd8, 0xff, 0xe0], "JFIF");
const DWG = octets("AC1032", [0, 0, 0, 0, 0, 0x1f, 0x01]);
const DXF = octets("999\nExport plan\n  0\nSECTION\n  2\nHEADER\n  0\nENDSEC\n  0\nEOF\n");
const EXE = octets("MZ", [0x90, 0x00, 0x03], "This program cannot be run in DOS mode");

test("formats acceptés reconnus par leur contenu", async () => {
  for (const [contenu, nom, format] of [[PDF, "plan.pdf", "pdf"], [PNG, "plan.png", "png"], [JPG, "plan.jpeg", "jpg"], [DWG, "plan.dwg", "dwg"], [DXF, "Plan.DXF", "dxf"]]) {
    const r = await verifierPlan(fichier(contenu, nom), "plan-Jeanne-Dupré");
    assert.equal(r.ok, true, `${nom} : ${r.message}`);
    assert.equal(r.format, format);
    assert.equal(r.nomEnvoi, `plan-jeanne-dupre.${format}`);
  }
});

test("exécutable renommé en .pdf refusé", async () => {
  const r = await verifierPlan(fichier(EXE, "plan.pdf"));
  assert.equal(r.ok, false);
  assert.match(r.message, /pas un .* valide/);
});

test("PNG renommé en .dwg refusé", async () => {
  const r = await verifierPlan(fichier(PNG, "plan.dwg"));
  assert.equal(r.ok, false);
  assert.match(r.message, /ne correspond pas/);
});

test("extension hors liste refusée, même si le contenu est un PDF", async () => {
  assert.equal((await verifierPlan(fichier(PDF, "plan.exe"))).ok, false);
  assert.equal((await verifierPlan(fichier(PDF, "plan.pdf.html"))).ok, false);
  assert.equal((await verifierPlan(fichier(PDF, "plan"))).ok, false);
});

test("fichier trop gros ou vide refusé", async () => {
  const gros = new Uint8Array(TAILLE_MAX_FICHIER + 1);
  gros.set(PDF);
  assert.match((await verifierPlan(fichier(gros, "plan.pdf"))).message, /2 Mo/);
  assert.match((await verifierPlan(fichier(new Uint8Array(0), "plan.pdf"))).message, /vide/);
});

test("PDF avec contenu actif refusé, y compris écrit en hexadécimal", async () => {
  for (const actif of ["/JavaScript (app.alert(1))", "/JS (x)", "/Launch << /F (calc.exe) >>", "/EmbeddedFiles << >>", "/RichMedia", "/#4A#61vaScript (x)"]) {
    const r = await verifierPlan(fichier(octets(`%PDF-1.4\n1 0 obj << /OpenAction << /S ${actif} >> >> endobj`), "plan.pdf"));
    assert.equal(r.ok, false, actif);
    assert.match(r.message, /contenu actif/);
  }
});

test("DXF texte avec octet nul refusé", () => {
  assert.equal(detecterFormat(octets("  0\nSECTION\n", [0], "x")), null);
});

test("nom piégé nettoyé (contrôle, inversion bidi)", async () => {
  assert.equal(nettoyerNom("plan\u202Efdp.exe"), "planfdp.exe");
  assert.equal(nettoyerNom("a\r\nb\u0000c"), "abc");
  // l'extension réelle (.exe) est vue une fois le caractère bidi retiré
  assert.equal((await verifierPlan(fichier(PDF, "plan\u202Efdp.exe"))).ok, false);
});

/* Traitement complet de la requête */

function requete(champs, { json = true, fichierPlan } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(champs)) fd.append(k, v);
  if (fichierPlan) fd.append("plan", fichierPlan);
  const r = new Request("https://sobima.fr/api/contact", { method: "POST", body: fd });
  return new Request(r, { headers: { ...Object.fromEntries(r.headers), "Content-Length": "2000", ...(json ? { Accept: "application/json" } : {}) } });
}
const valides = { prenom: "Jeanne", nom: "Dupré", email: "jeanne@exemple.fr", telephone: "06 12 34 56 78", adresse: "12 rue Inconnue, Nulle-part", adresse_ban: "" };
const envSimule = { ENVOI_SIMULE: "1", CONTACT_DESTINATAIRE: "contact@sobima.fr", CONTACT_EXPEDITEUR: "Site <f@sobima.fr>" };

test("demande valide avec adresse non reconnue et plan : acceptée (envoi simulé)", async () => {
  const r = await traiterContact(requete(valides, { fichierPlan: fichier(PDF, "plan.pdf") }), envSimule);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
});

test("champs obligatoires manquants : 422 avec un message par champ", async () => {
  const r = await traiterContact(requete({ prenom: "", nom: "", email: "pas-un-mail", telephone: "12" }), envSimule);
  assert.equal(r.status, 422);
  const corps = await r.json();
  assert.deepEqual(Object.keys(corps.erreurs).sort(), ["email", "nom", "prenom", "telephone"]);
});

test("plan piégé : 422 sur le champ plan", async () => {
  const r = await traiterContact(requete(valides, { fichierPlan: fichier(EXE, "plan.pdf") }), envSimule);
  assert.equal(r.status, 422);
  assert.ok((await r.json()).erreurs.plan);
});

test("sans JavaScript : redirection 303 vers /merci ou /envoi-impossible", async () => {
  const ok = await traiterContact(requete(valides, { json: false }), envSimule);
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get("Location"), "https://sobima.fr/merci");
  const ko = await traiterContact(requete({ ...valides, email: "x" }, { json: false }), envSimule);
  assert.equal(ko.headers.get("Location"), "https://sobima.fr/envoi-impossible");
});

test("échec fermé : sans clé Resend ni mode simulé, jamais « envoyé »", async () => {
  const r = await traiterContact(requete(valides), { CONTACT_DESTINATAIRE: "contact@sobima.fr", CONTACT_EXPEDITEUR: "Site <f@sobima.fr>" });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).ok, false);
});

test("champ piège rempli : réponse « envoyé » sans envoi", async () => {
  const r = await traiterContact(requete({ ...valides, site_web: "http://spam" }), {});
  assert.equal(r.status, 200);
});

test("requête trop grosse refusée avant lecture", async () => {
  const req = new Request("https://sobima.fr/api/contact", { method: "POST", headers: { "Content-Length": String(50 * 1024 * 1024), "Content-Type": "multipart/form-data; boundary=x", Accept: "application/json" }, body: "x" });
  assert.equal((await traiterContact(req, envSimule)).status, 413);
});

test("objet du mail sur une seule ligne (pas d'injection d'en-tête)", async () => {
  const appels = [];
  const fetchOrigine = globalThis.fetch;
  globalThis.fetch = async (url, init) => { appels.push(JSON.parse(init.body)); return new Response('{"id":"x"}', { status: 200 }); };
  try {
    const r = await traiterContact(requete({ ...valides, societe: "ACME\r\nBcc: pirate@x.fr" }), { RESEND_API_KEY: "test", CONTACT_DESTINATAIRE: "contact@sobima.fr", CONTACT_EXPEDITEUR: "Site <f@sobima.fr>" });
    assert.equal(r.status, 200);
  } finally {
    globalThis.fetch = fetchOrigine;
  }
  assert.equal(appels.length, 1);
  assert.doesNotMatch(appels[0].subject, /[\r\n]/);
  assert.equal(appels[0].reply_to, "jeanne@exemple.fr");
  assert.equal(appels[0].from, "Site <f@sobima.fr>");
});

test("plan valide proche de la limite (1,9 Mo) : accepté", async () => {
  const contenu = new Uint8Array(Math.floor(1.9 * 1024 * 1024));
  contenu.set(PDF);
  const r = await verifierPlan(fichier(contenu, "plan.pdf"));
  assert.equal(r.ok, true, r.message);
});

test("envoi depuis un autre site refusé, même site accepté", async () => {
  const requete = (origine) => {
    const donnees = new FormData();
    for (const [nom, valeur] of Object.entries({ prenom: "Jeanne", nom: "Dupré", email: "jeanne@societe.fr", telephone: "06 12 34 56 78" })) donnees.set(nom, valeur);
    const brouillon = new Request("https://www.sobima.fr/api/contact", { method: "POST", body: donnees });
    return brouillon.arrayBuffer().then((corps) => new Request(brouillon.url, {
      method: "POST",
      body: corps,
      headers: { "Content-Type": brouillon.headers.get("Content-Type"), "Content-Length": String(corps.byteLength), Accept: "application/json", ...(origine ? { Origin: origine } : {}) },
    }));
  };
  const env = { ENVOI_SIMULE: "1" };
  assert.equal((await traiterContact(await requete("https://evil.example"), env)).status, 403);
  assert.equal((await traiterContact(await requete("https://www.sobima.fr"), env)).status, 200);
  assert.equal((await traiterContact(await requete(null), env)).status, 200);
});

test("les réponses /api portent HSTS", async () => {
  const r = await traiterContact(new Request("https://www.sobima.fr/api/contact"), {});
  assert.equal(r.status, 405);
  assert.match(r.headers.get("strict-transport-security"), /max-age=31536000/);
});
