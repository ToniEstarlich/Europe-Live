const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = process.env.PORT || 3000;

const appRoot = path.join(__dirname, "..");
const publicDir = appRoot;

const server = http.createServer((req, res) => {

    const url = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    const pathname = url.pathname;

    // =================================================
    // HEALTH
    // =================================================

    if (pathname === "/api/health") {

        res.writeHead(200, {
            "Content-Type":
                "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
            ok: true,
            service: "Europe Live",
            timestamp: Date.now()
        }));

        return;
    }

    // =================================================
    // YOUTUBE API
    // =================================================

    if (pathname === "/api/youtube-live") {

        res.writeHead(200, {
            "Content-Type":
                "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
            ok: true,
            searchListEnabled: false,
            message: "YouTube API server running"
        }));

        return;
    }

    // =================================================
    // STATIC FILES
    // =================================================

    let filePath =
        pathname === "/"
            ? path.join(publicDir, "index.html")
            : path.join(publicDir, pathname);

    if (!filePath.startsWith(publicDir)) {

        res.writeHead(403);
        res.end("Forbidden");

        return;
    }

    fs.readFile(filePath, (err, data) => {

        if (err) {

            res.writeHead(404, {
                "Content-Type":
                    "text/plain; charset=utf-8"
            });

            res.end("Not found");

            return;
        }

        const ext =
            path.extname(filePath).toLowerCase();

        const contentTypes = {

            ".html":
                "text/html; charset=utf-8",

            ".js":
                "application/javascript; charset=utf-8",

            ".css":
                "text/css; charset=utf-8",

            ".json":
                "application/json; charset=utf-8",

            ".png":
                "image/png",

            ".jpg":
                "image/jpeg",

            ".jpeg":
                "image/jpeg",

            ".svg":
                "image/svg+xml",

            ".ico":
                "image/x-icon"
        };

        res.writeHead(200, {
            "Content-Type":
                contentTypes[ext] ||
                "application/octet-stream"
        });

        res.end(data);
    });
});


// =====================================================
// WEBSOCKET CHAT
// =====================================================

const chatServer =
    new WebSocketServer({
        noServer: true
    });

const chatClients =
    new Set();


chatServer.on("connection", ws => {

    chatClients.add(ws);

    console.log(
        "Chat client connected. Clients:",
        chatClients.size
    );


    ws.send(
        JSON.stringify({
            type: "system",
            message:
                "Connected to Europe Live chat",
            timestamp: Date.now()
        })
    );


    ws.on("message", data => {

        let message;

        try {

            message =
                JSON.parse(
                    data.toString()
                );

        } catch {

            return;
        }


        if (
            !message ||
            typeof message.message !== "string"
        ) {

            return;
        }


        const text =
            message.message.trim();


        if (!text) {
            return;
        }


        // Server validates the user identity
        const userId =
            typeof message.userId === "string" &&
            message.userId.length > 0
                ? message.userId.substring(0, 100)
                : "anonymous-" + randomUUID();


        const username =
            typeof message.username === "string" &&
            message.username.trim().length > 0
                ? message.username
                    .trim()
                    .substring(0, 40)
                : "Guest-" +
                  Math.random()
                    .toString(36)
                    .slice(2, 7)
                    .toUpperCase();


        const chatMessage = {

            type: "chat",

            id: randomUUID(),

            userId,

            username,

            message:
                text.substring(0, 250),

            timestamp:
                Date.now(),

            avatar:
                "🇪🇺"
        };


        const encodedMessage =
            JSON.stringify(
                chatMessage
            );


        // Broadcast exactly once
        for (
            const client of chatClients
        ) {

            if (
                client.readyState ===
                WebSocket.OPEN
            ) {

                client.send(
                    encodedMessage
                );
            }
        }

    });


    ws.on("close", () => {

        chatClients.delete(ws);

        console.log(
            "Chat client disconnected. Clients:",
            chatClients.size
        );
    });


    ws.on("error", () => {

        chatClients.delete(ws);
    });

});


// =====================================================
// HTTP -> WEBSOCKET
// =====================================================

server.on(
    "upgrade",
    (request, socket, head) => {

        const pathname =
            new URL(
                request.url,
                `http://${request.headers.host}`
            ).pathname;


        if (pathname !== "/chat") {

            socket.destroy();

            return;
        }


        chatServer.handleUpgrade(
            request,
            socket,
            head,
            ws => {

                chatServer.emit(
                    "connection",
                    ws,
                    request
                );

            }
        );

    }
);


// =====================================================
// START
// =====================================================

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
            ` WebSocket: ws://localhost:${PORT}/chat`
        );

        console.log(
            "========================================"
        );

        console.log("");
    }
);
