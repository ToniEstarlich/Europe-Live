require("dotenv").config();

/* =====================================================
   EUROPE LIVE — YOUTUBE LIVE BACKEND
===================================================== */

const http =
    require("http");

const https =
    require("https");

const fs =
    require("fs");

const path =
    require("path");


const PORT =
    3000;


/* =====================================================
   CONFIG
===================================================== */

const API_KEY =
    process.env.YOUTUBE_API_KEY ||
    "";


const channels = [

    {
        channelId: "UCvU4p_w08osQsrNi_I4ZtDA"
    },

    {
        channelId: "UCMPaviJxybo1RTdzvYcU91A"
    },

    {
        channelId: "UCSrZ3UV4jOidv8ppoVuvW9Q"
    },

    {
        channelId: "UCRw_6H2yFAjUY5mo3AvJT-A"
    }

];


/* =====================================================
   YOUTUBE REQUEST
===================================================== */

function checkChannel(
    channel
) {

    return new Promise(
        resolve => {

            if (
                !API_KEY ||
                !channel.channelId ||
                channel.channelId ===
                    "CHANNEL_ID_HERE"
            ) {

                resolve(null);

                return;

            }


            const url =
                "https://www.googleapis.com/youtube/v3/search" +
                "?part=snippet" +
                "&channelId=" +
                encodeURIComponent(
                    channel.channelId
                ) +
                "&eventType=live" +
                "&type=video" +
                "&maxResults=1" +
                "&key=" +
                encodeURIComponent(
                    API_KEY
                );


            https.get(
                url,
                response => {

                    let body = "";


                    response.on(
                        "data",
                        chunk => {

                            body += chunk;

                        }
                    );


                    response.on(
                        "end",
                        () => {

                            try {

                                const data =
                                    JSON.parse(
                                        body
                                    );


                                if (
                                    data.items &&
                                    data.items.length > 0
                                ) {

                                    resolve({

                                        channelId:
                                            channel.channelId,

                                        videoId:
                                            data.items[0]
                                                .id
                                                .videoId

                                    });

                                    return;

                                }


                                resolve(null);

                            }

                            catch (error) {

                                console.error(
                                    error
                                );

                                resolve(null);

                            }

                        }
                    );

                }
            ).on(
                "error",
                error => {

                    console.error(
                        error
                    );

                    resolve(null);

                }
            );

        }
    );

}


/* =====================================================
   SERVER
===================================================== */

const server =
    http.createServer(
        async (
            request,
            response
        ) => {

            if (
                request.url ===
                "/api/youtube-live"
            ) {

                const results =
                    await Promise.all(
                        channels.map(
                            checkChannel
                        )
                    );


                const liveChannels =
                    results.filter(
                        Boolean
                    );


                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json",
                        "Access-Control-Allow-Origin":
                            "*"
                    }
                );


                response.end(
                    JSON.stringify({
                        liveChannels
                    })
                );


                return;

            }


            let filePath =
                request.url === "/"
                    ? "./index.html"
                    : "." +
                      request.url;


            filePath =
                path.normalize(
                    filePath
                );


            fs.readFile(
                filePath,
                (
                    error,
                    data
                ) => {

                    if (error) {

                        response.writeHead(
                            404
                        );

                        response.end(
                            "Not Found"
                        );

                        return;

                    }


                    response.writeHead(
                        200,
                        {
                            "Content-Type":
                                getContentType(
                                    filePath
                                )
                        }
                    );


                    response.end(
                        data
                    );

                }
            );

        }
    );


function getContentType(
    filePath
) {

    const extension =
        path.extname(
            filePath
        );


    const types = {

        ".html":
            "text/html",

        ".js":
            "text/javascript",

        ".css":
            "text/css",

        ".json":
            "application/json",

        ".png":
            "image/png",

        ".jpg":
            "image/jpeg",

        ".svg":
            "image/svg+xml"

    };


    return (
        types[extension] ||
        "application/octet-stream"
    );

}


server.listen(
    PORT,
    () => {

        console.log(
            `Europe Live running at http://localhost:${PORT}`
        );

    }
);





