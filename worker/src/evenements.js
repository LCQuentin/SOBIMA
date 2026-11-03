/* Compteurs de conversions, sans cookie ni identifiant visiteur.
   Les événements sont écrits dans Workers Analytics Engine (dataset sobima_evenements).
   Cloudflare Web Analytics ne sait pas tracer d'événements personnalisés : ce compteur
   first-party complète ses pages vues, il ne les remplace pas. */

const EVENEMENTS = new Set(["devis_envoye", "clic_telephone", "clic_email"]);
const TAILLE_MAX_CORPS = 2048;

const reponse = (statut) => new Response(null, { status: statut });

function memeOrigine(request) {
  const origine = request.headers.get("Origin");
  if (!origine) return true;
  return origine === new URL(request.url).origin;
}

function cheminPage(valeur) {
  if (typeof valeur !== "string" || !valeur.startsWith("/")) return "";
  return valeur.split("?")[0].split("#")[0].slice(0, 160);
}

export async function traiterEvenement(request, env) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  if (!memeOrigine(request)) return reponse(403);

  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().startsWith("application/json")) return reponse(415);

  const longueur = Number(request.headers.get("Content-Length") || 0);
  if (longueur > TAILLE_MAX_CORPS) return reponse(413);

  const texte = await request.text();
  if (texte.length > TAILLE_MAX_CORPS) return reponse(413);

  let donnees;
  try {
    donnees = JSON.parse(texte);
  } catch {
    return reponse(400);
  }

  if (!donnees || typeof donnees !== "object" || !EVENEMENTS.has(donnees.evenement)) {
    return reponse(422);
  }

  if (env.LIMITE_EVENEMENT) {
    const cle = request.headers.get("CF-Connecting-IP") || "anonyme";
    const { success } = await env.LIMITE_EVENEMENT.limit({ key: cle });
    if (!success) return reponse(429);
  }

  try {
    env.EVENEMENTS.writeDataPoint({
      indexes: [donnees.evenement],
      blobs: [donnees.evenement, cheminPage(donnees.page)],
    });
  } catch {
    // La mesure ne doit jamais casser la navigation.
  }

  return reponse(204);
}
