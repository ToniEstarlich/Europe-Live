/* =====================================================
   EUROPE LIVE — CHAT
===================================================== */

function initChat() {

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

    chatForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const message =
                chatInput.value.trim();

            if (!message) {
                return;
            }

            const messageElement =
                document.createElement("div");

            messageElement.className =
                "chat-message";

            messageElement.innerHTML = `
                <div class="chat-avatar blue">
                    🇪🇺
                </div>

                <div>
                    <span class="chat-user">
                        You
                    </span>

                    <p>
                        ${escapeHtml(message)}
                    </p>
                </div>
            `;

            chatMessages.appendChild(
                messageElement
            );

            chatInput.value = "";

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

}
