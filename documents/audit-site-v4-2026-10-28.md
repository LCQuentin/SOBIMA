# Audit technique du site v4 — 2026-10-28

Périmètre : les 12 pages de `site-v4/` et `assets/*.css`, dans l'état du commit `7ac01f1` (accueil avec le lien de l'encart simulation, plan d'implantation animé de 9 s).

Méthode :
- Détecteur Impeccable sur les fichiers HTML et CSS. Chaque alerte a été vérifiée dans son contexte.
- axe-core 4.10.2 (WCAG 2.2 A et AA, plus les bonnes pratiques), injecté dans Chrome sans interface. Le site était servi par `wrangler dev`, à 1 440 et 375 px.
- Débordement horizontal et taille des cibles tactiles, mesurés à 1 440, 375 et 320 px. Erreurs de console relevées.
- Lecture du CSS : mouvements, `prefers-reduced-motion`, jetons de couleur, images, polices.

Non couvert : vrai téléphone, Firefox et Safari, lecteur d'écran réel, navigation au clavier testée à la main, mesures de performance réelles (Lighthouse, Web Vitals).

## Note de santé

| # | Dimension | Note | Constat principal |
|---|---|---|---|
| 1 | Accessibilité | 2 | Trois mouvements automatiques sans pause (accroche, bandeau, plan) : critère WCAG 2.2.2 (niveau A), choix assumés |
| 2 | Performance | 3 | Site léger, images en WebP avec `srcset` et chargement différé ; 176 Ko d'images publiées mais inutilisées |
| 3 | Thème | 3 | Jetons utilisés partout ; le thème sombre est défini mais jamais activé, et incomplet |
| 4 | Responsive | 3 | Aucun débordement à 375 px ; la page Devis et contact déborde de 8 px à 320 px (WCAG 1.4.10) |
| 5 | Cohérence de l'implémentation | 3 | Système cohérent et propre à SOBIMA ; écarts isolés et documentés |
| **Total** | | **14/20** | **Bon : à renforcer sur l'accessibilité** |

## Verdict sur la cohérence de l'implémentation

**Réussi.** Le site exprime un système propre à SOBIMA, et non un gabarit générique :
- jetons de la charte piste A dans `tokens.css` ;
- plan d'implantation dessiné à l'échelle, avec des cotes et des surfaces mesurées ;
- logo-puzzle et frise des étapes propres à l'entreprise.

Le détecteur relève surtout des motifs dits « génériques » :
- fond crème, Montserrat, petites étiquettes au-dessus des titres (20 occurrences) ;
- bandeau défilant, quadrillage du premier écran.

Ce sont des choix de la charte, validés avec Redoine. Ce ne sont pas des défauts techniques ; c'est à une critique de design de dire s'il faut les remettre en cause.

**Faux positifs.** Les 11 alertes « padding trop serré » visent des sections à fond pleine largeur. Leur contenu est en retrait par `.cadre`, et les captures le montrent.

## Résumé

- Note : **14/20 (bon)**.
- Problèmes : 0 P0, 4 P1, 2 P2, 3 P3.
- axe-core : **aucune violation**, hors un contraste sur des numéros décoratifs (P2). Aucune erreur de console sur les 12 pages.
- À traiter en premier :
  1. trois mouvements automatiques sans moyen de les arrêter (critère WCAG 2.2.2, niveau A) ;
  2. débordement horizontal de Devis et contact à 320 px (critère WCAG 1.4.10, niveau AA).

## Constats détaillés

### [P1] L'accroche de l'accueil défile en boucle, sans pause
- **Où** : `assets/site.css:260-262` (`.mot-defilant`, cycle de 7,5 s répété à l'infini) ; titre de `index.html`.
- **Catégorie** : accessibilité.
- **Impact** : le mot change sans fin à côté du titre principal. C'est gênant pour les personnes qui ont un trouble de l'attention ou qui utilisent une loupe d'écran.
- **Norme** : WCAG 2.2.2 « Mettre en pause, arrêter, masquer » (niveau A), RGAA 13.8.
- **État** : choix assumé (décision du 28/10, notée dans le README). L'effet est coupé quand le mouvement est réduit.
- **Correction possible** : arrêter la boucle après un ou deux cycles, ou ajouter un bouton pause.
- **Commande** : `/impeccable animate`.

### [P1] Le bandeau des métiers ne s'arrête qu'au survol de la souris
- **Où** : `assets/site.css:549-550` (`.bandeau__piste`, 80 s, boucle infinie ; `animation-play-state: paused` seulement sur `:hover`). Présent sur l'accueil et la page Approche.
- **Catégorie** : accessibilité.
- **Impact** : au clavier et sur écran tactile, rien n'arrête le défilement.
- **Norme** : WCAG 2.2.2 (niveau A), RGAA 13.8.
- **Correction possible** : mettre aussi en pause au focus (`:focus-within`) et ajouter un bouton pause. Une version fixe est aussi possible : elle existe déjà quand le mouvement est réduit.
- **Commande** : `/impeccable animate`.

### [P1] Le plan d'implantation s'anime pendant 9 s, sans pause
- **Où** : `assets/site.css`, bloc « Animation au chargement » (`--k: 1.8`) ; accueil et page Simulation d'implantation.
- **Catégorie** : accessibilité.
- **Impact** : le mouvement dure plus de 5 s, en même temps que le texte du premier écran.
- **Norme** : WCAG 2.2.2 (niveau A), RGAA 13.8.
- **État** : choix assumé (décision du 28/10). Le plan s'affiche fixe et complet quand le mouvement est réduit, ce qui a été vérifié.
- **Correction possible** : un bouton « Pause / Rejouer », ou une animation de moins de 5 s (`--k: 1`).
- **Commande** : `/impeccable animate`.

### [P1] Devis et contact déborde horizontalement à 320 px
- **Où** : `assets/site.css:433`. Sous 960 px, `.contact-grille` passe en `grid-template-columns: 1fr`. La colonne prend alors la largeur minimale de son contenu (312 px), alors que l'écran n'en offre que 288 à 320 px.
- **Catégorie** : responsive.
- **Impact** : défilement horizontal de 8 px sur les petits téléphones et en zoom à 400 %. Le formulaire est coupé à droite.
- **Norme** : WCAG 1.4.10 « Redistribution » (niveau AA).
- **Correction** : `grid-template-columns: minmax(0, 1fr)`, comme sur les autres grilles du site.
- **Commande** : `/impeccable adapt`.

### [P2] Grands numéros d'étapes à 2,15:1
- **Où** : `approche.html`, `.etape__num` (7 numéros caramel `#c49e5f` sur `#f2eee6`, 48 à 64 px).
- **Catégorie** : accessibilité.
- **Impact** : les numéros sont masqués aux lecteurs d'écran (`aria-hidden`) et l'ordre des étapes se lit aussi dans les titres. Mais ils restent pâles à l'écran, surtout en plein soleil.
- **Norme** : WCAG 1.4.3 et 1.4.11 : 3:1 minimum pour du texte de grande taille. axe le classe « grave ».
- **Correction** : employer `--caramel-texte` (`#7a5a26`), ou garder le caramel et assumer le numéro comme un ornement.
- **Commande** : `/impeccable colorize`.

### [P2] Thème sombre défini mais jamais activé, et incomplet
- **Où** : `assets/tokens.css:3` (`[data-theme="dark"]`). Aucun script ni aucune media query `prefers-color-scheme` ne l'active. Les jetons ajoutés depuis (`--bleu-plan-clair`, `--vert-reemploi-fond`, `--erreur`) n'ont pas de valeur pour le thème sombre.
- **Catégorie** : thème.
- **Impact** : aucun aujourd'hui, puisque le site est clair partout. Mais activer le thème sombre plus tard donnerait du texte clair sur des encarts clairs.
- **Correction** : décider de garder le site clair uniquement (et retirer le bloc), ou de compléter le thème sombre et de l'activer.
- **Commande** : `/impeccable colorize`.

### [P3] 176 Ko d'images publiées mais inutilisées
- **Où** : `assets/img/ambiance-plans-800.webp` et `-1600.webp`, `logo-64.png`, `logo-trait.svg`, `puzzle.svg` (cette dernière est gardée volontairement comme source archivée).
- **Catégorie** : performance.
- **Impact** : nul pour le visiteur, puisque rien ne les charge. Elles alourdissent seulement le déploiement.
- **Correction** : les retirer, ou les ajouter à `.assetsignore`.
- **Commande** : `/impeccable optimize`.

### [P3] Lien « Accueil » du fil d'Ariane : 44 × 15 px
- **Où** : `.ariane a` (8 pages).
- **Catégorie** : responsive.
- **Impact** : cible petite au doigt. L'espace libre autour satisfait probablement l'exception d'espacement du critère WCAG 2.5.8.
- **Correction** : `padding-block` de 4 à 6 px sur les liens du fil d'Ariane.
- **Commande** : `/impeccable adapt`.

### [P3] Palette du plan hors charte, plan copié dans deux pages
- **Où** : jetons `--plan-*` sur `.plan` (`assets/site.css`) ; `<figure class="plan">` copiée à l'identique dans `index.html` et `simulation-implantation.html`.
- **Catégorie** : cohérence de l'implémentation.
- **Impact** : aucun pour le visiteur. Ce sont des choix documentés (option A retenue le 28/10, et le README le rappelle). À surveiller à chaque modification du plan.
- **Commande** : `/impeccable document`, pour consigner la palette du plan dans un `DESIGN.md`.

## Problèmes récurrents

- **Mouvement sans moyen de l'arrêter.** Les trois animations longues ou infinies du site (accroche, bandeau, plan) n'ont aucun contrôle. C'est l'écart le plus net avec le RGAA, et il dépend d'une seule décision : un composant « pause » commun réglerait les trois.
- **Grilles en `1fr` nu.** La seule grille en défaut est celle qui n'utilise pas `minmax(0, …)`. Le reste du site applique déjà la bonne règle.
- **Jetons ajoutés au fil de l'eau** (`--bleu-plan-clair`, `--vert-reemploi`, `--erreur`, `--plan-*`). Ils sont bien commentés, mais `DESIGN.md` ne les recense pas et le thème sombre ne les couvre pas.

## Points forts

- **axe-core** : aucune violation sur les 12 pages, à 1 440 et 375 px, hors les numéros décoratifs. Titres, repères de page, libellés de formulaire et textes alternatifs sont propres.
- **Mouvement réduit bien traité.** Toutes les animations ne jouent qu'en `prefers-reduced-motion: no-preference`. Sans elles, l'état final s'affiche directement. Il n'y a pas de coupure globale à 0,01 ms qui ferait disparaître des informations.
- **Performance sobre** : 2 polices variables en WOFF2 (82 Ko), images WebP avec `srcset`, `sizes`, `loading="lazy"` et dimensions déclarées. Pas de framework, JavaScript facultatif, CSP stricte (`style-src 'self'`).
- **Responsive** : aucun débordement à 375 px, et un seul à 320 px. Aucune erreur de console.
- **Focus** visible sur les liens, boutons, champs et `summary`.

## Actions recommandées

1. **[P1] `/impeccable animate`** : un contrôle « pause / rejouer » commun pour l'accroche, le bandeau et le plan, ou des durées sous 5 s. Cela suppose de revenir sur les décisions du 28/10.
2. **[P1] `/impeccable adapt`** : `minmax(0, 1fr)` sur `.contact-grille` sous 960 px, et une vérification à 320 px. Profiter du passage pour agrandir les cibles du fil d'Ariane (P3).
3. **[P2] `/impeccable colorize`** : contraste des numéros d'étapes, et décision sur le thème sombre (le retirer ou le compléter).
4. **[P3] `/impeccable optimize`** : retirer du déploiement les images inutilisées.
5. **`/impeccable polish`** : passe finale après ces corrections.

## Suivi — corrections du 2026-10-29

Toutes les actions recommandées ont été appliquées à la demande de Quentin (« toutes d'un coup »). Ce choix revient sur la décision « 9 s sans bouton pause » du 28/10 : le plan garde ses 9 s, mais il a maintenant une pause.

| Constat | Correction | Vérification |
|---|---|---|
| [P1] Accroche, plan et bandeau sans pause | Nouveau script `assets/animations.js` (12 pages). Le premier écran a un bouton Pause / Lecture (accroche et plan), puis « Rejouer » à la fin du plan. Le bandeau a un bouton Pause / Lecture et s'arrête aussi au focus clavier. Boutons de 32 px, zone de clic de 44 px, icônes SVG, `aria-label` qui change avec l'état. | Testé dans Chrome. La pause fige le temps des animations (1 133 ms, puis toujours 1 133 ms 1,5 s plus tard). « Rejouer » apparaît en fin de plan et relance l'animation, puis le focus revient sur « Pause ». Sur la page Simulation, « Pause » se cache quand plus rien ne bouge. Aucun bouton quand le mouvement est réduit. Aucune erreur JavaScript. |
| [P1] Devis et contact déborde à 320 px | `minmax(0, 1fr)` sur `.contact-grille`, `.formulaire`, `.formulaire__ligne` et `.champ`. Champ fichier en `width: 100%`. La vraie cause était la largeur minimale propre de `input type="file"`. | 0 px de débordement à 320 px. |
| [P2] Numéros d'étapes à 2,15:1 | `color-mix(in srgb, var(--caramel) 45%, var(--caramel-texte))`, soit environ 3,5:1. | axe : 0 violation. |
| [P2] Thème sombre dormant | Site déclaré clair uniquement (`:root { color-scheme: light; }`, avec un commentaire). Le bloc de `tokens.css` reste en place mais inactif. | Lecture du CSS. |
| [P3] Images inutilisées | Ajoutées à `.assetsignore` (gardées dans le dépôt, non publiées). | `/assets/img/logo-64.png` renvoie 404 avec `wrangler dev`. |
| [P3] Fil d'Ariane 44 × 15 px | `display: inline-block; padding-block: 5px`. | Aucune cible de moins de 24 px à 375 px. |

Audit Chrome refait après les corrections : 12 pages × 1 440, 375 et 320 px, axe-core sans aucune violation, aucun débordement, aucune erreur de console. Tests du Worker : 17 sur 17.

Le détecteur ne relève plus que les 11 faux positifs « padding trop serré » et les motifs de charte (étiquettes au-dessus des titres, fond crème, Montserrat, bandeau défilant).

Note estimée après corrections : accessibilité 3 (la pause est disponible ; sans JavaScript, les mouvements restent sans contrôle), performance 3, thème 3, responsive 4, cohérence 3, soit **16/20**.
