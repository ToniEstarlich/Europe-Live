document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       EUROPE LIVE — YOUTUBE STREAMS
    ====================================================== */

    const liveStreams = [

        {
            title: "European Parliament Live",
            channel: "European Parliament",
            category: "EUROPE",
            videoId: "Cz7WgLEm07M"
        },

        {
            title: "European Commission Live",
            channel: "European Commission",
            category: "EUROPE",
            videoId: "EVw8Uy6lA_E"
        },

        {
            title: "Euronews Live",
            channel: "Euronews",
            category: "NEWS",
            videoId: "Cz7WgLEm07M&t=220s"
        },

        {
            title: "European Technology Live",
            channel: "Tech Europe",
            category: "TECH",
            videoId: "RRIn2JvsA0o&t=380s"
        }

    ];


    /* =====================================================
       YOUTUBE PLAYER
    ====================================================== */

    const broadcastArea =
        document.querySelector(".broadcast-placeholder");


    function loadYouTubeVideo(stream) {

        if (!broadcastArea) {
            return;
        }

        if (
            !stream.videoId ||
            stream.videoId === "VIDEO_ID_HERE"
        ) {

            console.warn(
                "Europe Live: No YouTube video ID configured for:",
                stream.channel
            );

            return;
        }

        broadcastArea.innerHTML = `
            <iframe
                class="youtube-player"
                src="https://www.youtube.com/embed/${stream.videoId}?autoplay=1&mute=1&rel=0"
                title="${escapeHtml(stream.title)}"
                frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowfullscreen>
            </iframe>
        `;


        const info = document.createElement("div");

        info.className = "broadcast-info";

        info.innerHTML = `
            <div class="broadcast-live">
                <span class="live-dot"></span>
                LIVE
            </div>

            <div class="broadcast-title">
                ${escapeHtml(stream.title)}
            </div>

            <div class="broadcast-channel">
                ${escapeHtml(stream.channel)}
            </div>
        `;

        broadcastArea.appendChild(info);

    }


    /* =====================================================
       LOAD FIRST AVAILABLE STREAM
    ====================================================== */

    const firstStream =
        liveStreams.find(
            stream =>
                stream.videoId &&
                stream.videoId !== "VIDEO_ID_HERE"
        );


    if (firstStream) {

        loadYouTubeVideo(firstStream);

    }



    /* =====================================================
       COOKIE CONSENT
    ====================================================== */

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

        cookieBanner.style.display = "none";

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
                    cookieBanner.style.display = "none";
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
                    cookieBanner.style.display = "none";
                }

                console.log(
                    "Analytics consent rejected."
                );

            }
        );

    }



    /* =====================================================
       DEMO CHAT
    ====================================================== */

    const chatForm =
        document.querySelector(".chat-form");

    const chatInput =
        chatForm
            ? chatForm.querySelector("input")
            : null;

    const chatMessages =
        document.querySelector(".chat-messages");


    if (
        chatForm &&
        chatInput &&
        chatMessages
    ) {

        chatForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const message =
                    chatInput.value.trim();


                if (!message) {
                    return;
                }


                const messageElement =
                    document.createElement("div");


                messageElement.className =
                    "chat-message";


                messageElement.innerHTML = `
                    <div class="chat-avatar blue">
                        🇪🇺
                    </div>

                    <div>
                        <span class="chat-user">
                            You
                        </span>

                        <p>
                            ${escapeHtml(message)}
                        </p>
                    </div>
                `;


                chatMessages.appendChild(
                    messageElement
                );


                chatInput.value = "";


                chatMessages.scrollTop =
                    chatMessages.scrollHeight;

            }
        );

    }



    /* =====================================================
       CATEGORY BUTTONS
    ====================================================== */

    const categories =
        document.querySelectorAll(".category");


    categories.forEach(
        (category) => {

            category.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    categories.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    category.classList.add(
                        "active"
                    );


                    const selectedCategory =
                        category.textContent
                            .trim()
                            .toUpperCase();


                    const matchingStreams =
                        liveStreams.filter(
                            stream =>
                                stream.category ===
                                selectedCategory
                        );


                    if (
                        matchingStreams.length > 0
                    ) {

                        loadYouTubeVideo(
                            matchingStreams[0]
                        );

                    }

                }
            );

        }
    );



    /* =====================================================
       HTML ESCAPING
    ====================================================== */

    function escapeHtml(value) {

        const element =
            document.createElement("div");


        element.textContent =
            value;


        return element.innerHTML;

    }

});
