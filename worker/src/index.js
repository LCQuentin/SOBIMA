/* Worker du site SOBIMA : sert les pages statiques de site-v4/ et traite les deux routes /api.
   Les traitements sont des fonctions (request, env), réutilisables telles quelles en Pages Functions si l'hébergement final est Pages. */

import { traiterContact, HSTS } from "./contact.js";
import { traiterAdresse } from "./adresse.js";
import { traiterEvenement } from "./evenements.js";

const DOMAINE_APEX = "sobima.fr";
const DOMAINE_CANONIQUE = "www.sobima.fr";

/* RFC 9116 : Contact et Expires obligatoires. */
const SECURITY_TXT = [
  "Contact: mailto:contact@sobima.fr",
  "Expires: 2027-11-04T00:00:00.000Z",
  "Preferred-Languages: fr, en",
  "Canonical: https://www.sobima.fr/.well-known/security.txt",
  "",
].join("\n");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === DOMAINE_APEX) {
      url.hostname = DOMAINE_CANONIQUE;
      url.protocol = "https:";
      return new Response(null, { status: 301, headers: { Location: url.toString(), "Strict-Transport-Security": HSTS } });
    }
    const { pathname } = url;
    if (pathname === "/.well-known/security.txt") {
      return new Response(SECURITY_TXT, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400",
          "X-Content-Type-Options": "nosniff",
          "Strict-Transport-Security": HSTS,
        },
      });
    }
    if (pathname === "/api/contact") return traiterContact(request, env);
    if (pathname === "/api/adresse") return traiterAdresse(request, env);
    if (pathname === "/api/evenement") return traiterEvenement(request, env);
    if (pathname.startsWith("/api/")) return new Response("Introuvable", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
