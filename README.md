# SOBIMA — site internet

Site vitrine de **SOBIMA**, contractant général en aménagement de bureaux et d'espaces commerciaux à Paris et en Île-de-France.

HTML et CSS statiques, sans outil de build. Un Worker Cloudflare sert les pages et traite le formulaire de contact.

- Démo : https://sobima-demo.bonjour-cf3.workers.dev
- Version courante : `site-v4/` (10 pages)
- Documentation détaillée : [`site-v4/README.md`](site-v4/README.md)

## Contenu du dépôt

| Dossier | Rôle |
|---|---|
| `site-v4/` | **Version courante** du site (design system « Plan d'implantation », textes v1, 10 pages) |
| `worker/` | Worker Cloudflare : sert `site-v4/`, traite `/api/contact` (Resend) et `/api/adresse` (BAN) |
| `documents/` | Charte, maquettes et documents de travail |
| `site/`, `site-v2/`, `site-v3/` | Versions précédentes, conservées pour historique. `site-v3/` est gelé. |
| `prototypes/` | Prototypes et essais |

## Démarrage rapide

```sh
cd worker
cp .dev.vars.example .dev.vars   # ENVOI_SIMULE=1 : le mail est écrit dans la console
npx wrangler dev --port 8787
# ouvrir http://localhost:8787/
node --test test/                # tests du formulaire et des fichiers
```

Un simple `python3 -m http.server` dans `site-v4/` affiche les pages, mais sans le formulaire (pas de route `/api`).

## Déploiement

Le site est servi par le Worker `worker/` : fichiers statiques de `site-v4/` et routes `/api/contact`, `/api/adresse`. Aucune commande de build.

```sh
cd worker
npx wrangler secret put RESEND_API_KEY   # une fois, sur le compte Cloudflare de SOBIMA
npx wrangler deploy
```

Les domaines `www.sobima.fr` et `sobima.fr` sont déclarés dans `worker/wrangler.jsonc` (`routes` avec `custom_domain`) : le déploiement les attache au Worker. La zone Cloudflare doit être active et les anciens `A`/`CNAME` Squarespace supprimés au préalable. `www` reste l'adresse canonique.

Avant chaque mise en ligne qui touche aux styles, changer le numéro `?v=` de `tokens.css`, `bundle.css` et `site.css` dans toutes les pages (cache d'un jour sur `/assets/*`).

## Avant la mise en ligne définitive

- Supprimer les repères `<mark class="a-confirmer">` : `grep -rc a-confirmer site-v4/*.html site-v4/references/`
- Confirmer le domaine (`www.sobima.fr` partout).
- Vérifier les mentions sensibles (`CBRE`, `Montreuil`, `La Défense`).
- Remplacer les photos d'ambiance par les rendus et photos de SOBIMA.

## Repères

- Les consignes pour les IA sont dans [`AGENTS.md`](AGENTS.md).
- Les logos `site/assets/logo-sobima*.svg` sont reconstitués et **faux** ; le logo officiel est le puzzle en contour blanc sur caramel `#C49E5F`.
- Les notes de projet (spec, contenus, glossaire, chiffres) vivent dans le vault Cortex, `02_Projets/SOBIMA/`.
