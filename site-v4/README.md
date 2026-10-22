# Site SOBIMA — v4

Site vitrine de SOBIMA, contractant général en aménagement de bureaux à Paris et en Île-de-France. HTML et CSS statiques, sans outil de build ni JavaScript.

## Démarrage rapide

```sh
cd site-v4
python3 -m http.server 8765
# puis ouvrir http://localhost:8765/
```

## Déploiement (Cloudflare Pages, offre gratuite)

Déposer le dossier `site-v4/` tel quel (dépôt Git ou envoi direct). Aucune commande de build, dossier de sortie = racine.
Cloudflare Pages sert `prestations.html` à l'adresse `/prestations` : les balises `canonical`, `og:url` et `sitemap.xml` utilisent déjà cette forme. À vérifier au premier déploiement.

## Structure

| Fichier | Rôle |
|---|---|
| `*.html` (10 pages) | accueil, prestations, méthode, expérience (`references.html`), à propos, test fit, réemploi, FAQ, contact, mentions légales |
| `assets/tokens.css` | couleurs, polices, espacements du design system (piste A « Plan d'implantation »), copiés de `documents/charte/` — seul ajout : le bloc `prefers-color-scheme: dark`, à garder identique au bloc `[data-theme="dark"]` juste au-dessus |
| `assets/bundle.css` | composants `sb-` du design system — même règle |
| `assets/site.css` | mise en page du site, uniquement à partir des tokens |
| `assets/fonts/` | Montserrat, Schibsted Grotesk, JetBrains Mono, avec leurs licences `*-OFL.txt` (SIL OFL 1.1, dépôt google/fonts) |
| `assets/img/og-sobima.jpg` | image de partage 1 200 × 630 (réseaux sociaux, messageries) |
| `404.html` | page d'erreur servie par Cloudflare Pages (`noindex`, `<base href="/">` pour fonctionner à toute profondeur d'URL) |
| `_headers` | en-têtes Cloudflare : sécurité de base, cache long des polices |
| `assets/img/` | logo officiel, portrait |

Le thème sombre suit le réglage du système (`prefers-color-scheme`). Pour la démo, un bouton temporaire « Mode jour / Mode nuit » (seul JavaScript du site) force l'un ou l'autre et mémorise le choix dans le navigateur. Les valeurs sombres automatiques sont dans `tokens.css`. Les tailles de texte de `site.css` sont en rem (elles suivent la taille de police choisie par le visiteur) ; `site.css` surcharge en rem les tailles en px des composants de `bundle.css`.

## Avant la mise en ligne

- **Supprimer tous les repères `<mark class="a-confirmer">`** (19 au 2026-10-21) : `grep -c a-confirmer *.html`.
- **Retirer le bouton jour / nuit temporaire** : supprimer `assets/theme-temporaire.js`, la ligne `<script src="assets/theme-temporaire.js">` des 10 pages et le bloc « TEMPORAIRE » en fin de `site.css`.
- Confirmer le domaine (`www.sobima.fr` partout).
- Vérifier les mentions sensibles, y compris dans les `<title>` et meta descriptions : `grep -n "CBRE\|Montreuil\|La Défense" *.html` — seule la mention « trois ans chez CBRE » est validée ; aucune référence de projet CBRE.

## Changer une coordonnée ou un chiffre

Il n'y a pas de fichier de données unique (choix d'un site sans build) : chercher la valeur dans toutes les pages et la remplacer partout.

| Donnée | Rechercher |
|---|---|
| Téléphone | `06 58 94 36 97` et `+33658943697` |
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

- Liens internes en `.html` : Cloudflare Pages les redirige vers l'URL sans extension (une redirection par clic). Gardé volontairement pour que le site s'ouvre en local avec un simple serveur statique ; à revoir après le premier déploiement.
- Les tailles de `bundle.css` (design system) restent en px ; `site.css` les surcharge en rem pour les composants utilisés. À reporter dans la charte si elle évolue.

- 19 repères `a-confirmer` affichés à l'écran (voulu pour la démo, à retirer avant la mise en ligne).
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
