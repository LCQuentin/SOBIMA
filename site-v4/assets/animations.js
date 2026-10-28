/* Contrôle des animations automatiques (RGAA 13.8 / WCAG 2.2.2, audit du 2026-10-29) :
   1. Premier écran avec le plan (accueil, Simulation d'implantation) : un bouton Pause / Lecture pour l'accroche et le plan,
      puis un bouton Rejouer quand le plan est terminé.
   2. Bandeau des métiers (toutes les pages) : un bouton Pause / Lecture ; il s'arrête aussi au survol et au focus clavier.
   La pause passe par la classe anim-en-pause (animation-play-state dans site.css), pour ne pas entrer en conflit avec la pause au survol.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, rien n'est ajouté : les animations ne jouent pas dans ce cas. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.getAnimations) return;

  var SVG = "http://www.w3.org/2000/svg";
  var ICONES = {
    pause: "M5 3.5 V12.5 M11 3.5 V12.5",
    lecture: "M5 3 L13 8 L5 13 Z",
    rejouer: "M3.5 8 A4.5 4.5 0 1 0 5 4.6 M3.2 2.6 V5.4 H6"
  };

  function bouton(classe) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "anim-bouton " + classe;
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var chemin = document.createElementNS(SVG, "path");
    svg.appendChild(chemin);
    b.appendChild(svg);
    b.regler = function (icone, libelle) {
      chemin.setAttribute("d", ICONES[icone]);
      b.dataset.icone = icone;
      b.setAttribute("aria-label", libelle);
      b.title = libelle;
    };
    return b;
  }

  function finies(conteneur) {
    return conteneur.getAnimations({ subtree: true }).filter(function (a) {
      return a.effect && a.effect.getComputedTiming().iterations !== Infinity;
    });
  }
  function infinies(conteneur) {
    return conteneur.getAnimations({ subtree: true }).some(function (a) {
      return a.effect && a.effect.getComputedTiming().iterations === Infinity;
    });
  }

  function brancherPause(conteneur, hote, libelles) {
    var b = bouton("anim-bouton--pause");
    b.regler("pause", libelles[0]);
    b.addEventListener("click", function () {
      var enPause = conteneur.classList.toggle("anim-en-pause");
      b.regler(enPause ? "lecture" : "pause", enPause ? libelles[1] : libelles[0]);
    });
    hote.appendChild(b);
    return b;
  }

  /* 1. Premier écran avec le plan */
  var plan = document.querySelector(".hero .plan");
  if (plan && plan.getAnimations({ subtree: true }).length) {
    var hero = plan.closest(".hero");
    var commandes = document.createElement("div");
    commandes.className = "plan__commandes";
    plan.appendChild(commandes);
    var pause = brancherPause(hero, commandes, ["Mettre en pause les animations", "Reprendre les animations"]);
    var rejouer = bouton("anim-bouton--rejouer");
    rejouer.regler("rejouer", "Rejouer l'animation du plan");
    rejouer.hidden = true;
    commandes.insertBefore(rejouer, pause);

    var attendreLaFin = function () {
      Promise.all(finies(hero).map(function (a) { return a.finished; })).then(function () {
        rejouer.hidden = false;
        // Plus rien ne bouge sur la page Simulation : le bouton Pause n'a plus d'objet
        if (!infinies(hero)) pause.hidden = true;
      }, function () {});
    };
    rejouer.addEventListener("click", function () {
      hero.classList.remove("anim-en-pause");
      pause.regler("pause", "Mettre en pause les animations");
      pause.hidden = false;
      rejouer.hidden = true;
      finies(hero).forEach(function (a) { a.cancel(); a.play(); });
      pause.focus();
      attendreLaFin();
    });
    attendreLaFin();
  }

  /* 2. Bandeau des métiers */
  Array.prototype.forEach.call(document.querySelectorAll(".bandeau"), function (bandeau) {
    if (!bandeau.getAnimations({ subtree: true }).length) return;
    brancherPause(bandeau, bandeau, ["Mettre en pause le défilement", "Reprendre le défilement"]);
  });
})();
