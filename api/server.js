/* =====================================================
   EUROPE LIVE — YOUTUBE API SERVER
   No search.list
   Channel → Uploads → Recent Videos → LIVE state
===================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = path.join(__dirname, "..");

/* -----------------------------------------------------
   ENV
----------------------------------------------------- */

function loadEnvFile() {
    const envPath = path.join(ROOT, ".env");

    if (!fs.existsSync(envPath)) {
        return;
    }

    const content = fs.readFileSync(
        envPath,
        "utf8"
    );

    content
        .split(/\r?\n/)
        .forEach(line => {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) {
                return;
            }

            const separator =
                trimmed.indexOf("=");

            if (separator === -1) {
                return;
            }

            const key =
                trimmed
                    .slice(0, separator)
                    .trim();

            const value =
                trimmed
                    .slice(separator + 1)
                    .trim()
                    .replace(/^["']|["']$/g, "");

            if (key && !process.env[key]) {
                process.env[key] = value;
            }
        });
}

loadEnvFile();

const YOUTUBE_API_KEY =
    process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
    console.error(
        "Europe Live: YOUTUBE_API_KEY is missing."
    );
}

/* -----------------------------------------------------
   CHANNELS
----------------------------------------------------- */

const channels = [
    {
        id: "parliament",
        title: "European Parliament Live",
        channel: "European Parliament",
        channelId: "UCvU4p_w08osQsrNi_I4ZtDA"
    },
    {
        id: "commission",
        title: "European Commission Live",
        channel: "European Commission",
        channelId: "UCMPaviJxybo1RTdzvYcU91A"
    },
    {
        id: "euronews",
        title: "Euronews Live",
        channel: "Euronews",
        channelId: "UCSrZ3UV4jOidv8ppoVuvW9Q"
    },
    {
        id: "tech",
        title: "European Technology Live",
        channel: "Tech Europe",
        channelId: "UCRw_6H2yFAjUY5mo3AvJT-A"
    }
];

/* -----------------------------------------------------
   CACHE
----------------------------------------------------- */

const cache = new Map();

for (const channel of channels) {
    cache.set(channel.id, {
        uploadsPlaylistId: null,
        playlistCheckedAt: 0,
        videoIds: [],
        videosCheckedAt: 0,
        liveVideo: null,
        error: null
    });
}

/*
   We check the recent uploads every 2 minutes.

   This uses cheap API methods only:
   - channels.list
   - playlistItems.list
   - videos.list

   No search.list.
*/

const PLAYLIST_REFRESH =
    2 * 60 * 1000;

const VIDEO_REFRESH =
    60 * 1000;

const RECENT_VIDEO_COUNT = 10;

/* -----------------------------------------------------
   YOUTUBE REQUEST
----------------------------------------------------- */

async function youtubeRequest(
    endpoint,
    params
) {
    const url =
        new URL(
            `https://www.googleapis.com/youtube/v3/${endpoint}`
        );

    Object.entries(params).forEach(
        ([key, value]) => {
            url.searchParams.set(
                key,
                value
            );
        }
    );

    const response =
        await fetch(url);

    const data =
        await response.json();

    if (!response.ok) {
        const error =
            new Error(
                data?.error?.message ||
                `YouTube API HTTP ${response.status}`
            );

        error.status =
            response.status;

        error.reason =
            data?.error?.errors?.[0]?.reason;

        throw error;
    }

    return data;
}

/* -----------------------------------------------------
   STEP 1
   Get the channel's uploads playlist.
----------------------------------------------------- */

async function getUploadsPlaylistId(
    channel
) {
    const state =
        cache.get(channel.id);

    if (
        state.uploadsPlaylistId
    ) {
        return state.uploadsPlaylistId;
    }

    console.log(
        `[CHANNEL] Getting uploads playlist: ${channel.channel}`
    );

    const data =
        await youtubeRequest(
            "channels",
            {
                part: "contentDetails",
                id: channel.channelId,
                key: YOUTUBE_API_KEY
            }
        );

    if (
        !data.items ||
        !data.items.length
    ) {
        throw new Error(
            `Channel not found: ${channel.channel}`
        );
    }

    const playlistId =
        data.items[0]
            .contentDetails
            .relatedPlaylists
            .uploads;

    if (!playlistId) {
        throw new Error(
            `Uploads playlist not found: ${channel.channel}`
        );
    }

    state.uploadsPlaylistId =
        playlistId;

    console.log(
        `[CHANNEL] ${channel.channel} → ${playlistId}`
    );

    return playlistId;
}

/* -----------------------------------------------------
   STEP 2
   Get the most recent videos from uploads playlist.
----------------------------------------------------- */

async function getRecentVideoIds(
    channel
) {
    const state =
        cache.get(channel.id);

    const now =
        Date.now();

    if (
        state.videoIds.length &&
        now - state.playlistCheckedAt <
            PLAYLIST_REFRESH
    ) {
        return state.videoIds;
    }

    const playlistId =
        await getUploadsPlaylistId(
            channel
        );

    console.log(
        `[PLAYLIST] Checking recent videos: ${channel.channel}`
    );

    const data =
        await youtubeRequest(
            "playlistItems",
            {
                part:
                    "contentDetails,snippet",
                playlistId,
                maxResults:
                    String(
                        RECENT_VIDEO_COUNT
                    ),
                key: YOUTUBE_API_KEY
            }
        );

    const videoIds =
        (data.items || [])
            .map(item =>
                item.contentDetails?.videoId
            )
            .filter(Boolean);

    state.videoIds =
        videoIds;

    state.playlistCheckedAt =
        now;

    return videoIds;
}

/* -----------------------------------------------------
   STEP 3
   Check videos for LIVE state.
----------------------------------------------------- */

async function checkVideos(
    videoIds
) {
    if (!videoIds.length) {
        return [];
    }

    /*
       videos.list accepts multiple IDs
       in one request.
    */

    const data =
        await youtubeRequest(
            "videos",
            {
                part:
                    "snippet,liveStreamingDetails",
                id:
                    videoIds.join(","),
                maxResults:
                    String(videoIds.length),
                key: YOUTUBE_API_KEY
            }
        );

    return data.items || [];
}

/* -----------------------------------------------------
   Find currently LIVE video
----------------------------------------------------- */

function findLiveVideo(
    videos
) {
    for (const video of videos) {
        const details =
            video.liveStreamingDetails;

        if (!details) {
            continue;
        }

        /*
           A currently running broadcast has:
             actualStartTime
           and does NOT have:
             actualEndTime
        */

        const isLive =
            Boolean(
                details.actualStartTime &&
                !details.actualEndTime
            );

        if (!isLive) {
            continue;
        }

        return {
            videoId:
                video.id,

            title:
                video.snippet?.title ||
                "LIVE",

            channelId:
                video.snippet?.channelId,

            publishedAt:
                video.snippet?.publishedAt,

            scheduledStartTime:
                details.scheduledStartTime ||
                null,

            actualStartTime:
                details.actualStartTime ||
                null
        };
    }

    return null;
}

/* -----------------------------------------------------
   UPDATE ONE CHANNEL
----------------------------------------------------- */

async function updateChannel(
    channel
) {
    const state =
        cache.get(channel.id);

    const now =
        Date.now();

    if (
        state.videosCheckedAt &&
        now - state.videosCheckedAt <
            VIDEO_REFRESH
    ) {
        return state;
    }

    try {
        const videoIds =
            await getRecentVideoIds(
                channel
            );

        const videos =
            await checkVideos(
                videoIds
            );

        const liveVideo =
            findLiveVideo(
                videos
            );

        state.liveVideo =
            liveVideo;

        state.videosCheckedAt =
            now;

        state.error =
            null;

        if (liveVideo) {
            console.log(
                `[LIVE] ${channel.channel} → ${liveVideo.videoId}`
            );
        } else {
            console.log(
                `[OFF] ${channel.channel}`
            );
        }

        return state;

    } catch (error) {
        state.error =
            error.message;

        state.videosCheckedAt =
            now;

        console.error(
            `[YOUTUBE] ${channel.channel}: ${error.message}`
        );

        return state;
    }
}

/* -----------------------------------------------------
   PUBLIC LIVE DATA
----------------------------------------------------- */

async function getLiveChannels() {
    const liveChannels = [];

    for (const channel of channels) {
        const state =
            await updateChannel(
                channel
            );

        if (
            state.liveVideo
        ) {
            liveChannels.push({
                id:
                    channel.id,

                channel:
                    channel.channel,

                channelId:
                    channel.channelId,

                title:
                    channel.title,

                videoId:
                    state.liveVideo.videoId,

                videoTitle:
                    state.liveVideo.title,

                actualStartTime:
                    state.liveVideo.actualStartTime,

                scheduledStartTime:
                    state.liveVideo.scheduledStartTime
            });
        }
    }

    return liveChannels;
}

/* -----------------------------------------------------
   STATIC FILES
----------------------------------------------------- */

const MIME_TYPES = {
    ".html":
        "text/html; charset=utf-8",

    ".js":
        "application/javascript; charset=utf-8",

    ".css":
        "text/css; charset=utf-8",

    ".json":
        "application/json; charset=utf-8",

    ".svg":
        "image/svg+xml",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".ico":
        "image/x-icon"
};

function serveStatic(
    req,
    res
) {
    let requestPath =
        decodeURIComponent(
            req.url.split("?")[0]
        );

    if (
        requestPath === "/" ||
        requestPath === ""
    ) {
        requestPath =
            "/index.html";
    }

    const filePath =
        path.normalize(
            path.join(
                ROOT,
                requestPath
            )
        );

    if (
        !filePath.startsWith(ROOT)
    ) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(
        filePath,
        (error, data) => {
            if (error) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }

            const ext =
                path.extname(
                    filePath
                ).toLowerCase();

            const contentType =
                MIME_TYPES[ext] ||
                "application/octet-stream";

            res.writeHead(
                200,
                {
                    "Content-Type":
                        contentType
                }
            );

            res.end(data);
        }
    );
}

/* -----------------------------------------------------
   HTTP SERVER
----------------------------------------------------- */

const server =
    http.createServer(
        async (req, res) => {

            /* -----------------------------------------
               LIVE API
            ----------------------------------------- */

            if (
                req.url ===
                "/api/youtube-live"
            ) {
                try {
                    const liveChannels =
                        await getLiveChannels();

                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8",

                            "Cache-Control":
                                "no-store"
                        }
                    );

                    res.end(
                        JSON.stringify(
                            {
                                liveChannels
                            },
                            null,
                            2
                        )
                    );

                } catch (error) {
                    console.error(
                        "Europe Live API error:",
                        error
                    );

                    res.writeHead(
                        500,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        }
                    );

                    res.end(
                        JSON.stringify(
                            {
                                liveChannels: [],
                                error:
                                    error.message
                            }
                        )
                    );
                }

                return;
            }

            /* -----------------------------------------
               HEALTH
            ----------------------------------------- */

            if (
                req.url ===
                "/api/health"
            ) {
                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json; charset=utf-8"
                    }
                );

                res.end(
                    JSON.stringify({
                        status: "ok",
                        service:
                            "Europe Live",
                        youtubeSearch:
                            "disabled"
                    })
                );

                return;
            }

            /* -----------------------------------------
               STATIC WEBSITE
            ----------------------------------------- */

            serveStatic(
                req,
                res
            );
        }
    );

server.listen(
    PORT,
    () => {
        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            " EUROPE LIVE"
        );
        console.log(
            " YouTube API server"
        );
        console.log(
            " search.list: DISABLED"
        );
        console.log(
            "========================================"
        );
        console.log(
            ` http://localhost:${PORT}`
        );
        console.log(
            ` API: http://localhost:${PORT}/api/youtube-live`
        );
        console.log(
            ` Health: http://localhost:${PORT}/api/health`
        );
        console.log(
            "========================================"
        );
        console.log("");
    }
);
