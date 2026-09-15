/* =====================================================
   EUROPE LIVE — COOKIE CONSENT
===================================================== */

function initCookies() {

    const cookieBanner =
        document.getElementById("cookie-banner");

    const acceptCookies =
        document.getElementById("cookie-accept");

    const rejectCookies =
        document.getElementById("cookie-reject");

    const savedConsent =
        localStorage.getItem(
            "europeLiveCookieConsent"
        );

    if (
        cookieBanner &&
        savedConsent
    ) {

        cookieBanner.style.display =
            "none";

    }

    if (acceptCookies) {

        acceptCookies.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "europeLiveCookieConsent",
                    "accepted"
                );

                if (cookieBanner) {
                    cookieBanner.style.display =
                        "none";
                }

                console.log(
                    "Analytics consent accepted."
                );

            }
        );

    }

    if (rejectCookies) {

        rejectCookies.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "europeLiveCookieConsent",
                    "rejected"
                );

                if (cookieBanner) {
                    cookieBanner.style.display =
                        "none";
                }

                console.log(
                    "Analytics consent rejected."
                );

            }
        );

    }

}
