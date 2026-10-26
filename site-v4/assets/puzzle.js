/* Accueil et Prestations :
   Assemblage unique des quatre pièces du puzzle à l'entrée à l'écran.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le puzzle reste assemblé. */
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
})();
