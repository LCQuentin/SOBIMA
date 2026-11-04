/* Formulaire de contact : POST /api/contact (multipart/form-data).
   Avec JavaScript, la page envoie l'en-tête Accept: application/json et reçoit une réponse JSON.
   Sans JavaScript, le navigateur est redirigé (303) vers /merci ou /envoi-impossible. */

import { verifierPlan, TAILLE_MAX_FICHIER, MESSAGE_TROP_GROS } from "./fichiers.js";

const TAILLE_MAX_REQUETE = TAILLE_MAX_FICHIER + 256 * 1024; // plan + champs texte
const LONGUEURS = { prenom: 80, nom: 80, societe: 120, email: 254, telephone: 30, adresse: 200, adresse_ban: 80, message: 3000 };

export const HSTS = "max-age=31536000; includeSubDomains";

export const ENTETES_SECURITE = {
  "Strict-Transport-Security": HSTS,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cache-Control": "no-store",
};

function repondre(request, statut, corps) {
  const veutJson = (request.headers.get("Accept") || "").includes("application/json");
  if (veutJson) {
    return new Response(JSON.stringify(corps), { status: statut, headers: { ...ENTETES_SECURITE, "Content-Type": "application/json; charset=utf-8" } });
  }
  const cible = corps.ok ? "/merci" : "/envoi-impossible";
  return new Response(null, { status: 303, headers: { ...ENTETES_SECURITE, Location: new URL(cible, request.url).toString() } });
}

const erreur = (request, statut, message, erreurs = {}) => repondre(request, statut, { ok: false, message, erreurs });

/* Texte d'un champ : chaîne, espaces superflus retirés, longueur bornée. */
function champ(donnees, nom) {
  const valeur = donnees.get(nom);
  return typeof valeur === "string" ? valeur.trim().slice(0, LONGUEURS[nom] ?? 200) : "";
}

/* Pour l'objet du mail et les en-têtes : une seule ligne. */
const uneLigne = (texte) => texte.replace(/[\r\n\u2028\u2029]+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "");

const EMAIL = /^[^\s@<>()[\]",;:]+@[^\s@<>()[\]",;:]+\.[a-z]{2,}$/i;

export function verifierChamps(donnees) {
  const valeurs = {};
  for (const nom of Object.keys(LONGUEURS)) valeurs[nom] = champ(donnees, nom);
  const erreurs = {};
  if (!valeurs.prenom) erreurs.prenom = "Indiquez votre prénom.";
  if (!valeurs.nom) erreurs.nom = "Indiquez votre nom.";
  if (!EMAIL.test(valeurs.email)) erreurs.email = "Indiquez une adresse e-mail valide, par exemple nom@societe.fr.";
  const chiffres = valeurs.telephone.replace(/\D/g, "");
  if (chiffres.length < 9 || chiffres.length > 15 || /[^\d\s+().-]/.test(valeurs.telephone)) erreurs.telephone = "Indiquez un numéro de téléphone valide, par exemple 06 12 34 56 78.";
  return { valeurs, erreurs };
}

function texteMail(v, plan) {
  const lignes = [
    "Nouvelle demande depuis le formulaire de contact du site.",
    "",
    `Nom : ${v.prenom} ${v.nom}`,
    `Société : ${v.societe || "non précisée"}`,
    `E-mail : ${v.email}`,
    `Téléphone : ${v.telephone}`,
    `Adresse du local : ${v.adresse ? `${v.adresse} (${v.adresse_ban ? "reconnue dans la Base Adresse Nationale" : "saisie libre, non reconnue"})` : "non précisée"}`,
    `Plan joint : ${plan ? `oui (${plan.nomEnvoi}, fichier d'origine « ${plan.nomOrigine} », ${Math.max(1, Math.ceil(plan.octets.length / 1024))} Ko)` : "non"}`,
    "",
    "Projet :",
    v.message || "(aucun message)",
    "",
    "Répondre à ce mail répond directement à la personne.",
  ];
  return lignes.join("\n");
}

function base64(octets) {
  if (typeof octets.toBase64 === "function") return octets.toBase64(); // natif, environ 20 fois plus rapide
  let binaire = "";
  for (let i = 0; i < octets.length; i += 32768) binaire += String.fromCharCode.apply(null, octets.subarray(i, i + 32768));
  return btoa(binaire);
}

export async function traiterContact(request, env) {
  if (request.method !== "POST") return new Response("Méthode non autorisée", { status: 405, headers: { ...ENTETES_SECURITE, Allow: "POST" } });

  // Envoi depuis un autre site refusé. Un navigateur envoie toujours Origin sur un POST ; sans cet en-tête, la requête ne vient pas d'un formulaire tiers.
  const origine = request.headers.get("Origin");
  if (origine && origine !== new URL(request.url).origin) return erreur(request, 403, "Requête invalide.");

  // Taille vérifiée avant de lire le corps (formData() charge tout en mémoire)
  const longueur = Number(request.headers.get("Content-Length"));
  if (!longueur) return erreur(request, 411, "Requête invalide.");
  if (longueur > TAILLE_MAX_REQUETE) return erreur(request, 413, MESSAGE_TROP_GROS, { plan: MESSAGE_TROP_GROS });
  if (!(request.headers.get("Content-Type") || "").startsWith("multipart/form-data")) return erreur(request, 415, "Requête invalide.");

  if (env.LIMITE_CONTACT) {
    const { success } = await env.LIMITE_CONTACT.limit({ key: request.headers.get("CF-Connecting-IP") || "inconnue" });
    if (!success) return erreur(request, 429, "Trop de demandes envoyées. Réessayez dans une minute, ou appelez-nous.");
  }

  let donnees;
  try {
    donnees = await request.formData();
  } catch {
    return erreur(request, 400, "Requête invalide.");
  }

  // Champ piège invisible pour les humains : un robot qui le remplit reçoit une réponse « envoyé » sans envoi
  if (champ(donnees, "site_web")) return repondre(request, 200, { ok: true });

  const { valeurs, erreurs } = verifierChamps(donnees);
  let plan = null;
  const fichier = donnees.get("plan");
  if (fichier && typeof fichier === "object" && fichier.size > 0) {
    if (donnees.getAll("plan").filter((f) => typeof f === "object" && f.size > 0).length > 1) {
      erreurs.plan = "Joignez un seul fichier.";
    } else {
      const resultat = await verifierPlan(fichier, `plan-${valeurs.prenom}-${valeurs.nom}`);
      if (resultat.ok) plan = resultat;
      else erreurs.plan = resultat.message;
    }
  }
  if (Object.keys(erreurs).length) return erreur(request, 422, "Certains champs sont à corriger.", erreurs);

  const message = {
    from: env.CONTACT_EXPEDITEUR,
    to: [env.CONTACT_DESTINATAIRE],
    reply_to: uneLigne(valeurs.email),
    subject: uneLigne(`Demande de contact : ${valeurs.prenom} ${valeurs.nom}${valeurs.societe ? ` (${valeurs.societe})` : ""}`),
    text: texteMail(valeurs, plan),
  };
  // Resend déduit le type du nom ; ce nom est fixé ici d'après le contenu réel du fichier
  if (plan) message.attachments = [{ filename: plan.nomEnvoi, content: base64(plan.octets) }];

  // Mode simulé : uniquement si ENVOI_SIMULE=1 est posé explicitement (fichier .dev.vars en local)
  if (env.ENVOI_SIMULE === "1") {
    console.log("[contact] envoi simulé", JSON.stringify({ ...message, attachments: plan ? [{ filename: plan.nomEnvoi, octets: plan.octets.length, mime: plan.mime }] : [] }));
    return repondre(request, 200, { ok: true });
  }

  // Échec fermé : sans configuration d'envoi, on ne dit jamais « envoyé »
  if (!env.RESEND_API_KEY || !env.CONTACT_EXPEDITEUR || !env.CONTACT_DESTINATAIRE) {
    console.error("[contact] configuration d'envoi incomplète");
    return erreur(request, 503, "L'envoi est momentanément indisponible. Appelez-nous ou écrivez à contact@sobima.fr.");
  }

  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!reponse.ok) {
      console.error("[contact] Resend a refusé l'envoi", reponse.status, (await reponse.text()).slice(0, 500));
      return erreur(request, 502, "L'envoi a échoué. Appelez-nous ou écrivez à contact@sobima.fr.");
    }
  } catch (e) {
    console.error("[contact] Resend injoignable", String(e));
    return erreur(request, 502, "L'envoi a échoué. Appelez-nous ou écrivez à contact@sobima.fr.");
  }
  return repondre(request, 200, { ok: true });
}
