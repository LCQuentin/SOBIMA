/* Accueil et Méthode :
   1. Badge vidéo : lecture unique à l'entrée à l'écran, puis image figée.
   2. Frise des six étapes : chaque pièce s'emboîte une fois, quand elle est bien visible à l'écran.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le badge et la frise restent sur leur image finale. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var videoPuzzle = document.querySelector(".video-puzzle");
  if (videoPuzzle && "IntersectionObserver" in window) {
    var video = videoPuzzle.querySelector("video");
    var statique = videoPuzzle.querySelector(".video-puzzle__statique");
    var joue = false;
    var montrerStatique = function () {
      videoPuzzle.classList.remove("video-puzzle--pret");
      if (video) video.pause();
    };

    if (video && statique) {
      videoPuzzle.classList.add("video-puzzle--pret");
      video.addEventListener("error", montrerStatique, { once: true });

      var observateurVideo = new IntersectionObserver(function (entrees) {
        if (!entrees[0].isIntersecting || joue) return;
        joue = true;
        observateurVideo.disconnect();
        var lecture = video.play();
        if (lecture && typeof lecture.catch === "function") {
          lecture.catch(montrerStatique);
        }
      }, { threshold: 0.6 });

      observateurVideo.observe(videoPuzzle);
    }
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
