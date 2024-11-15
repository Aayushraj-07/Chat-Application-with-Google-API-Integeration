const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-bottom");

let userMessage = null;

// API configuration
const YOUR_API_KEY = "AIzaSyDJFUNnx-9Nd02U3OxU4i3yH3_jKu5xVuM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${YOUR_API_KEY}`;

// Load saved data from localStorage
const loadLocalStorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    // Apply saved theme
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    // Restore saved chats
    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);

    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
}

loadLocalStorageData();

// Create a new message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Show typing effect
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatList.innerHTML); // Save chats to localStorage
        }
        chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
    }, 75);
}

// Fetch API response based on user message
const generateAPIResource = async () => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();
        const apiResponse = data?.candidate[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    } catch (error) {
        console.log("Error:", error);
        // Optionally, display an error message to the user
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Show loading animation while waiting for API response
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                    <img src="./gemini.png" alt="Gemini Image" class="avatar">
                    <p class="text"></p>
                    <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span onclick="copyMessage(this)" class="icon material-symbols-outlined">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
    generateAPIResource(incomingMessageDiv);
}

// Copy message to clipboard
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // Show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // Revert icon after 1 second
}

// Handle outgoing chat
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim(); // Get the input value and remove extra spaces
    if (!userMessage) return; // Exit if there is no message

    const html = `<div class="message-content">
                    <img src="./user.jpg" alt="User Image" class="avatar">
                    <p class="text"></p>
                </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // Clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the bottom
    document.body.classList.add("hide-header");  // Hide the header once chat starts
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

// Toggle light/dark theme
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerHTML = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats from localStorage
deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        loadLocalStorageData();
    }
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
