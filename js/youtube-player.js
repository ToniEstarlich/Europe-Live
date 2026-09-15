/* =====================================================
   EUROPE LIVE — YOUTUBE PLAYER
===================================================== */

let currentPlayer = null;
let playerReady = false;
let playerEndedCallback = null;


/* =====================================================
   LOAD YOUTUBE IFRAME API
===================================================== */

function loadYouTubeAPI() {

    if (window.YT && window.YT.Player) {
        return;
    }

    const existingScript =
        document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
        );

    if (existingScript) {
        return;
    }

    const script =
        document.createElement("script");

    script.src =
        "https://www.youtube.com/iframe_api";

    document.head.appendChild(script);

}


/* =====================================================
   YOUTUBE API READY
===================================================== */

window.onYouTubeIframeAPIReady = () => {

    playerReady = true;

    console.log(
        "Europe Live: YouTube Player API ready."
    );

};


/* =====================================================
   PLAY PROGRAM
===================================================== */

function playProgram(program, onEnded) {

    const broadcastArea =
        document.querySelector(
            ".broadcast-placeholder"
        );

    if (!broadcastArea) {
        return;
    }

    if (
        !program ||
        !program.videoId
    ) {

        console.warn(
            "Europe Live: Invalid TV program."
        );

        return;
    }

    playerEndedCallback =
        onEnded || null;


    broadcastArea.innerHTML = `
        <div
            id="youtube-player"
            class="youtube-player">
        </div>
    `;


    const createPlayer = () => {

        if (
            !window.YT ||
            !window.YT.Player
        ) {

            console.warn(
                "Europe Live: YouTube API not ready yet."
            );

            setTimeout(
                createPlayer,
                500
            );

            return;
        }


        currentPlayer =
            new YT.Player(
                "youtube-player",
                {

                    videoId:
                        program.videoId,

                    playerVars: {

                        autoplay: 1,
                        mute: 1,
                        rel: 0,
                        playsinline: 1

                    },

                    events: {

                        onReady:
                            event => {

                                event.target.playVideo();

                            },

                        onStateChange:
                            event => {

                                if (
                                    event.data ===
                                    YT.PlayerState.ENDED
                                ) {

                                    console.log(
                                        "Europe Live: Program ended:",
                                        program.title
                                    );

                                    if (
                                        typeof playerEndedCallback ===
                                        "function"
                                    ) {

                                        playerEndedCallback();

                                    }

                                }

                            },

                        onError:
                            event => {

                                console.warn(
                                    "Europe Live: YouTube player error:",
                                    event.data
                                );

                            }

                    }

                }
            );

    };


    createPlayer();


    const info =
        document.createElement(
            "div"
        );

    info.className =
        "broadcast-info";

    info.innerHTML = `

        <div class="broadcast-live">
            <span class="live-dot"></span>
            LIVE
        </div>

        <div class="broadcast-title">
            ${escapeHtml(program.title)}
        </div>

        <div class="broadcast-channel">
            ${escapeHtml(program.channel)}
        </div>

    `;

    broadcastArea.appendChild(info);

}


/* =====================================================
   INITIALIZE
===================================================== */

loadYouTubeAPI();
