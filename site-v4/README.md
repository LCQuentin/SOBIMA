# Site SOBIMA — v4

Site vitrine de SOBIMA, contractant général en aménagement de bureaux à Paris et en Île-de-France. HTML et CSS statiques, sans outil de build ; un seul petit script (animation du puzzle), le site restant complet sans lui.

## Démarrage rapide

```sh
cd site-v4
python3 -m http.server 8765
# puis ouvrir http://localhost:8765/
```

## Déploiement (Cloudflare Pages, offre gratuite)

Déposer le dossier `site-v4/` tel quel (dépôt Git ou envoi direct). Aucune commande de build, dossier de sortie = racine.
Cloudflare Pages sert `prestations.html` à l'adresse `/prestations` : les balises `canonical`, `og:url` et `sitemap.xml` utilisent déjà cette forme. À vérifier au premier déploiement.

## Démo en ligne

- Adresse : https://sobima-demo.bonjour-cf3.workers.dev (non indexée : `X-Robots-Tag: noindex` ajouté à la copie de démo).
- Hébergée sur le compte Cloudflare de Quentin, en **Workers avec fichiers statiques** : wrangler 4.151 ne crée plus de projet Pages classique et redirige vers Workers. La mise en ligne définitive se fera sur le compte de Redoine (Pages ou Workers, à trancher).
- Redéployer : copier `site-v4/` sans `README.md` dans un dossier `deploy/`, ajouter `X-Robots-Tag: noindex, nofollow` sous `/*` dans `deploy/_headers`, puis `npx wrangler deploy` depuis le dossier parent avec ce `wrangler.jsonc` :
  `{"name": "sobima-demo", "compatibility_date": "2026-10-19", "assets": {"directory": "./deploy", "not_found_handling": "404-page", "html_handling": "auto-trailing-slash"}}`
- Vérifié en ligne le 2026-10-22 : pages 200, vraie 404 à toute profondeur, `prestations.html` redirigé (307) vers `/prestations`, en-têtes de sécurité présents, cache d'un an sur les polices, README non publié.

## Structure

| Fichier | Rôle |
|---|---|
| `*.html` (10 pages) | accueil, prestations, méthode, expérience (`references.html`), à propos, test fit, réemploi, FAQ, contact, mentions légales |
| `assets/tokens.css` | couleurs, polices, espacements du design system (piste A « Plan d'implantation »), copiés de `documents/charte/` — seul ajout : le bloc `prefers-color-scheme: dark`, à garder identique au bloc `[data-theme="dark"]` juste au-dessus |
| `assets/bundle.css` | composants `sb-` du design system — même règle |
| `assets/site.css` | mise en page du site, uniquement à partir des tokens |
| `assets/fonts/` | Montserrat, Schibsted Grotesk, JetBrains Mono, avec leurs licences `*-OFL.txt` (SIL OFL 1.1, dépôt google/fonts) |
| `assets/img/logo-trait.svg` | logo en traits seuls, fond transparent, vectorisé avec potrace depuis `logo-sobima.png` ; intégré dans chaque page sous forme de symbole SVG (`<use href="#logo-trait">`) au moment de l'assemblage, couleur encre, suit le mode nuit ; fonctionne aussi en ouvrant les fichiers directement (`file://`). **Variante à valider par Redoine** (la charte dit de ne pas recolorer le logo) |
| `assets/img/puzzle.svg` | le même puzzle découpé en cadre + 4 pièces (`#cadre`, `#p_hg`, `#p_hd`, `#p_bg`, `#p_bd`), intégré dans l'accueil (symboles SVG) pour l'animation ; le fichier reste la source |
| `assets/img/og-sobima.jpg` | image de partage 1 200 × 630 (réseaux sociaux, messageries) |
| `404.html` | page d'erreur servie par Cloudflare Pages (`noindex`, `<base href="/">` pour fonctionner à toute profondeur d'URL) |
| `_headers` | en-têtes Cloudflare : sécurité de base, cache long des polices |
| `assets/img/` | logo officiel, portrait |

Le thème sombre suit le réglage du système (`prefers-color-scheme`). Pour la démo, un bouton temporaire « Mode jour / Mode nuit » (seul JavaScript du site) force l'un ou l'autre et mémorise le choix dans le navigateur. Les valeurs sombres automatiques sont dans `tokens.css`. Les tailles de texte de `site.css` sont en rem (elles suivent la taille de police choisie par le visiteur) ; `site.css` surcharge en rem les tailles en px des composants de `bundle.css`.

## Avant la mise en ligne

- **Supprimer tous les repères `<mark class="a-confirmer">`** (13 au 2026-10-22) : `grep -c a-confirmer *.html`.
- **Retirer le bouton jour / nuit temporaire** : supprimer `assets/theme-temporaire.js`, la ligne `<script src="assets/theme-temporaire.js">` des 10 pages et le bloc « TEMPORAIRE » en fin de `site.css`.
- Confirmer le domaine (`www.sobima.fr` partout).
- Vérifier les mentions sensibles, y compris dans les `<title>` et meta descriptions : `grep -n "CBRE\|Montreuil\|La Défense" *.html` — seule la mention « trois ans chez CBRE » est validée ; aucune référence de projet CBRE.

## Changer une coordonnée ou un chiffre

Il n'y a pas de fichier de données unique (choix d'un site sans build) : chercher la valeur dans toutes les pages et la remplacer partout.

| Donnée | Rechercher |
|---|---|
| Téléphone | `+33 6 58 94 36 97` (affiché) et `+33658943697` (liens `tel:`) |
| E-mail | `redoine@sobima.fr` |
| Adresse | `173 rue de Courcelles` |
| Capital, RCS | `1 000 €`, `130 822 281` |
| Ratio d'occupation | `10 m²` |
| Durée des travaux | `deux à trois mois` |
| Délai du test fit | `48 h` |
| Expérience | `quarantaine`, `1 500 m²` |

La source des faits et chiffres est la note du vault Cortex `02_Projets/SOBIMA/Contenus du site - SOBIMA (v1).md` (§ 2).

## Formulaire

**Feuille de route v2 (décision du 2026-10-22)** : formulaire de demande de test fit / devis via une Cloudflare Pages Function, à arbitrer avec Redoine selon l'hébergement des e-mails de `sobima.fr` (Email Routing Cloudflare ou service d'envoi type Resend). C'est le principal point faible relevé par les trois critiques Impeccable (21 → 22 → 21/32).


Pas de formulaire en v1 (décision du 2026-10-21) : boutons d'appel et e-mails pré-remplis. Un formulaire pourra être branché plus tard avec une Cloudflare Pages Function, selon l'hébergement des e-mails de `sobima.fr`.

## Problèmes connus

- Logo en traits : variante monochrome de la charte, à faire valider par Redoine. Le badge caramel officiel reste utilisé pour le favicon et l'image de partage.
- Animation du puzzle (accueil, section « Un seul interlocuteur ») : `assets/puzzle.js` (12 lignes, sans dépendance, chargé sur l'accueil seulement) déclenche une fois l'assemblage quand le puzzle entre à l'écran ; transitions CSS de 0,9 s. Sans JavaScript, ou si le visiteur a demandé à réduire les mouvements, le puzzle s'affiche assemblé. C'est le seul JavaScript durable du site (accord du 2026-10-22).

- Liens internes en `.html` : Cloudflare Pages les redirige vers l'URL sans extension (une redirection par clic). Gardé volontairement pour que le site s'ouvre en local avec un simple serveur statique ; à revoir après le premier déploiement.
- Les tailles de `bundle.css` (design system) restent en px ; `site.css` les surcharge en rem pour les composants utilisés. À reporter dans la charte si elle évolue.

- 13 repères `a-confirmer` affichés à l'écran (voulu pour la démo, à retirer avant la mise en ligne).
- Citer La Défense, l'immeuble haussmannien et le projet de Montreuil reste à valider par Redoine (« trois ans chez CBRE » validé le 2026-10-21 ; aucune référence de projet CBRE).
- Bouton jour / nuit temporaire (JavaScript) à retirer avant la mise en ligne.
- Pas de formulaire : contact par téléphone et e-mail pré-rempli.
- Pas de photos de chantiers : visuels hachurés en attente.
- Le plan d'implantation de l'accueil et du test fit est un exemple illustratif (cotes marquées « exemple »).

## Journal

- 2026-10-21 — Création de la v4 : 10 pages HTML/CSS pur, design system piste A, textes v1 tirés des notes de l'entretien du 21/10. Vérifié en local : 375 / 768 / 1 100 / 1 280 px, thèmes clair et sombre, sans débordement horizontal, polices chargées, liens internes et JSON-LD valides.
- 2026-10-21 — Textes mis à jour d'après la transcription de l'entretien : « contractant général » relégué au rôle d'explication, deux façons de chiffrer, trois devis BC/SPS, déménagement coordonné, architecte du client, propriétaires et investisseurs, suivi hebdomadaire, encart base vie, réemploi complété, deux questions FAQ ; mention CBRE validée.
- 2026-10-21 — Ajout d'un bouton temporaire jour / nuit pour la démo (`assets/theme-temporaire.js`).
- 2026-10-21 — Passe issue de la critique Impeccable (21/32) : tableau et plan corrigés sur mobile, barre d'action mobile (Test fit / Appeler), accroche « Vous visitez un local ? », libellés distincts page / e-mail et modèle pré-rempli unique, consigne sans plan, fondateur remonté avant le Test fit, voile du hero, bandeau en ligne, signature du pied de page.
- 2026-10-21 — Passe polish : CSS mort retiré (formulaire maquetté, ancien bandeau), styles en ligne remplacés par des classes, cibles tactiles ≥ 44 px sur mobile, mentions légales alignées, nombres et unités insécables, signature du pied de page pleine largeur.
- 2026-10-22 — Passe issue de la 2e critique (22/32) : page Test fit sans renvoi vers elle-même (barre mobile, en-tête et menu → « Envoyer mon plan »), lien e-mail pré-rempli centralisé, adresse visible dans le bloc Test fit de l'accueil, test fit / devis distingués, suite hors Île-de-France, ligne de preuve sous le CTA, piliers en une ligne, méthode en nomenclature de plan (accueil et Méthode), fiche fondateur en 14 px, trame uniforme dans le premier écran, soulignement encre, table de réunion en contour.
- 2026-10-22 — 3e critique Impeccable (21/32) : arrêt des passes de design, place à l'audit technique et aux retours de Redoine ; formulaire inscrit en v2.
- 2026-10-22 — Passe issue de l'audit Impeccable (16/20) : page 404, `_headers`, licences OFL, image de partage, tailles en rem, trame atténuée en haut des pages internes, largeur des encadrés, boutons qui passent à la ligne, mode sombre automatique déplacé dans `tokens.css`, deux erreurs de texte corrigées.
- 2026-10-22 — Césure automatique des titres retirée (coupait des mots alors qu'il restait de la place) ; seule la coupure de secours des mots trop longs est gardée.
- 2026-10-22 — Pied de page : marge de 32 px rétablie entre le filet de la signature et le logo (annulée par la règle .pied p).
- 2026-10-22 — Logo vectorisé (potrace) en version traits, couleur encre, en en-tête et pied ; puzzle du logo découpé en 4 pièces qui s'assemblent au défilement à côté de « Un seul interlocuteur » (geste offert, voir Sobima.md).
- 2026-10-22 — Logo et puzzle intégrés dans les pages (symboles SVG) au lieu d'un masque CSS et de `<use>` externes, que Chrome bloque quand le site est ouvert en `file://`.
- 2026-10-22 — Animation du puzzle refaite : déclenchée une fois à l'entrée à l'écran (puzzle.js + transitions) au lieu d'être liée au défilement (état intermédiaire figé sur Chrome, rien sur Firefox).
- 2026-10-22 — Démo publiée sur https://sobima-demo.bonjour-cf3.workers.dev ; `_headers` : cache des polices sans cumul avec la règle générale.
- 2026-10-22 — Ruban des quatre métiers en défilement continu (séparateurs en lignes de cote, pause au survol, ligne fixe en mouvement réduit) ; fiche fondateur : « +40 » chantiers (Redoine a dit « à peu près une quarantaine » : à confirmer).
- 2026-10-22 — FAQ en deux colonnes sur ordinateur : questions dans une colonne lisible (réponses à 72 caractères), aparté de contact collant ; bloc bleu du bas transformé en appel au test fit.
- 2026-10-22 — Premier écran : définition du test fit en police de texte sous le bouton, preuve en fiche de cotes (Interlocuteur · Expérience · Chantiers +40) au lieu de deux paragraphes en mono.
- 2026-10-22 — Mentions légales : TVA FR05130822281 (clé vérifiée sur le SIREN), hébergeur Cloudflare, Inc. (adresse du rapport SEC FY2025), « aucun cookie, aucun outil de mesure d'audience », section assurance retirée (aucune obligation d'affichage sur le site trouvée ; obligatoire sur devis et factures). Fiche de preuve retirée du premier écran.
- 2026-10-22 — Téléphone affiché au format international (+33 6 58 94 36 97) sur toutes les pages.
