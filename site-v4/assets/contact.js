/* Page Contact :
   1. Suggestions d'adresses (Base Adresse Nationale, relayée par /api/adresse) sur le champ « Adresse du local ».
      Le champ reste un texte libre : une adresse non proposée est envoyée telle quelle.
   2. Envoi du formulaire sans quitter la page, avec un message par champ à corriger.
   Sans ce script, le formulaire s'envoie normalement et le serveur redirige vers /merci ou /envoi-impossible. */
(function () {
  var formulaire = document.querySelector(".formulaire");
  if (!formulaire || !window.fetch || !window.FormData) return;

  var TAILLE_MAX = 2 * 1024 * 1024; // même limite que worker/src/fichiers.js
  var EXTENSIONS = /\.(pdf|jpe?g|png|dwg|dxf)$/i;

  /* 1. Suggestions d'adresses (motif ARIA « combobox » avec liste) */
  var champAdresse = document.getElementById("adresse");
  var champBan = document.getElementById("adresse-ban");
  var liste = document.createElement("ul");
  var statut = document.createElement("p");
  var suggestions = [];
  var active = -1;
  var minuterie = null;
  var requete = null;

  liste.id = "adresse-suggestions";
  liste.className = "adresse__liste";
  liste.setAttribute("role", "listbox");
  liste.setAttribute("aria-label", "Adresses proposées");
  liste.hidden = true;
  statut.className = "adresse__statut";
  statut.setAttribute("aria-live", "polite");
  champAdresse.parentNode.appendChild(liste);
  champAdresse.parentNode.appendChild(statut);
  champAdresse.setAttribute("role", "combobox");
  champAdresse.setAttribute("aria-autocomplete", "list");
  champAdresse.setAttribute("aria-expanded", "false");
  champAdresse.setAttribute("aria-controls", liste.id);

  function fermer() {
    liste.hidden = true;
    liste.textContent = "";
    suggestions = [];
    active = -1;
    champAdresse.setAttribute("aria-expanded", "false");
    champAdresse.removeAttribute("aria-activedescendant");
  }

  function surligner(index) {
    var options = liste.children;
    for (var i = 0; i < options.length; i++) options[i].setAttribute("aria-selected", i === index ? "true" : "false");
    active = index;
    if (index >= 0) {
      champAdresse.setAttribute("aria-activedescendant", options[index].id);
      options[index].scrollIntoView({ block: "nearest" });
    } else {
      champAdresse.removeAttribute("aria-activedescendant");
    }
  }

  function choisir(index) {
    var adresse = suggestions[index];
    if (!adresse) return;
    champAdresse.value = adresse.libelle;
    champBan.value = adresse.id;
    fermer();
    statut.textContent = "Adresse retenue : " + adresse.libelle;
  }

  function afficher(adresses) {
    liste.textContent = "";
    suggestions = adresses;
    active = -1;
    if (!adresses.length) {
      fermer();
      statut.textContent = "Aucune adresse proposée : votre saisie sera envoyée telle quelle.";
      return;
    }
    adresses.forEach(function (adresse, i) {
      var option = document.createElement("li");
      option.id = "adresse-option-" + i;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = adresse.libelle;
      // mousedown plutôt que click : le choix se fait avant que le champ perde le focus
      option.addEventListener("mousedown", function (e) { e.preventDefault(); choisir(i); });
      liste.appendChild(option);
    });
    liste.hidden = false;
    champAdresse.setAttribute("aria-expanded", "true");
    statut.textContent = adresses.length + (adresses.length > 1 ? " adresses proposées" : " adresse proposée") + ", flèches haut et bas pour choisir.";
  }

  function chercher() {
    var texte = champAdresse.value.trim();
    if (requete) requete.abort();
    if (texte.length < 3) { fermer(); return; }
    requete = new AbortController();
    fetch("/api/adresse?q=" + encodeURIComponent(texte), { signal: requete.signal, headers: { Accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : { adresses: [] }; })
      .then(function (donnees) { if (champAdresse.value.trim() === texte) afficher(donnees.adresses || []); })
      .catch(function () { /* recherche annulée ou service indisponible : saisie libre */ });
  }

  champAdresse.addEventListener("input", function () {
    champBan.value = ""; // le texte a changé : l'adresse n'est plus celle reconnue par la BAN
    clearTimeout(minuterie);
    minuterie = setTimeout(chercher, 250);
  });
  champAdresse.addEventListener("keydown", function (e) {
    if (liste.hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); surligner((active + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); surligner(active <= 0 ? suggestions.length - 1 : active - 1); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choisir(active); }
    else if (e.key === "Escape") { e.preventDefault(); fermer(); }
  });
  champAdresse.addEventListener("blur", fermer);

  /* 2. Envoi sans quitter la page */
  var bouton = formulaire.querySelector(".formulaire__envoyer");
  var message = formulaire.querySelector(".formulaire__message");
  var libelleBouton = bouton.textContent;

  function afficherErreurs(erreurs, texte) {
    var premier = null;
    formulaire.querySelectorAll(".champ__erreur").forEach(function (p) {
      var nom = p.id.replace("-erreur", "");
      var champ = document.getElementById(nom);
      var erreur = erreurs[nom];
      p.hidden = !erreur;
      p.textContent = erreur || "";
      champ.closest(".champ").classList.toggle("champ--erreur", !!erreur);
      if (erreur) {
        champ.setAttribute("aria-invalid", "true");
        champ.setAttribute("aria-describedby", ((champ.getAttribute("aria-describedby") || "").replace(p.id, "").trim() + " " + p.id).trim());
        if (!premier) premier = champ;
      } else {
        champ.removeAttribute("aria-invalid");
      }
    });
    message.hidden = !texte;
    message.textContent = texte || "";
    if (texte) message.focus();
    else if (premier) premier.focus();
  }

  function verifierAvantEnvoi() {
    var erreurs = {};
    ["prenom", "nom", "email", "telephone"].forEach(function (nom) {
      var champ = document.getElementById(nom);
      if (!champ.validity.valid) {
        erreurs[nom] = {
          prenom: "Indiquez votre prénom.",
          nom: "Indiquez votre nom.",
          email: "Indiquez une adresse e-mail valide, par exemple nom@societe.fr.",
          telephone: "Indiquez votre numéro de téléphone."
        }[nom];
      }
    });
    var plan = document.getElementById("plan").files[0];
    if (plan && !EXTENSIONS.test(plan.name)) erreurs.plan = "Format non accepté : envoyez un fichier PDF, JPG, PNG, DWG ou DXF.";
    else if (plan && plan.size > TAILLE_MAX) erreurs.plan = "Le fichier dépasse 2\u00a0Mo\u00a0: envoyez-le à contact@sobima.fr, ou joignez une version allégée.";
    return erreurs;
  }

  // La vérification se fait au clic sur Envoyer, avec des messages en français, plutôt que par les bulles du navigateur
  formulaire.setAttribute("novalidate", "");
  formulaire.addEventListener("submit", function (e) {
    e.preventDefault();
    var erreurs = verifierAvantEnvoi();
    if (Object.keys(erreurs).length) {
      afficherErreurs(erreurs, "");
      return;
    }
    afficherErreurs({}, "");
    bouton.disabled = true;
    bouton.textContent = "Envoi en cours…";
    fetch(formulaire.action, { method: "POST", body: new FormData(formulaire), headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (reponse) {
        if (reponse.ok) {
          var envoye = document.createElement("div");
          envoye.className = "formulaire__envoye";
          envoye.setAttribute("role", "status");
          envoye.tabIndex = -1;
          envoye.innerHTML = "<h2>Merci, votre demande est envoyée</h2><p>Nous vous rappelons pour parler de votre projet. En attendant, vous pouvez nous joindre au <a href=\"tel:+33658943697\">+33 6 58 94 36 97</a>.</p>";
          formulaire.replaceWith(envoye);
          envoye.focus();
          return;
        }
        afficherErreurs(reponse.erreurs || {}, reponse.message || "L'envoi a échoué. Appelez-nous ou écrivez à contact@sobima.fr.");
      })
      .catch(function () {
        afficherErreurs({}, "L'envoi a échoué : vérifiez votre connexion, ou appelez-nous au +33 6 58 94 36 97.");
      })
      .then(function () {
        bouton.disabled = false;
        bouton.textContent = libelleBouton;
      });
  });
})();
