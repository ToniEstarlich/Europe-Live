/* =====================================================
   EUROPE LIVE — TV ENGINE
===================================================== */

let currentProgramId = null;
let refreshTimer = null;

function getCurrentScheduleEntries() {
    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    return getAllScheduleEntries()
        .filter(entry => {
            const [hours, minutes] =
                entry.start.split(":").map(Number);

            const entryMinutes =
                hours * 60 +
                minutes;

            return entryMinutes <= currentMinutes;
        })
        .sort((a, b) => {
            const [aHours, aMinutes] =
                a.start.split(":").map(Number);

            const [bHours, bMinutes] =
                b.start.split(":").map(Number);

            return (
                (bHours * 60 + bMinutes) -
                (aHours * 60 + aMinutes)
            );
        });
}

function getScheduledProgram() {
    const entries =
        getCurrentScheduleEntries();

    if (!entries.length) {
        return null;
    }

    const entry = entries[0];

    return getChannelById(
        entry.programId
    );
}

function getNextScheduledProgram() {
    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    const nextEntry =
        getAllScheduleEntries()
            .map(entry => {
                const [hours, minutes] =
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
            .filter(entry =>
                entry.minutes > currentMinutes
            )
            .sort((a, b) =>
                a.minutes - b.minutes
            )[0];

    if (!nextEntry) {
        return null;
    }

    return getChannelById(
        nextEntry.programId
    );
}

function getLiveVideoForChannel(
    channel,
    liveChannels
) {
    if (!channel || !liveChannels) {
        return null;
    }

    return liveChannels.find(
        live =>
            live.channelId ===
            channel.channelId
    );
}

function findAvailableLiveProgram(
    preferredProgram,
    liveChannels
) {
    const priorityChannels =
        tvChannels
            .filter(channel =>
                channel.id !== "euronews"
            )
            .sort((a, b) =>
                a.priority - b.priority
            );

    if (
        preferredProgram &&
        preferredProgram.id !== "euronews"
    ) {
        const preferredLive =
            getLiveVideoForChannel(
                preferredProgram,
                liveChannels
            );

        if (preferredLive) {
            return {
                program: preferredProgram,
                videoId:
                    preferredLive.videoId
            };
        }
    }

    for (const channel of priorityChannels) {
        const live =
            getLiveVideoForChannel(
                channel,
                liveChannels
            );

        if (live) {
            return {
                program: channel,
                videoId: live.videoId
            };
        }
    }

    const euronews =
        getChannelById("euronews");

    const euronewsLive =
        getLiveVideoForChannel(
            euronews,
            liveChannels
        );

    if (euronewsLive) {
        return {
            program: euronews,
            videoId:
                euronewsLive.videoId
        };
    }

    return null;
}

function updateTVGuide(nowProgram) {
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

    const nextProgram =
        getNextScheduledProgram();

    if (nowTitle) {
        nowTitle.textContent =
            nowProgram
                ? nowProgram.title
                : "Waiting...";
    }

    if (nowChannel) {
        nowChannel.textContent =
            nowProgram
                ? nowProgram.channel
                : "";
    }

    if (nextTitle) {
        nextTitle.textContent =
            nextProgram
                ? nextProgram.title
                : "No scheduled program";
    }
}

function showWaitingScreen() {
    const container =
        document.querySelector(
            ".broadcast-placeholder"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="broadcast-info">
            <span>LIVE</span>
            <h2>Europe Live</h2>
            <p>Waiting for the next LIVE broadcast...</p>
        </div>
    `;

    updateTVGuide(null);

    currentProgramId = null;
}

function startCurrentProgram() {
    getLiveChannels()
        .then(liveChannels => {

            const preferredProgram =
                getScheduledProgram();

            const selected =
                findAvailableLiveProgram(
                    preferredProgram,
                    liveChannels
                );

            if (!selected) {
                showWaitingScreen();
                return;
            }

            const {
                program,
                videoId
            } = selected;

            if (
                currentProgramId ===
                program.id
            ) {
                updateTVGuide(program);
                return;
            }

            currentProgramId =
                program.id;

            updateTVGuide(program);

            playProgram(
                {
                    ...program,
                    videoId
                },
                () => {
                    currentProgramId = null;
                    startCurrentProgram();
                }
            );
        })
        .catch(error => {
            console.error(
                "Europe Live: TV engine error.",
                error
            );

            showWaitingScreen();
        });
}

function refreshTV() {
    getLiveChannels()
        .then(liveChannels => {

            const preferredProgram =
                getScheduledProgram();

            const selected =
                findAvailableLiveProgram(
                    preferredProgram,
                    liveChannels
                );

            if (!selected) {
                if (
                    currentProgramId !== null
                ) {
                    showWaitingScreen();
                }

                return;
            }

            const selectedProgram =
                selected.program;

            if (
                selectedProgram.id !==
                currentProgramId
            ) {
                startCurrentProgram();
            }
        })
        .catch(error => {
            console.error(
                "Europe Live: Refresh error.",
                error
            );
        });
}

function initTVEngine() {
    startCurrentProgram();

    refreshTimer =
        setInterval(
            refreshTV,
            60000
        );
}
