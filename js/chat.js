/* =====================================================
   EUROPE LIVE — REAL-TIME CHAT
===================================================== */

function initChat() {

    /*
       Prevent chat from being initialized twice.

       This is important because main.js may also call
       initChat().
    */

    if (window.__EUROPE_LIVE_CHAT_INITIALIZED) {
        return;
    }

    window.__EUROPE_LIVE_CHAT_INITIALIZED = true;

    const chatForm =
        document.querySelector(".chat-form");

    const chatInput =
        chatForm
            ? chatForm.querySelector("input")
            : null;

    const chatMessages =
        document.querySelector(".chat-messages");

    if (
        !chatForm ||
        !chatInput ||
        !chatMessages
    ) {
        return;
    }

    /*
       Remove static/demo messages from the HTML.
    */

    chatMessages.innerHTML = "";

    /*
       -------------------------------------------------
       USER ID + NICKNAME
       -------------------------------------------------
    */

    let userId =
        sessionStorage.getItem(
            "europeLiveUserId"
        );

    let username =
        sessionStorage.getItem(
            "europeLiveUsername"
        );

    if (!userId) {

        userId =
            "user-" +
            Math.random()
                .toString(36)
                .slice(2, 10);

        sessionStorage.setItem(
            "europeLiveUserId",
            userId
        );
    }

    if (!username) {

        const randomCode =
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase();

        username =
            `Guest-${randomCode}`;

        sessionStorage.setItem(
            "europeLiveUsername",
            username
        );
    }

    /*
       -------------------------------------------------
       CHAT SERVER
       -------------------------------------------------
    */

    let chatUrl =
        window.EUROPE_LIVE_CHAT_URL;

    if (!chatUrl) {

        const protocol =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";

        chatUrl =
            `${protocol}//${window.location.host}/chat`;
    }

    let socket = null;

    /*
       Prevent duplicate messages.
    */

    const receivedMessageIds =
        new Set();

    /*
       -------------------------------------------------
       CONNECT
       -------------------------------------------------
    */

    function connectChat() {

        if (
            socket &&
            (
                socket.readyState ===
                WebSocket.OPEN ||

                socket.readyState ===
                WebSocket.CONNECTING
            )
        ) {
            return;
        }

        socket =
            new WebSocket(chatUrl);

        socket.addEventListener(
            "open",
            () => {

                console.log(
                    `Europe LIVE chat connected as ${username}`
                );

                /*
                   Tell the server who we are.
                */

                socket.send(
                    JSON.stringify({

                        type: "join",

                        userId,

                        username

                    })
                );
            }
        );

        socket.addEventListener(
            "message",
            event => {

                let data;

                try {

                    data =
                        JSON.parse(
                            event.data
                        );

                } catch {

                    return;
                }

                /*
                   CHAT MESSAGE
                */

                if (
                    data.type === "chat"
                ) {

                    /*
                       Ignore duplicate messages.
                    */

                    if (
                        data.messageId &&
                        receivedMessageIds.has(
                            data.messageId
                        )
                    ) {
                        return;
                    }

                    if (data.messageId) {

                        receivedMessageIds.add(
                            data.messageId
                        );
                    }

                    addChatMessage(data);

                    return;
                }

                /*
                   ONLINE COUNT
                */

                if (
                    data.type === "presence"
                ) {

                    updateOnlineCount(
                        data.count
                    );

                    return;
                }

            }
        );

        socket.addEventListener(
            "close",
            () => {

                console.log(
                    "Europe LIVE chat disconnected."
                );

            }
        );

        socket.addEventListener(
            "error",
            error => {

                console.error(
                    "Europe LIVE chat error:",
                    error
                );

            }
        );
    }

    /*
       -------------------------------------------------
       SEND MESSAGE
       -------------------------------------------------
    */

    chatForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const message =
                chatInput.value.trim();

            if (!message) {
                return;
            }

            if (
                !socket ||
                socket.readyState !==
                WebSocket.OPEN
            ) {

                console.warn(
                    "Europe LIVE chat is offline."
                );

                return;
            }

            const messageId =
                `${userId}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 6)}`;

            socket.send(
                JSON.stringify({

                    type: "chat",

                    messageId,

                    userId,

                    username,

                    message

                })
            );

            chatInput.value = "";

        }
    );

    /*
       -------------------------------------------------
       ADD MESSAGE TO UI
       -------------------------------------------------
    */

    function addChatMessage(data) {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "chat-message";

        /*
           Avatar
        */

        const avatar =
            document.createElement("div");

        avatar.className =
            "chat-avatar blue";

        avatar.textContent =
            data.flag || "🇪🇺";

        /*
           Content
        */

        const content =
            document.createElement("div");

        const user =
            document.createElement("span");

        user.className =
            "chat-user";

        user.textContent =
            data.username ||
            "Guest";

        const text =
            document.createElement("p");

        text.textContent =
            data.message ||
            "";

        content.appendChild(
            user
        );

        content.appendChild(
            text
        );

        messageElement.appendChild(
            avatar
        );

        messageElement.appendChild(
            content
        );

        chatMessages.appendChild(
            messageElement
        );

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }

    /*
       -------------------------------------------------
       ONLINE COUNT
       -------------------------------------------------
    */

    function updateOnlineCount(
        count
    ) {

        const onlineElement =
            document.querySelector(
                ".chat-online"
            );

        if (!onlineElement) {
            return;
        }

        onlineElement.textContent =
            `${count} ONLINE`;
    }

    /*
       Start exactly one connection.
    */

    connectChat();
}


/* =====================================================
   START CHAT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initChat
);
