
if (typeof marked !== "undefined") {
    marked.marked.setOptions({ breaks: true, gfm: true });
  }
  

// Chat Application
const API_KEY = "API KEY HERE"; // 🔐 Replace with your actual key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Store chat sessions
let chatSessions = [];
let currentSessionId = null;

function initChatApp() {
  loadChatSessions();
  createNewSession();

  // Set up event listeners
  document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  
  // New session button
  document.getElementById("newSessionBtn").addEventListener("click", createNewSession);
}

function loadChatSessions() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const savedSessions = localStorage.getItem(`chatSessions_${currentUser.id}`);
  if (savedSessions) {
    chatSessions = JSON.parse(savedSessions);
  }
}

function saveChatSessions() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  localStorage.setItem(
    `chatSessions_${currentUser.id}`,
    JSON.stringify(chatSessions)
  );
}

function createNewSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const sessionId = Date.now().toString();
  const newSession = {
    id: sessionId,
    userId: currentUser.id,
    title: "New Consultation",
    messages: [
      {
        role: "assistant",
        content:
          "Hello! I'm your Legal Consultation Assistant. I can provide basic legal information and guidance. Please note that I'm not a substitute for professional legal advice. How can I help you today?",
      },
    ],
    createdAt: new Date().toISOString(),
  };

  chatSessions.unshift(newSession);
  currentSessionId = sessionId;
  saveChatSessions();
  renderCurrentChat();

  // Focus the input field
  document.getElementById("userInput").focus();
}

function renderCurrentChat() {
    const session = chatSessions.find((s) => s.id === currentSessionId);
    if (!session) return;
  
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";
  
    session.messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = `chat-message ${message.role}`;
  
      if (message.role === 'assistant') {
        try {
          let cleanContent = message.content.trim();
          if (cleanContent.startsWith("```html")) {
            cleanContent = cleanContent.replace(/^```html/, '').replace(/```$/, '').trim();
          }
          messageDiv.innerHTML = cleanContent;
          

        } catch (e) {
          messageDiv.textContent = message.content;
        }
      } else {
        messageDiv.textContent = message.content;
      }
  
      chatBox.appendChild(messageDiv);
    });
  
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();
  if (!message || !currentSessionId) return;

  const session = chatSessions.find((s) => s.id === currentSessionId);
  if (!session) return;

  // Add user message to session
  session.messages.push({
    role: "user",
    content: message,
  });

  // Update the session title if it's the first user message
  if (session.messages.length === 2) {
    session.title =
      message.length > 30 ? message.substring(0, 30) + "..." : message;
  }

  saveChatSessions();
  renderCurrentChat();
  userInput.value = "";

  try {
    // Show typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    document.getElementById("chatBox").appendChild(typingIndicator);
    document.getElementById("chatBox").scrollTop =
      document.getElementById("chatBox").scrollHeight;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a legal consultation assistant. Return the answer directly in raw HTML only. Do NOT wrap it inside markdown code blocks like \`\`\`. Just return pure HTML like <h1>, <ul>, <li>, <strong>, etc. Here's the user's question: ${message}`,


              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      }),
    });

    // Remove typing indicator
    document.getElementById("chatBox").removeChild(typingIndicator);

    const data = await response.json();
    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand that. Please try again.";
    // Add assistant message to session
    session.messages.push({
      role: "assistant",
      content: reply,
    });

    saveChatSessions();
    renderCurrentChat();
  } catch (error) {
    // Remove typing indicator
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
      document.getElementById("chatBox").removeChild(typingIndicator);
    }

    // Add error message to session
    session.messages.push({
      role: "assistant",
      content:
        "I'm having trouble connecting to the legal database. Please try again later.",
    });

    saveChatSessions();
    renderCurrentChat();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Authentication check is now in auth.js
  initChatApp();
});
