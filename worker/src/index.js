/* Worker du site SOBIMA : sert les pages statiques de site-v4/ et traite les deux routes /api.
   Les traitements sont des fonctions (request, env), réutilisables telles quelles en Pages Functions si l'hébergement final est Pages. */

import { traiterContact } from "./contact.js";
import { traiterAdresse } from "./adresse.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") return traiterContact(request, env);
    if (pathname === "/api/adresse") return traiterAdresse(request, env);
    if (pathname.startsWith("/api/")) return new Response("Introuvable", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
