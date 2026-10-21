/* TEMPORAIRE : bouton jour / nuit pour la démo du design system.
   Pour le retirer : supprimer ce fichier et la ligne <script src="assets/theme-temporaire.js"> de chaque page.
   Sans ce script, le site suit le réglage clair / sombre de l'appareil. */
(function () {
  var racine = document.documentElement;
  try {
    var choix = localStorage.getItem("sobima-theme");
    if (choix === "light" || choix === "dark") racine.setAttribute("data-theme", choix);
  } catch (e) {}

  function estSombre() {
    var t = racine.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "bascule-theme";
    function maj() {
      var sombre = estSombre();
      bouton.textContent = sombre ? "Mode jour" : "Mode nuit";
      bouton.setAttribute("aria-label", sombre ? "Passer en mode jour" : "Passer en mode nuit");
    }
    bouton.addEventListener("click", function () {
      var suivant = estSombre() ? "light" : "dark";
      racine.setAttribute("data-theme", suivant);
      try { localStorage.setItem("sobima-theme", suivant); } catch (e) {}
      maj();
    });
    maj();
    document.body.appendChild(bouton);
  });
})();
