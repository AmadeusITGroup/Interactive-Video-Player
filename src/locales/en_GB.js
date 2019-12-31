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
  i18n._entities["en_GB"] = i18n._entities["en"] = {
    format: { 
      month: {
        short: "MM YYYY",
        full: "MMMM YYYY"
      },
      date: {
        short: "DD MM YYYY"
      },
      currency: "{symbol}{value}"
    },
    currency: {
      code: "GBP",
      symbol: "£"
    },
    template: {
      label: {
        average: "Average cost of vacation in",
        from: "From",
        perperson: "Round trip / person",
        roundtrip_from: "Round trip / person from",
        average_cost_from: "Average daily cost from",
        pernight: "Price / night",
        to: "to",
        availability: "Check availability",
        dailycost: "Average daily cost / person incl Hotel in",
        viewmore: "View more on BudgetYourTrip",
        notspecified: "Not specified",
        bestoffer: "Best Offer",
        inclflight: "incl. flights and hotels",
        address: "Address",
        rating: "Rating",
        contactinfo: "Contact information",
        livedata: "Live data available at runtime",
        notips: "Tips will be visible here once filled ",
        notitle: "Title",
        pricenotfound: "Price not found"
      },
      button: {
        booknow: "Book now",
        getthere: "Get there",
        checkavailability: "Check availability",
        contactus: "Contact us"
      },
      error: {
        localisation:
          "Please enable localisation on your browser to view this section",
        pricenotfound: "Price not found"
      }
    },
    header: {
      label: {
        current: "You are now visiting:"
      }
    },
    player: {
      label: {
        towishlist: " has been added to your wish list",
        fromwishlist: " has been removed from your wish list"
      },
      error: {
        support: "To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video",
        cookies:"Please enable third party cookies in your browser to watch this video",
        "360Unavailable": "360 Video unavailable",
        unsupportedBrowser: "This video can't play in this browser",
        unsupportedVideo : "This video could not be loaded, either because the server or network failed or because of some plugins (e.g Ghostery)"
      }
    },
    requirements: {
      label: {
        resolutiontoosmall:
          "Video's resolution is too small for an optimal experience.",
        leavepage: "Would you like to watch the video in a dedicated page?"
      },
      button: {
        takemethere: "Yes, take me there",
        stayhere: "No, stay here"
      }
    }
  };
});
