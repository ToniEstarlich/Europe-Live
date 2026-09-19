/* =====================================================
   EUROPE LIVE — TV ENGINE
   LOCAL CHANNEL CONTROLLER
===================================================== */

let currentProgramId = null;

/*
   CHANNEL PRIORITY

   B = priority 1
   C = priority 2
   D = priority 3
   A = priority 99 = permanent fallback
*/

const liveChannels = [
    {
        id: "channel-b",
        title: "Europe Live — Channel B",
        channel: "Europe News",
        videoId: "",
        category: "NEWS",
        priority: 1,
        live: false
    },
    {
        id: "channel-c",
        title: "Europe Live — Channel C",
        channel: "Europe Tech",
        videoId: "",
        category: "TECH",
        priority: 2,
        live: false
    },
    {
        id: "channel-d",
        title: "Europe Live — Channel D",
        channel: "Europe Community",
        videoId: "",
        category: "COMMUNITY",
        priority: 3,
        live: false
    },
    {
        id: "channel-a",
        title: "Europe Live — Channel A",
        channel: "Europe Live",
        videoId: "pykpO5kQJ98",
        category: "EUROPE",
        priority: 99,
        live: true,
        fallback: true
    }
];

/*
   Select the highest-priority LIVE channel.

   If B, C and D are not live,
   Channel A becomes the fallback.
*/

function getActiveChannel() {

    const activeChannels =
        liveChannels
            .filter(channel =>
                channel.live &&
                channel.videoId
            )
            .sort((a, b) =>
                a.priority - b.priority
            );

    if (activeChannels.length > 0) {
        return activeChannels[0];
    }

    return liveChannels.find(
        channel => channel.fallback
    );
}

/*
   Find the next channel in priority order.
*/

function getNextChannel(activeChannel) {

    if (!activeChannel) {
        return null;
    }

    return liveChannels
        .filter(channel =>
            channel.id !== activeChannel.id &&
            channel.videoId
        )
        .sort((a, b) =>
            a.priority - b.priority
        )[0] || null;
}

/*
   Update NOW / NEXT.
*/

function updateTVGuide(activeChannel) {

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

    const nextChannel =
        getNextChannel(activeChannel);

    if (nowTitle) {
        nowTitle.textContent =
            activeChannel
                ? activeChannel.title
                : "Europe Live";
    }

    if (nowChannel) {
        nowChannel.textContent =
            activeChannel
                ? activeChannel.channel
                : "";
    }

    if (nextTitle) {
        nextTitle.textContent =
            nextChannel
                ? nextChannel.title
                : "Coming soon";
    }
}

/*
   Switch the TV channel only when necessary.
*/

function selectActiveChannel() {

    const activeChannel =
        getActiveChannel();

    if (!activeChannel) {
        console.error(
            "Europe Live: No active channel."
        );
        return;
    }

    if (
        currentProgramId ===
        activeChannel.id
    ) {
        updateTVGuide(activeChannel);
        return;
    }

    console.log(
        "Europe Live: Switching to:",
        activeChannel.title
    );

    currentProgramId =
        activeChannel.id;

    updateTVGuide(activeChannel);

    playProgram(
        activeChannel,
        () => {
            console.log(
                "Europe Live: Current video ended."
            );

            /*
               Re-check the channel list.
               If another channel is marked LIVE,
               it will take priority.
            */

            currentProgramId = null;

            selectActiveChannel();
        }
    );
}

/*
   Check the local channel state.

   No external API.
   No YouTube Data API.
*/

function checkChannelState() {

    const activeChannel =
        getActiveChannel();

    if (!activeChannel) {
        return;
    }

    if (
        activeChannel.id !==
        currentProgramId
    ) {
        selectActiveChannel();
    }
}

/*
   Start Europe Live.
*/

function initTVEngine() {

    console.log(
        "Europe Live: Local TV engine started."
    );

    selectActiveChannel();

    /*
       Re-check every 10 seconds.

       Later, another local status mechanism
       can simply update liveChannels[].live.
    */

    setInterval(
        checkChannelState,
        10000
    );
}
