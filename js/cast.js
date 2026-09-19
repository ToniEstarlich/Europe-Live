/* =====================================================
   EUROPE LIVE
   TV / CAST CONTROLLER
===================================================== */

(function () {

    "use strict";


    const EuropeLiveCast = {

        receiverApplicationId:
            chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,

        castContext: null,

        initialized: false,


        /* =================================================
           INITIALIZE
        ================================================= */

        initialize: function () {

            if (
                !window.cast ||
                !window.cast.framework
            ) {

                console.warn(
                    "Europe Live: Google Cast unavailable."
                );

                return;
            }


            this.castContext =
                cast.framework.CastContext.getInstance();


            this.castContext.setOptions({

                receiverApplicationId:
                    this.receiverApplicationId,

                autoJoinPolicy:
                    chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED

            });


            this.initialized = true;


            this.bindButton();


            this.updateButton();

        },


        /* =================================================
           BUTTON
        ================================================= */

        bindButton: function () {

            const button =
                document.getElementById("castButton");


            if (!button) {

                console.warn(
                    "Europe Live: castButton not found."
                );

                return;
            }


            button.addEventListener(
                "click",
                () => {

                    this.openCast();

                }
            );

        },


        /* =================================================
           OPEN CAST
        ================================================= */

        openCast: function () {

            if (!this.initialized) {

                this.showMessage(
                    "TV casting is not available in this browser."
                );

                return;
            }


            try {

                this.castContext.requestSession();

            }

            catch (error) {

                console.error(
                    "Europe Live Cast error:",
                    error
                );

                this.showMessage(
                    "Unable to connect to a TV."
                );

            }

        },


        /* =================================================
           BUTTON STATE
        ================================================= */

        updateButton: function () {

            const button =
                document.getElementById("castButton");


            if (!button) return;


            button.classList.add(
                "cast-ready"
            );


            button.setAttribute(
                "aria-label",
                "Watch Europe Live on TV"
            );

        },


        /* =================================================
           MESSAGE
        ================================================= */

        showMessage: function (message) {

            console.log(
                "Europe Live:",
                message
            );

        }

    };


    /* =====================================================
       PUBLIC API
    ================================================= */

    window.EuropeLiveCast =
        EuropeLiveCast;


})();
