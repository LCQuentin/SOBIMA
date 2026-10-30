/* Menu mobile : ferme le panneau à la touche Échap (le focus revient sur « Menu ») et au clic en dehors.
   Sans ce script, le menu reste utilisable : un nouvel appui sur « Menu » le ferme. */
(function () {
  var menu = document.querySelector(".menu-mobile");
  if (!menu) return;

  document.addEventListener("keydown", function (evenement) {
    if (evenement.key !== "Escape" || !menu.open) return;
    menu.open = false;
    menu.querySelector("summary").focus();
  });

  document.addEventListener("click", function (evenement) {
    if (menu.open && !menu.contains(evenement.target)) menu.open = false;
  });
})();
