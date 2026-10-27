/* Suggestions d'adresses : GET /api/adresse?q=…
   Relais vers la Base Adresse Nationale (Géoplateforme de l'IGN) : le navigateur du visiteur ne contacte aucun tiers.
   Réponse : { adresses: [{ libelle, id }] } (id = identifiant BAN). */

import { ENTETES_SECURITE } from "./contact.js";

const API_BAN = "https://data.geopf.fr/geocodage/search";

const json = (statut, corps, cache = "no-store") =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...ENTETES_SECURITE, "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache } });

export async function traiterAdresse(request, env) {
  if (request.method !== "GET") return json(405, { adresses: [] });
  const q = (new URL(request.url).searchParams.get("q") || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  // La BAN demande au moins 3 caractères, dont un alphanumérique en début de requête
  if (q.length < 3 || q.length > 200 || !/^[\p{L}\p{N}]/u.test(q)) return json(200, { adresses: [] });

  if (env.LIMITE_ADRESSE) {
    const { success } = await env.LIMITE_ADRESSE.limit({ key: request.headers.get("CF-Connecting-IP") || "inconnue" });
    if (!success) return json(429, { adresses: [] });
  }

  const url = new URL(API_BAN);
  url.searchParams.set("q", q);
  url.searchParams.set("index", "address");
  url.searchParams.set("autocomplete", "1");
  url.searchParams.set("limit", "5");
  try {
    const reponse = await fetch(url, { headers: { Accept: "application/json" }, cf: { cacheTtl: 86400, cacheEverything: true }, signal: AbortSignal.timeout(4000) });
    if (!reponse.ok) return json(502, { adresses: [] });
    const donnees = await reponse.json();
    const adresses = (donnees.features || [])
      .map((f) => ({ libelle: String(f.properties?.label || "").slice(0, 200), id: String(f.properties?.id || "").slice(0, 80) }))
      .filter((a) => a.libelle && a.id);
    return json(200, { adresses }, "public, max-age=3600");
  } catch {
    // BAN indisponible : le champ reste en saisie libre
    return json(502, { adresses: [] });
  }
}
