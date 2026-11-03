/* Compteurs de conversions SOBIMA, sans cookie ni identifiant visiteur.
   Envoie un événement à /api/evenement, qui l'écrit dans Workers Analytics Engine.
   Cloudflare Web Analytics ne gère pas les événements personnalisés : ce script
   complète ses pages vues, il ne les remplace pas. */
(function () {
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  function envoyer(evenement) {
    var corps = JSON.stringify({ evenement: evenement, page: location.pathname });
    if (navigator.sendBeacon) {
      var blob = new Blob([corps], { type: "application/json" });
      if (navigator.sendBeacon("/api/evenement", blob)) return;
    }
    if (window.fetch) {
      fetch("/api/evenement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: corps,
        keepalive: true,
      }).catch(function () {});
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      var cible = e.target;
      if (!cible || !cible.closest) return;
      var lien = cible.closest("a[href]");
      if (!lien) return;
      var href = lien.getAttribute("href") || "";
      if (href.indexOf("tel:") === 0) envoyer("clic_telephone");
      else if (href.indexOf("mailto:") === 0) envoyer("clic_email");
    },
    { passive: true }
  );

  window.addEventListener("sobima:conversion", function (e) {
    if (e.detail && e.detail.type === "devis") envoyer("devis_envoye");
  });
})();
