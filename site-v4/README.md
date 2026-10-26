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
| `*.html` (9 pages) | accueil, prestations (avec la méthode, ancre `#methode`), expérience (`references.html`, masquée), à propos, test fit, réemploi, FAQ (lien en pied de page seulement), contact, mentions légales |
| `_redirects` | ancienne page Méthode (`/methode-contractant-general`) redirigée en 301 vers `/prestations#methode` |
| `references/association-400-m2-4-semaines.html` | fiche référence modèle (SPEC §4 : lieu, m², délai, prestations, avant / après), servie à `/references/association-400-m2-4-semaines` ; chemins relatifs en `../`. Pour une nouvelle fiche : copier ce fichier, changer le slug, le contenu, la canonical, le JSON-LD `BreadcrumbList`, et ajouter l'URL au sitemap |
| `assets/tokens.css` | couleurs, polices, espacements du design system (piste A « Plan d'implantation »), copiés de `documents/charte/` ; le bloc `[data-theme="dark"]` de la charte reste présent mais n'est utilisé par aucune page |
| `assets/bundle.css` | composants `sb-` du design system — même règle |
| `assets/site.css` | mise en page du site, uniquement à partir des tokens |
| `assets/fonts/` | Montserrat, Schibsted Grotesk (JetBrains Mono retirée le 2026-10-23), avec leurs licences `*-OFL.txt` (SIL OFL 1.1, dépôt google/fonts) |
| `assets/img/logo-trait.svg` | logo en traits seuls, fond transparent, vectorisé avec potrace depuis `logo-sobima.png` ; intégré dans chaque page sous forme de symbole SVG (`<use href="#logo-trait">`) au moment de l'assemblage, couleur encre, suit le mode nuit ; fonctionne aussi en ouvrant les fichiers directement (`file://`). **Variante à valider par Redoine** (la charte dit de ne pas recolorer le logo) |
| `assets/img/puzzle.svg` | le même puzzle découpé en cadre + 4 pièces (`#cadre`, `#p_hg`, `#p_hd`, `#p_bg`, `#p_bd`), intégré dans l'accueil (symboles SVG) pour l'animation ; le fichier reste la source |
| `assets/img/og-sobima.jpg` | image de partage 1 200 × 630 (réseaux sociaux, messageries), régénérée le 2026-10-23 à partir de l'accueil |
| `assets/img/piece.svg`, `piece-debut.svg` | pièce de puzzle de la frise des six étapes (accueil), utilisée comme masque CSS |
| `assets/img/ambiance-*.webp` | photos d'ambiance Unsplash (800 et 1 600 px), provenance dans `assets/img/CREDITS.md` ; à remplacer par les rendus et photos de Redoine |
| `favicon.svg`, `favicon.png`, `apple-touch-icon.png` | logo détouré en caramel, sans fond (l'icône Apple garde un fond beige `--calque`, iOS affichant sinon du noir) |
| `llms.txt` | synthèse structurée du site et des pages canoniques pour les moteurs de recherche IA (GEO) |
| `404.html` | page d'erreur servie par Cloudflare Pages (`noindex`, chemins absolus `/...` pour fonctionner à toute profondeur d'URL sans casser le lien d'évitement `#contenu`) |
| `_headers` | en-têtes Cloudflare : sécurité (CSP, COOP, X-Frame-Options), cache long des polices |
| `assets/img/` | logo officiel (portrait de Redoine retiré le 2026-10-23) |

Le site n'a qu'un thème clair, quel que soit le réglage de l'appareil (`<meta name="color-scheme" content="light">`, mode nuit retiré le 2026-10-26). Les tailles de texte de `site.css` sont en rem (elles suivent la taille de police choisie par le visiteur) ; `site.css` surcharge en rem les tailles en px des composants de `bundle.css`.

## Avant la mise en ligne

- **Supprimer tous les repères `<mark class="a-confirmer">`** (13 affichés au 2026-10-26, dont 2 sur la fiche référence, plus 1 dans la section « Votre interlocuteur » masquée en commentaire HTML dans `index.html`) : `grep -rc a-confirmer *.html references/`.
- Confirmer le domaine (`www.sobima.fr` partout).
- Vérifier les mentions sensibles, y compris dans les `<title>` et meta descriptions : `grep -rn "CBRE\|Montreuil\|La Défense" *.html references/`.

## Changer une coordonnée ou un chiffre

Il n'y a pas de fichier de données unique (choix d'un site sans build) : chercher la valeur dans toutes les pages et la remplacer partout.

| Donnée | Rechercher |
|---|---|
| Téléphone | `+33 6 58 94 36 97` (affiché) et `+33658943697` (liens `tel:`) |
| E-mail | `contact@sobima.fr` (boîte à créer par Redoine avant la mise en ligne) |
| Adresse | `173 rue de Courcelles` |
| Capital, RCS | `1 000 €` (seulement dans les mentions légales, obligation LCEN), `130 822 281` |
| Ratio d'occupation | `10 m²` |
| Durée des travaux | `deux à trois mois` |
| Délai du test fit | `48 h` |
| Libellé officiel | `bureaux et d'espaces commerciaux` (pied de page, accueil, JSON-LD) |

La source des faits et chiffres est la note du vault Cortex `02_Projets/SOBIMA/Contenus du site - SOBIMA (v1).md` (§ 2).

## Formulaire

**Feuille de route v2 (décision du 2026-10-22)** : formulaire de demande de test fit / devis via une Cloudflare Pages Function, à arbitrer avec Redoine selon l'hébergement des e-mails de `sobima.fr` (Email Routing Cloudflare ou service d'envoi type Resend). C'est le principal point faible relevé par les trois critiques Impeccable (21 → 22 → 21/32).


Pas de formulaire en v1 (décision du 2026-10-21) : boutons d'appel et e-mails pré-remplis. Un formulaire pourra être branché plus tard avec une Cloudflare Pages Function, selon l'hébergement des e-mails de `sobima.fr`.

## Problèmes connus

- Logo en traits : variante monochrome de la charte, à faire valider par Redoine. Le badge caramel officiel reste utilisé pour le favicon et l'image de partage.
- Animations du puzzle et de la frise : `assets/puzzle.js` (sans dépendance, chargé sur l'accueil seulement) déclenche une fois l'assemblage du puzzle (accueil, section « Un point de contact ») et l'emboîtement de chaque pièce de la frise des six étapes (accueil) quand elle est bien visible (60 % de l'étape à l'écran, hors 15 % du bas). Sans JavaScript, ou si le visiteur a demandé à réduire les mouvements, puzzle et frise s'affichent assemblés. Le ruban des métiers (accueil, Prestations) défile en CSS, s'arrête au survol et reste fixe en mouvement réduit ; il n'a plus de bouton Pause depuis le 2026-10-26 (voir problèmes connus). C'est le seul JavaScript durable du site (accord du 2026-10-22).

- Liens internes en `.html` : Cloudflare Pages les redirige vers l'URL sans extension (une redirection par clic). Gardé volontairement pour que le site s'ouvre en local avec un simple serveur statique ; à revoir après le premier déploiement.
- Les tailles de `bundle.css` (design system) restent en px ; `site.css` les surcharge en rem pour les composants utilisés. À reporter dans la charte si elle évolue.

- 13 repères `a-confirmer` affichés à l'écran (voulu pour la démo, à retirer avant la mise en ligne).
- Citer La Défense, l'immeuble haussmannien et le projet de Montreuil reste à valider par Redoine (« trois ans chez CBRE » validé le 2026-10-21 ; aucune référence de projet CBRE).
- Pas de formulaire : contact par téléphone et e-mail pré-rempli.
- Ruban des métiers sans bouton Pause (retiré à la demande le 2026-10-26) : défilement continu de plus de 5 s, donc non conforme au critère RGAA 13.8 / WCAG 2.2.2 ; seuls la pause au survol (pas au clavier ni au toucher) et le mode « mouvement réduit » l'arrêtent.
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
- 2026-10-22 — Page Expérience étoffée à partir de l'entretien du 2026-10-21 : périmètre précisé (surfaces, clients, bâtiments, espaces), récit du projet de Montreuil, deux fiches anonymisées (centre d'examens ERP en immeuble haussmannien, tour IGH à La Défense), section « Travailler autour de votre activité » (site occupé, nuit, réemploi sur place, réglementation). Aucun nom de client ni mention CBRE dans les fiches. Cartes alignées en haut (`.sb-carte { align-content: start }`).
- 2026-10-22 — Données structurées complétées (SPEC §7) : `WebSite` sur l'accueil, `Service` + `hasOfferCatalog` (7 prestations) sur Prestations, `BreadcrumbList` sur toutes les pages à fil d'Ariane ; `@id` commun pour l'entreprise. Fiche référence modèle `references/association-400-m2-4-semaines.html` (projet de Montreuil, prestations et cadre CBRE / SOBIMA « À CONFIRMER »), liée depuis la page Expérience et ajoutée au sitemap. Libellé « aménagement de bureaux et d'espaces commerciaux » (décision du 21/10) dans le pied de page, l'étiquette de l'accueil et la description JSON-LD. Vérifié avec `wrangler dev` : `/references` et `/references/<slug>` en 200, 0 lien interne cassé.
- 2026-10-22 — Accessibilité (audit RGAA du 22/10) : tableau de l'accueil relié à son titre (`aria-labelledby`), cadres « Photo à venir » masqués aux lecteurs d'écran, adresse e-mail de l'aparté FAQ coupable (`overflow-wrap: anywhere`, débordement à 200 % corrigé). Vérifié : 0 violation axe sur 4 pages. Reste : arrêt du ruban défilant (RGAA 13.8).
- 2026-10-23 — Revue UI/UX (skill ui-ux-pro-max), corrections en CSS seul en fin de `site.css` : barre d'action mobile masquée tant que le bouton du premier écran est visible (accueil, test fit ; animation liée au défilement `view-timeline`, sans effet sous Firefox où la barre reste visible), barre masquée en paysage (hauteur ≤ 500 px), plancher de 12 px (fiches de cotes à 13 px, légendes, cotes), légendes du plan SVG à environ 12 px rendus au-delà de 480 px de large (tailles d'origine en dessous, sinon elles débordent des pièces), colonnes de texte à 52 ch (environ 72 caractères au lieu de 76 à 100), bouton Menu à 44 px. Vérifié en local : 0 violation axe sur 22 passes, aucun débordement horizontal.
- 2026-10-23 — En-têtes de Prestations, Méthode, Expérience et À propos : étiquette bleue retirée (elle répétait le fil d'Ariane). Chapô de la page Expérience réécrit : « interlocuteur qui connaît le terrain » au lieu de « jeune entreprise » (note Contenus v1 alignée).
- 2026-10-23 — Page Expérience : section « Les premiers projets SOBIMA » retirée jusqu'aux premières photos de chantier.
- 2026-10-23 — Retours de Redoine sur la maquette (1er aller-retour, voir la note « Retours Redoine - maquette v4 2026-10-23 » du vault) : SOBIMA parle à la place de Redoine (portrait retiré, « Nous appeler », contact@sobima.fr) ; capital retiré du pied de page et d'À propos (gardé dans les mentions légales) ; plus de nombre de chantiers ni de surface maximale ; tableau « Votre crainte » remplacé par « Nos engagements » ; accroche de l'accueil sur l'accompagnement clés en main, test fit en seconde porte d'entrée ; police mono JetBrains retirée (étiquettes en Schibsted Grotesk) ; frise puzzle des six étapes, animée au défilement en CSS ; photos d'ambiance Unsplash sur l'accueil, Prestations, Méthode et Réemploi ; favicon détouré en caramel ; image OG régénérée. Vérifié en local (wrangler dev) : 0 violation axe sur 12 pages × clair / sombre × 1 280 / 375 px, aucun débordement à 320 px ni à 200 %, taille minimale 12 px, aucune requête vers un tiers.
- 2026-10-23 — Revue intégrale du code (SEO/GEO, accessibilité, responsivité) : lien rétabli depuis Expérience vers la fiche `references/association-400-m2-4-semaines.html` ; `og:image:alt` mis à jour sur les 12 pages ; JSON-LD enrichis (`vatID`/`taxID`/`knowsAbout` sur l'accueil, `AboutPage` complétée, `Service` sur Test fit, `ContactPage` sur Contact) ; création de `llms.txt` et mise à jour de `sitemap.xml` ; bouton Pause / Relancer sur le ruban défilant (RGAA 13.8) ; fil d'Ariane balisé en `<nav>` ; `+`/`−` de la FAQ masqués aux lecteurs d'écran ; `404.html` en chemins racines sans `<base href="/">` (corrige le lien `#contenu`) ; `scroll-padding-bottom` mobile, défilement interne du menu mobile ouvert, tailles en `px` du plan SVG sous 480 px (résiste au zoom 200 %), centrage optique des numéros de la frise ; suppression du CSS mort et consolidation de `site.css`.
- 2026-10-26 — Mode nuit retiré : thème clair uniquement (`color-scheme: light`), bouton jour / nuit et `assets/theme-temporaire.js` supprimés, bloc `prefers-color-scheme: dark` retiré de `tokens.css`.
- 2026-10-26 — Accueil : titre animé en CSS (bureaux → locaux → commerces → bureaux, un seul passage de 5 s avec le délai, sous le seuil RGAA 13.8 ; fixe si le visiteur réduit les animations ; seul « bureaux » est dans le HTML). Titre réduit pour que « Vos commerces clés » tienne sur une ligne (`.titre-defilant`, 3 lignes de 375 à 1 440 px). Chapô reformulé (« SOBIMA vous accompagne… »), lien téléphone retiré du premier écran (classe `.lien-fort` supprimée), encart test fit reformulé.
- 2026-10-26 — Ruban des métiers : lignes de cote remplacées par de petits puzzles caramel (symbole `#logo-trait`, 22 px), bouton Pause retiré (code supprimé de `puzzle.js`), défilement ralenti (48 s → 80 s, environ 45 → 23 px/s). Accueil : titre de section « Un point de contact, de la visite technique à l'installation de vos équipes », chapô de la section retiré, « Un pilotage centralisé ».
- 2026-10-26 — Frise Méthode (accueil, Méthode) : emboîtement déclenché par `puzzle.js` quand chaque étape est visible, à vitesse fixe (1,1 s par pièce, 0,35 s d'écart, environ 2,9 s sur une ligne) au lieu de l'animation liée au défilement (qui finissait avant que la frise soit à l'écran et restait fixe sous Firefox) ; `puzzle.js` retiré de Prestations (plus utile), ajouté à Méthode. Accueil : section « Votre interlocuteur » masquée (commentaire HTML, en attente de la photo d'équipe), phrase « L'agent vous a envoyé le plan ? » retirée du bloc test fit, bouton « Demander mon test fit offert » agrandi avec flèche et halo ; encadré « Réemployer avant d'acheter » en vert (`--vert-reemploi` #2f5e3d sur `--vert-reemploi-fond` #e3eadc, contraste 6,1:1, jetons ajoutés hors charte dans `tokens.css`).
- 2026-10-26 — Page Réemploi : photo d'ambiance du bois retirée (fichiers `ambiance-bois-reemploi-*.webp` et ligne de crédit supprimés).
- 2026-10-26 — Page Expérience masquée : liens « Expérience » retirés de l'en-tête, du menu mobile et du pied de page des 12 pages ; `references.html` et la fiche `references/association-400-m2-4-semaines.html` restent en ligne mais en `noindex, follow`, retirées de `sitemap.xml` et de `llms.txt`.
- 2026-10-26 — Pages Prestations et Méthode fusionnées : trame de Prestations conservée (7 étapes), texte « site occupé » intégré à l'étape 04, chapô complété (« c'est le rôle d'un contractant général »), partie « Notre méthode » (`#methode`) ajoutée après l'étape 07 (de bout en bout, dérapages, engagements, garanties) ; frise des six étapes non reprise (doublon des étapes) ; base vie retirée (encadré et mention). `methode-contractant-general.html` supprimée, redirigée par `_redirects` ; liens Méthode retirés des menus et du pied de page, lien de l'accueil vers Prestations, sitemap et `llms.txt` mis à jour. FAQ retirée de l'en-tête et du menu mobile (reste en pied de page). Bouton d'en-tête et de barre mobile « Test fit offert » renommé « Parlons de votre projet » (même lien vers la page test fit).
- 2026-10-26 — Accueil : bouton du premier écran « Parlons de votre projet » (contact) remplacé par « Demander mon test fit offert » (page test fit).
- 2026-10-26 — Accueil : phrase sous le bouton du premier écran raccourcie (« Vous visitez un local ? Vérifiez que votre implantation fonctionne avant de vous engager. »). Bouton « Parlons de votre projet » de l'en-tête et de la barre mobile redirigé vers `devis-contact.html` (10 pages). Ruban des métiers (accueil, Prestations) : logo remplacé par une pièce de puzzle caramel de 22 px (`assets/img/piece-bandeau.svg` en masque CSS), 32 px d'espace de chaque côté.
- 2026-10-26 — Plan de l'accueil redessiné et animé en 4 temps au chargement (environ 5,5 s, CSS seul, fixe en mouvement réduit) : murs, cloisons une à une puis portes (`pathLength="1"`), coloration des espaces par fonction (travail, collaboratif, convivialité, support ; légende sous le plan), mobilier (4 îlots de 4 postes avec sièges, table de réunion 8 places, 2 tables rondes de café, banque d'accueil, bureau). Ajout d'un café et d'un local technique ; chiffres inchangés (16 × 11 m = 176 m², 16 + 1 = 17 postes). Vérifié dans Chrome à 1 920 px et 375 px.
- 2026-10-26 — Ruban des métiers : pièces de puzzle inclinées de 12° (`transform: rotate(-12deg)`).
