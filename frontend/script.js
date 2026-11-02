
const chat = document.getElementById("chat");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");

let messages = [];

function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.textContent = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    return div;
}

async function sendMessage() {
    const question = questionInput.value.trim();

    if (!question || sendBtn.disabled) return;

    document.getElementById("welcome")?.remove();

    messages.push({
        role: "user",
        content: question
    });

    addMessage(question, "user");
    questionInput.value = "";

    sendBtn.disabled = true;
    sendBtn.textContent = "...";

    const loading = addMessage("Thinking...", "bot");

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
        }

        loading.textContent = data.answer;

        messages.push({
            role: "assistant",
            content: data.answer
        });

    } catch (error) {
        loading.textContent = "Error: " + error.message;
    }

    sendBtn.disabled = false;
    sendBtn.textContent = "➤";
    questionInput.focus();
}

function useSuggestion(text) {
    questionInput.value = text;
    sendMessage();
}

questionInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
