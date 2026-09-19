/* =====================================================
   EUROPE LIVE — REAL-TIME CHAT
===================================================== */

function initChat() {

    // Prevent the chat from being initialized twice
    if (window.__europeLiveChatInitialized) {
        return;
    }

    const chatForm = document.querySelector(".chat-form");
    const chatInput = chatForm
        ? chatForm.querySelector("input")
        : null;
    const chatMessages = document.querySelector(".chat-messages");

    if (!chatForm || !chatInput || !chatMessages) {
        console.warn("Europe LIVE chat: elements not found.");
        return;
    }

    window.__europeLiveChatInitialized = true;

    /* =================================================
       UNIQUE USER FOR THIS PAGE/TAB
    ================================================= */

    const userId =
        "user-" +
        (window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now());

    const username =
        "Guest-" +
        Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase();

    console.log("Europe LIVE chat user:", username, userId);

    /* =================================================
       MESSAGE DEDUPLICATION
    ================================================= */

    const receivedMessageIds = new Set();

    /* =================================================
       WEBSOCKET
    ================================================= */

    const protocol =
        window.location.protocol === "https:"
            ? "wss:"
            : "ws:";

    const socket =
        new WebSocket(
            `${protocol}//${window.location.host}/chat`
        );

    socket.addEventListener("open", () => {
        console.log("Europe LIVE chat connected.");
    });

    socket.addEventListener("close", () => {
        console.log("Europe LIVE chat disconnected.");
    });

    socket.addEventListener("error", error => {
        console.error("Europe LIVE chat error:", error);
    });

    /* =================================================
       RECEIVE MESSAGE
    ================================================= */

    socket.addEventListener("message", event => {

        let data;

        try {
            data = JSON.parse(event.data);
        } catch {
            return;
        }

        if (data.type !== "chat") {
            return;
        }

        // Ignore the same server message twice
        if (data.id && receivedMessageIds.has(data.id)) {
            return;
        }

        if (data.id) {
            receivedMessageIds.add(data.id);
        }

        addChatMessage(data);
    });

    /* =================================================
       SEND MESSAGE
    ================================================= */

    chatForm.addEventListener("submit", event => {

        event.preventDefault();

        const text = chatInput.value.trim();

        if (!text) {
            return;
        }

        if (socket.readyState !== WebSocket.OPEN) {
            console.warn("Europe LIVE chat is not connected.");
            return;
        }

        socket.send(JSON.stringify({
            type: "chat",
            userId: userId,
            username: username,
            message: text.substring(0, 250)
        }));

        chatInput.value = "";
        chatInput.focus();
    });

    /* =================================================
       DISPLAY MESSAGE
    ================================================= */

    function addChatMessage(data) {

        const messageElement =
            document.createElement("div");

        messageElement.className = "chat-message";

        if (data.userId === userId) {
            messageElement.classList.add("own-message");
        }

        const avatar =
            document.createElement("div");

        avatar.className = "chat-avatar";
        avatar.textContent =
            data.avatar || "🇪🇺";

        const content =
            document.createElement("div");

        content.className = "chat-content";

        const usernameElement =
            document.createElement("div");

        usernameElement.className = "chat-username";
        usernameElement.textContent =
            data.username || "Guest";

        const textElement =
            document.createElement("div");

        textElement.className = "chat-text";
        textElement.textContent =
            data.message || "";

        content.appendChild(usernameElement);
        content.appendChild(textElement);

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);

        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;
    }
}

/* =====================================================
   START CHAT
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initChat,
        { once: true }
    );

} else {

    initChat();

}
