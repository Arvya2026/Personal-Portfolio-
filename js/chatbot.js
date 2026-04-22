/**
 * Manoj Kumar Thota Portfolio - AI Chatbot Logic
 * Powered by Google Gemini API
 * Created by Pavan sai
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. configuration
  const CHAT_API_URL = '/api/chat';

  // Knowledge Base context for the AI
  const MANOJ_CONTEXT = `
    You are an AI Professional Assistant for Manoj Kumar Thota's portfolio website. 
    Manoj is the Founder & CEO of VenRAAG (maker of Enclaraa) and Director of Arvya Tech. 
    He is an expert in Agentic AI, Legal AI, and Enterprise RAG systems.

    Fact Sheet:
    - VenRAAG: London-based AI studio building Enclaraa.
    - Enclaraa: Agentic Legal AI for contract review, drafting, and document analysis with live citations and on-prem deployment.
    - Arvya Tech: Applied AI studio in Vijayawada shipping enterprise LLM integrations and AI invoice extraction.
    - Experience: Over 6 years in AI/Data. MSc Big Data (Distinction) from UoG. Ex-Cohere, AntWorks.
    - Achievements: LegalTechTalk Hackathon 2025 Winner, Generator Bursary 2025 Awardee.
    
    Guidelines:
    - Be professional, expert, yet approachable.
    - Keep responses concise (max 2-3 short paragraphs).
    - If asked about contact info, point them to the contact page or his LinkedIn.
    - Refer to yourself as "Manoj's AI Assistant".

    GUARDRAILS:
    - Stirictly swer to the 

    `;

  // Initialize chat history with system instructions
  let chatHistory = [
    { role: "user", parts: [{ text: MANOJ_CONTEXT }] },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I am now acting as Manoj Kumar Thota's professional AI Assistant. How can I assist you today?",
        },
      ],
    },
  ];

  // 2. Inject Chatbot Markup
  const chatbotHTML = `
    <div id="chat-trigger">
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 9H8.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 9H16.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 13C9 13 10 14.5 12 14.5C14 14.5 15 13 15 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
    <div id="chat-window">
        <div class="chat-header">
            <div class="chat-header-avatar">MT</div>
            <div class="chat-header-info">
                <h4>Agentic Assistant</h4>
                <span>Online</span>
            </div>
        </div>
        <div id="chat-messages"></div>
        <div class="chat-input-container">
            <div class="chat-input-wrapper">
                <input type="text" id="chat-input" placeholder="Ask about Manoj's AI work..." autocomplete="off">
                <button id="chat-send">
                    <i class="icon-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
    `;
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  // 3. Elements
  const trigger = document.getElementById("chat-trigger");
  const window = document.getElementById("chat-window");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const messagesContainer = document.getElementById("chat-messages");

  // 4. Functions
  const toggleChat = () => {
    window.classList.toggle("active");
    if (window.classList.contains("active")) {
      if (messagesContainer.children.length === 0) {
        setTimeout(
          () =>
            addMessage(
              "Hello! I'm Manoj's AI assistant, specialized in Agentic and Legal AI. How can I help you today?",
              "ai",
            ),
          500,
        );
      }
      input.focus();
    }
  };

  const addMessage = (text, type) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const addTypingIndicator = () => {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = "<span></span><span></span><span></span>";
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
  };

  const handleInput = async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const typingIndicator = addTypingIndicator();

    try {
      const responseText = await getGeminiResponse(text);
      typingIndicator.remove();
      addMessage(responseText, "ai");
    } catch (error) {
      console.error("Gemini Error:", error);
      typingIndicator.remove();
      addMessage(
        `Connectivity Issue: ${error.message}. Please check if your API key is active and that you are running the site through a local server (like Live Server) to avoid browser security blocks.`,
        "ai",
      );
    }
  };

  const getGeminiResponse = async (userQuery) => {
    // Add user query to history
    chatHistory.push({ role: "user", parts: [{ text: userQuery }] });

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory }),
      });

      if (!response.ok) {
        let isLocal = false;
        try {
          isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        } catch (e) {
          // Fallback if window.location is strangely restricted
          isLocal = false;
        }

        if (isLocal && (response.status === 404 || response.status === 405)) {
          throw new Error("Local environment detected. Your local server (Live Server) cannot run API functions. Please test on your live Vercel deployment or use 'vercel dev'.");
        }

        let errorMsg = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // If response isn't JSON, just use the status code
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      const modelResponse = data.candidates[0].content.parts[0].text;

      // Add model response to history
      chatHistory.push({ role: "model", parts: [{ text: modelResponse }] });

      // Keep history manageable (limit to last 10 exchanges)
      if (chatHistory.length > 20) {
        // Keep the initial system instruction but trim middle messages
        chatHistory = [
          chatHistory[0],
          chatHistory[1],
          ...chatHistory.slice(-18),
        ];
      }

      return modelResponse;
    } catch (error) {
      throw error;
    }
  };

  // 5. Listeners
  trigger.addEventListener("click", toggleChat);
  sendBtn.addEventListener("click", handleInput);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleInput();
  });
});
