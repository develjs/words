require(["$", "datepicker", "api"], function(e, a, t) {
    e(".input-date").datepicker({
        format: "yyyy-mm-dd",
        language: "ru",
        autoclose: !0
    }),
    e("#date-mother").datepicker({
        format: "yyyy-mm-dd",
        language: "ru",
        autoclose: !0
    }),
    e(".js-filter").on("click", "a", function() {
        return e(".js-filter a").removeClass("is-active"),
        e(this).addClass("is-active"),
        e(".widget").hide(),
        e(".tab-" + e(this).data("tab")).show(),
        !1
    }),
    e(".js-widget__submit").on("click", function() {
        var dateMother = void 0
          , dateFather = void 0
          , conciveLost = void 0
          , s = e(".js-widget__result");

        s.slideUp();
        if ("blood" == e(this).data("type")) {
            dateMother = new Date(e("#date-mother-lost").val());
            dateFather = new Date(e("#date-father-lost").val());
            conciveLost = new Date(e("#date-concive-lost").val());
        }
        else {
            dateMother = new Date(e("#date-mother").val());
            dateFather = new Date(e("#date-father").val());
            conciveLost = new Date(e("#date-concive").val());
        }

        var yearMother = Math.round((conciveLost - dateMother) / 1000 / 60 / 60 / 24 / 365.5), 
            yearFather = Math.round((conciveLost - dateFather) / 1000 / 60 / 60 / 24 / 365.5), 
            bloodMather = yearMother % 3, 
            bloodFather = yearFather % 4;
        return 
            bloodMather <= bloodFather 
                ? ( s.find(".row").removeClass().addClass("row girl").find(".icomoon").removeClass().addClass("icomoon icomoon-girl-baby"),
                    e(".js-result__save").data("result", 1)
                ) 
                : ( s.find(".row").removeClass().addClass("row boy").find(".icomoon").removeClass().addClass("icomoon icomoon-boy-baby"),
                    e(".js-result__save").data("result", 2)
                ),
            s.slideDown(),
        !1
    }),
    e(".js-result__save").protect().on("click", function() {
        var a = e(this).data("result");
        return t.post("/api/polbaby/savedata/", {
            user: siteConfig.currentUser.id,
            test: 1,
            result: a
        }, function(e, a) {
            window.location.replace("/polbaby/")
        }),
        !1
    })
});