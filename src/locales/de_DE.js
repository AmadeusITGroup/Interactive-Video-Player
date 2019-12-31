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
  i18n._entities["de_DE"] = {
    format: {
      month: {
        short: "YYYY-MM",
        full: "YYYY MMMM"
      },
      date: {
        short: "YYYY-MM-DD"
      },
      currency: "{value}{symbol}"
    },
    currency: {
      code: "EUR",
      symbol: "€"
    },
    template: {
      label: {
        average: "Durchschnittliche Lebenskosten in",
        from: "Billigstes Angebot",
        roundtrip_from: "Hin- und Rückflug / Person",
        average_cost_from: "Durchschnittliche Tageskosten pro Person",
        perperson: "Hin- & Rückflug / 1 Erwachsener",
        to: "nach",
        availability: "Verfügbarkeit prüfen",
        dailycost: "Durchschnittliche Tageskosten pro Person Hotel inklusive",
        viewmore: "Mehr Informationen unter BudgetYourTrip",
        notspecified: "Nicht angegeben",
        bestoffer: "Bestes Angebot",
        inclflight: "Inklusive Flug und Hotel",
        address: "Adresse",
        rating: "Einschätzung",
        contactinfo: "Kontaktinformationen",
        livedata: "Livedaten während der Laufzeit",
        notips: "Tipps werden hier angezeigt",
        notitle: "Titel"
      },
      button: {
        booknow: "Jetzt buchen",
        getthere: "Hinkommen",
        checkavailability: "Verfügbarkeit prüfen",
        contactus: "Kontaktieren Sie uns"
      },
      error: {
        localisation:
          "Bitte aktivieren Sie die Lokalisierung in Ihrem Browser um Preise anzusehen",
        pricenotfound: "Kein Preis wurde gefunden"
      }
    },
    header: {
      label: {
        current: "Standort, der gerade im Film erscheint:"
      }
    },
    player: {
      label: {
        towishlist: "wurde zur Wunschliste hinzugefügt",
        fromwishlist: "wurde von der Wunschliste gelöscht"
      },
      error: {
        support:
          "Um dieses Video anzusehen, aktivieren Sie bitte JavaScript und erwägen Sie die Aktualisierung auf einen Webbrowsers, der HTML5-Video unterstützt ",
        cookies:
          "Bitte aktivieren Sie Drittanbieter-Cookies in Ihrem Browser, um dieses Video anzusehen"
      }
    },
    requirements: {
      label: {
        resolutiontoosmall:
          "Die Videoauflösung ist zu klein um eine optimale Wiedergabe zu garantieren",
        leavepage:
          "Wollen Sie das Video auf einer für die Wiedergabe optmierten Seite ansehen?"
      },
      button: {
        takemethere: "Ja",
        stayhere: "Nein"
      }
    }
  };
});
