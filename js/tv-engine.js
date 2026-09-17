/* =====================================================
   EUROPE LIVE — TV ENGINE
===================================================== */

let currentTVProgram = null;

let liveChannelCache = [];


/* =====================================================
   GET CURRENT TIME SLOT
===================================================== */

function getCurrentScheduleEntries() {

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    return getAllScheduleEntries()
        .filter(entry => {

            const [
                hours,
                minutes
            ] =
                entry.start
                    .split(":")
                    .map(Number);


            const entryMinutes =
                hours * 60 +
                minutes;


            return entryMinutes <= currentMinutes;

        })
        .sort(
            (a, b) => {

                const [
                    ah,
                    am
                ] =
                    a.start
                        .split(":")
                        .map(Number);


                const [
                    bh,
                    bm
                ] =
                    b.start
                        .split(":")
                        .map(Number);


                return (
                    bh * 60 +
                    bm
                ) -
                (
                    ah * 60 +
                    am
                );

            }
        );

}


/* =====================================================
   GET SCHEDULED PROGRAM
===================================================== */

function getScheduledProgram() {

    const entries =
        getCurrentScheduleEntries();


    if (
        entries.length === 0
    ) {

        return null;

    }


    const latestEntry =
        entries[
            entries.length - 1
        ];


    return getChannelById(
        latestEntry.programId
    );

}


/* =====================================================
   FIND LIVE VIDEO FOR CHANNEL
===================================================== */

function getLiveVideoForChannel(
    channel
) {

    if (!channel) {
        return null;
    }


    return liveChannelCache.find(
        live =>
            live.channelId ===
            channel.channelId
    );

}


/* =====================================================
   FIND NEXT AVAILABLE LIVE CHANNEL
===================================================== */

function findAvailableLiveProgram(
    preferredProgram
) {

    if (
        preferredProgram
    ) {

        const preferredLive =
            getLiveVideoForChannel(
                preferredProgram
            );


        if (preferredLive) {

            return {

                ...preferredProgram,

                videoId:
                    preferredLive.videoId

            };

        }

    }


    const available =
        tvChannels
            .filter(
                channel =>
                    getLiveVideoForChannel(
                        channel
                    )
            )
            .sort(
                (a, b) =>
                    a.priority -
                    b.priority
            );


    if (
        available.length === 0
    ) {

        return null;

    }


    const selected =
        available[0];


    const liveVideo =
        getLiveVideoForChannel(
            selected
        );


    return {

        ...selected,

        videoId:
            liveVideo.videoId

    };

}


/* =====================================================
   UPDATE NOW / NEXT UI
===================================================== */

function updateTVGuide(
    nowProgram
) {

    const nowTitle =
        document.querySelector(
            ".tv-now-title"
        );


    const nowChannel =
        document.querySelector(
            ".tv-now-channel"
        );


    const nextTitle =
        document.querySelector(
            ".tv-next-title"
        );


    if (nowTitle) {

        nowTitle.textContent =
            nowProgram
                ? nowProgram.title
                : "No LIVE program";

    }


    if (nowChannel) {

        nowChannel.textContent =
            nowProgram
                ? nowProgram.channel
                : "Waiting for LIVE";

    }


    const entries =
        getAllScheduleEntries();


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const next =
        entries
            .map(entry => {

                const [
                    hours,
                    minutes
                ] =
                    entry.start
                        .split(":")
                        .map(Number);


                return {

                    ...entry,

                    minutes:
                        hours * 60 +
                        minutes

                };

            })
            .filter(
                entry =>
                    entry.minutes >
                    currentMinutes
            )
            .sort(
                (a, b) =>
                    a.minutes -
                    b.minutes
            )[0];


    if (nextTitle) {

        const nextProgram =
            next
                ? getChannelById(
                    next.programId
                )
                : null;


        nextTitle.textContent =
            nextProgram
                ? nextProgram.title
                : "No upcoming program";

    }

}


/* =====================================================
   SHOW WAITING SCREEN
===================================================== */

function showWaitingScreen() {

    const broadcastArea =
        document.querySelector(
            ".broadcast-placeholder"
        );


    if (!broadcastArea) {
        return;
    }


    broadcastArea.innerHTML = `

        <div class="tv-waiting">

            <div class="broadcast-live">

                <span class="live-dot"></span>

                LIVE

            </div>


            <h2>
                Europe Live
            </h2>


            <p>
                Waiting for the next LIVE broadcast...
            </p>

        </div>

    `;

}


/* =====================================================
   START CURRENT PROGRAM
===================================================== */

async function startCurrentProgram() {

    console.log(
        "Europe Live: Checking YouTube LIVE channels..."
    );


    liveChannelCache =
        await getLiveChannels();


    console.log(
        "Europe Live: LIVE channels:",
        liveChannelCache
    );


    const scheduledProgram =
        getScheduledProgram();


    const selectedProgram =
        findAvailableLiveProgram(
            scheduledProgram
        );


    if (!selectedProgram) {

        currentTVProgram = null;

        updateTVGuide(
            null
        );

        showWaitingScreen();

        return;

    }


    currentTVProgram =
        selectedProgram;


    updateTVGuide(
        selectedProgram
    );


    console.log(
        "Europe Live NOW:",
        selectedProgram.title
    );


    playProgram(
        selectedProgram,
        () => {

            startCurrentProgram();

        }
    );

}


/* =====================================================
   REFRESH LIVE STATUS
===================================================== */

async function refreshTV() {

    const previousProgramId =
        currentTVProgram
            ? currentTVProgram.id
            : null;


    liveChannelCache =
        await getLiveChannels();


    const scheduledProgram =
        getScheduledProgram();


    const selectedProgram =
        findAvailableLiveProgram(
            scheduledProgram
        );


    if (!selectedProgram) {

        if (
            currentTVProgram
        ) {

            return;

        }


        showWaitingScreen();

        return;

    }


    if (
        !currentTVProgram ||
        previousProgramId !==
            selectedProgram.id
    ) {

        currentTVProgram =
            selectedProgram;


        updateTVGuide(
            selectedProgram
        );


        playProgram(
            selectedProgram,
            () => {

                startCurrentProgram();

            }
        );

    }

}


/* =====================================================
   INITIALIZE TV ENGINE
===================================================== */

function initTVEngine() {

    console.log(
        "Europe Live TV Engine started."
    );


    startCurrentProgram();


    setInterval(
        refreshTV,
        60000
    );

}
