/* Contrôle du plan joint au formulaire de contact.
   Le fichier n'est jamais stocké ni republié sur le site : il part en pièce jointe vers contact@sobima.fr.
   On décide du type d'après le contenu réel (signature), pas d'après le nom ni le type annoncé par le navigateur. */

/* 2 Mo : le contrôle complet d'un PDF coûte environ 3,5 ms de CPU par Mo, et l'offre gratuite de Workers coupe à 10 ms
   par requête (décision du 2026-10-27 : rester gratuit ; les plans plus lourds passent par l'e-mail). */
export const TAILLE_MAX_FICHIER = 2 * 1024 * 1024;
export const MESSAGE_TROP_GROS = "Le fichier dépasse 2 Mo : envoyez-le à contact@sobima.fr, ou joignez une version allégée.";

const FORMATS = {
  pdf: { mime: "application/pdf", libelle: "PDF" },
  jpg: { mime: "image/jpeg", libelle: "JPG" },
  png: { mime: "image/png", libelle: "PNG" },
  dwg: { mime: "image/vnd.dwg", libelle: "DWG" },
  dxf: { mime: "image/vnd.dxf", libelle: "DXF" },
};
const EXTENSIONS = { pdf: "pdf", jpg: "jpg", jpeg: "jpg", png: "png", dwg: "dwg", dxf: "dxf" };

/* Mots-clés PDF qui déclenchent une action (script, lancement de programme, fichier embarqué).
   Limite connue : un mot-clé caché dans un flux compressé (object stream) n'est pas vu. */
const PDF_ACTIFS = /\/(JavaScript|JS|Launch|EmbeddedFiles?|RichMedia)\b/;

function commencePar(octets, signature) {
  if (octets.length < signature.length) return false;
  return signature.every((octet, i) => octets[i] === octet);
}

// Décodage natif (rapide) quand le moteur le permet ; sinon conversion par blocs
let decodeurLatin1 = null;
try { decodeurLatin1 = new TextDecoder("latin1"); } catch { /* moteur sans latin1 */ }

function texteLatin1(octets, limite = octets.length) {
  if (decodeurLatin1) return decodeurLatin1.decode(octets.subarray(0, limite));
  let texte = "";
  const fin = Math.min(limite, octets.length);
  for (let i = 0; i < fin; i += 8192) {
    texte += String.fromCharCode.apply(null, octets.subarray(i, Math.min(i + 8192, fin)));
  }
  return texte;
}

/* Détecte le format d'après la signature. Renvoie "pdf", "jpg", "png", "dwg", "dxf" ou null. */
export function detecterFormat(octets) {
  if (commencePar(octets, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf"; // %PDF-
  if (commencePar(octets, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (commencePar(octets, [0xff, 0xd8, 0xff])) return "jpg";
  const debut = texteLatin1(octets, 4096);
  if (/^AC10(1[2-9]|2\d|3[0-2])/.test(debut)) return "dwg"; // AutoCAD R13 (AC1012) à 2018 (AC1032)
  if (debut.startsWith("AutoCAD Binary DXF\r\n\x1a\x00")) return "dxf";
  // DXF texte : commentaires 999 facultatifs, puis le groupe « 0 / SECTION », et aucun octet nul
  if (/^\s*(999\r?\n[^\n]*\r?\n\s*)*0\r?\n\s*SECTION\r?\n/.test(debut) && !octets.subarray(0, 65536).includes(0)) return "dxf";
  return null;
}

/* Nom d'origine affichable sans risque dans l'e-mail : sans caractères de contrôle ni inversion bidi (« plan\u202Efdp.exe »). */
export function nettoyerNom(nom) {
  return String(nom || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202E\u2066-\u2069\ufeff]/g, "")
    .slice(0, 120);
}

function extension(nom) {
  const m = /\.([a-z0-9]{1,5})$/i.exec(nom);
  return m ? m[1].toLowerCase() : "";
}

/* Vérifie le fichier. Renvoie { ok: true, octets, format, mime, nomEnvoi, nomOrigine } ou { ok: false, message }. */
export async function verifierPlan(fichier, prefixeNom = "plan") {
  const nomOrigine = nettoyerNom(fichier.name);
  const ext = EXTENSIONS[extension(nomOrigine)];
  const acceptes = "PDF, JPG, PNG, DWG ou DXF";
  if (!ext) return { ok: false, message: `Format non accepté : envoyez un fichier ${acceptes}.` };
  if (fichier.size === 0) return { ok: false, message: "Le fichier est vide." };
  if (fichier.size > TAILLE_MAX_FICHIER) return { ok: false, message: MESSAGE_TROP_GROS };

  const octets = new Uint8Array(await fichier.arrayBuffer());
  if (octets.length > TAILLE_MAX_FICHIER) return { ok: false, message: MESSAGE_TROP_GROS };

  const format = detecterFormat(octets);
  if (!format) return { ok: false, message: `Ce fichier n'est pas un ${acceptes} valide.` };
  if (format !== ext) return { ok: false, message: `Le contenu du fichier ne correspond pas à son extension (.${extension(nomOrigine)}).` };

  if (format === "pdf") {
    // Noms PDF écrits en hexadécimal (#4A#53 pour JS) ramenés à leur forme lisible avant la recherche
    const brut = texteLatin1(octets);
    const actif = PDF_ACTIFS.test(brut) || (brut.includes("#") && PDF_ACTIFS.test(brut.replace(/#([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))));
    if (actif) return { ok: false, message: "Ce PDF contient du contenu actif (script ou fichier embarqué). Exportez le plan en PDF simple ou en image." };
  }

  const prefixe = prefixeNom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "plan";
  return { ok: true, octets, format, mime: FORMATS[format].mime, nomEnvoi: `${prefixe}.${format}`, nomOrigine };
}
