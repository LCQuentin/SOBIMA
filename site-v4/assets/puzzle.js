/* Accueil et Prestations :
   1. Assemblage unique des quatre pièces du puzzle à l'entrée à l'écran.
   2. Bouton Pause / Relancer sur le ruban défilant des métiers (RGAA 13.8 / WCAG 2.2.2).
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le puzzle reste assemblé et le ruban est fixe. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var puzzle = document.querySelector(".puzzle");
  if (puzzle && "IntersectionObserver" in window) {
    puzzle.classList.add("puzzle--pret");
    var observateur = new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting) {
        puzzle.classList.add("puzzle--assemble");
        observateur.disconnect();
      }
    }, { threshold: 0.3 });
    observateur.observe(puzzle);
  }

  var bandeau = document.querySelector(".bandeau");
  if (bandeau) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bandeau__pause";
    btn.textContent = "Pause";
    btn.setAttribute("aria-label", "Pause : arrêter le défilement des métiers");
    btn.addEventListener("click", function () {
      var enPause = bandeau.classList.toggle("bandeau--pause");
      btn.textContent = enPause ? "Relancer" : "Pause";
      btn.setAttribute("aria-label", enPause ? "Relancer le défilement des métiers" : "Pause : arrêter le défilement des métiers");
    });
    bandeau.appendChild(btn);
  }
})();
