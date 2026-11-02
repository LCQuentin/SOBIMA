# Consignes pour les IA — site SOBIMA

Site internet de SOBIMA (contractant général en aménagement de bureaux), en HTML et CSS statiques, non déployé. Cible de déploiement : Cloudflare (offre gratuite), sans build. JavaScript limité à trois petits scripts facultatifs (animations de l'accueil, formulaire de contact, fermeture du menu mobile) ; le site reste utilisable sans eux.
- `worker/` : Worker Cloudflare qui sert `site-v4/` et traite le formulaire de contact (`/api/contact`, envoi par Resend) et les suggestions d'adresses (`/api/adresse`, BAN). Secrets dans `worker/.dev.vars` (ignoré par git) ou `wrangler secret`, jamais dans le dépôt. Tests : `node --test worker/test/`.

- `site-v4/` : **version courante** (2026-10-21). Design system piste A (`documents/charte/`), textes v1 issus de l'entretien du 2026-10-21, 10 pages. Lire `site-v4/README.md` (déploiement, repères `a-confirmer`, liste des chaînes à rechercher quand un chiffre change).

## À lire dans le vault Cortex avant toute tâche

| Quoi | Où |
|---|---|
| Objectif, arborescence, jalons | `~/Documents/Cortex/02_Projets/SOBIMA/Sobima.md` |
| Charte et design system | `~/Documents/Cortex/02_Projets/SOBIMA/DESIGN.md` |
| Périmètre du site | `~/Documents/Cortex/02_Projets/SOBIMA/Spec - Site internet SOBIMA (v0).md` |
| Mots-clés, concurrents, glossaire | les autres notes du même dossier |

⚠️ Le logo officiel est un puzzle en contour blanc sur caramel `#C49E5F`. Les anciennes versions (`site/`, `site-v2/`, `site-v3/`) ont été retirées de `main` ; elles restent dans l'historique Git.

## Règles

- Le code reste ici, les notes restent dans le vault. Quand un jalon est franchi, mettre à jour `Sobima.md`.
- Les vidéos SOBIMA sont dans `~/Video/SOBIMA/` (voir `~/Video/AGENTS.md`).
