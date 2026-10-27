/* Accueil et Méthode :
   1. Logo en traits : les quatre pièces s'assemblent une fois quand la section entre à l'écran.
   2. Frise des six étapes : chaque pièce s'emboîte une fois, quand elle est bien visible à l'écran.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le logo et la frise restent assemblés. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var puzzle = document.querySelector(".puzzle");
  if (puzzle && "IntersectionObserver" in window) {
    puzzle.classList.add("puzzle--pret");
    var observateurPuzzle = new IntersectionObserver(function (entrees) {
      if (!entrees[0].isIntersecting) return;
      puzzle.classList.add("puzzle--assemble");
      observateurPuzzle.disconnect();
    }, { threshold: 0.6 });
    observateurPuzzle.observe(puzzle);
  }

  var etapes = document.querySelectorAll(".frise li");
  if (etapes.length && "IntersectionObserver" in window) {
    var observateurFrise = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("frise__etape--posee");
          observateurFrise.unobserve(entree.target);
        }
      });
    }, { threshold: 0.6, rootMargin: "0px 0px -15% 0px" });
    etapes.forEach(function (etape) {
      etape.classList.add("frise__etape--prete");
      observateurFrise.observe(etape);
    });
  }
})();
