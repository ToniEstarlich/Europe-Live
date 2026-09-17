/* =====================================================
   EUROPE LIVE — YOUTUBE LIVE API
===================================================== */

const YOUTUBE_API_ENDPOINT =
    "/api/youtube-live";


/* =====================================================
   GET LIVE CHANNELS
===================================================== */

async function getLiveChannels() {

    try {

        const response =
            await fetch(
                YOUTUBE_API_ENDPOINT
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        return data.liveChannels || [];

    }

    catch (error) {

        console.error(
            "Europe Live: Could not check YouTube LIVE status.",
            error
        );

        return [];

    }

}
