(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["riot-i18n"], function(i18n) {
      factory(i18n);
    });
  } else if (typeof exports === "object") {
    // CommonJS
    factory(require("riot-i18n"));
  } else {
    // Browser globals
    factory(root.i18n);
  }
})(this, function(i18n) {
  "use strict";
  /* jshint ignore:start */
  i18n._entities["fr_FR"] = {
    format: {
      month: {
        short: "MM YYYY",
        full: "MMMM YYYY"
      },
      date: {
        short: "DD MM YYYY"
      },
      currency: "{value}{symbol}"
    },
    currency: {
      code: "EUR",
      symbol: "€"
    },
    template: {
      label: {
        average: "Cout moyen en",
        from: "À partir de",
        roundtrip_from: "Aller retour par personne à partir de",
        average_cost_from: "Cout moyen à partir de",
        perperson: "Aller retour par personne",
        pernight: "Prix par nuit",
        to: "à",
        availability: "Verifier les disponibilités",
        dailycost: "Cout moyen journalier par personne avec hôtel",
        viewmore: "Voir plus de prix sur BudgetYourTrip",
        notspecified: "Non spécifié",
        bestoffer: "Meilleure Offre",
        inclflight: "icluant vols et hotels",
        address: "Adresse",
        rating: "Évaluation",
        contactinfo: "Contacts",
        livedata: "Données disponibles lors de l'exécution",
        notips: "Les conseils seront visible ici une fois remplis",
        notitle: "Titre",
        pricenotfound: "Prix non trouvés"
      },
      button: {
        booknow: "Acheter maintenant",
        getthere: "Y aller",
        checkavailability: "Disponibilités",
        contactus: "Nous contacter"
      },
      error: {
        localisation:
          'S"il vous plait activer la géo-localisation de votre navigateur pour voir cette section',
        pricenotfound: "Prix non trouvés"
      }
    },
    header: {
      label: {
        current: "Vous visitez:"
      }
    },
    player: {
      label: {
        towishlist: " a été rajouté(e) à votre liste de souhaits",
        fromwishlist: " a été supprimé(e) de votre liste de souhaits"
      },
      error: {
        support:
          "Activer JavaScript dans votre navigateur afin de visionner cette vidéo",
        cookies:
          "Activer les cookies tiers dans votre navigateur afin de visionner cette vidéo",
        "360Unavailable": "Vidéo 360 non disponible",
        unsupportedBrowser: "Cette vidéo ne peut pas jouer dans ce navigateur",
        unsupportedVideo : "Cette vidéo ne peut pas jouer."
      }
    },
    requirements: {
      label: {
        resolutiontoosmall:
          "La résolution de la vidéo est trop petite pour une expèrience optimale.",
        leavepage: "Voulez vous visionner la vidéo dans une page dédiée?"
      },
      button: {
        takemethere: "Oui, allons y",
        stayhere: "Non, restons là"
      }
    }
  };
});
