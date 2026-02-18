// EFV Intelligence Chatbot
class EFVChatbot {
    constructor() {
        this.isOpen = false;
        this.history = [];
        this.apiUrl = 'http://localhost:5000/api/chat/message';
        this.init();
    }

    init() {
        this.injectHTML();
        this.attachEventListeners();
    }

    injectHTML() {
        const chatHTML = `
            <div id="efv-chatbot">
                <!-- Floating Chat Button -->
                <button id="efv-chat-toggle" class="efv-chat-button" aria-label="Open EFV Intelligence">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
                    </svg>
                    <span class="efv-pulse-ring"></span>
                </button>
                
                <!-- Tooltip with curved arrow -->
                <div class="efv-chat-tooltip">
                    <span class="efv-tooltip-text">Ask AI about EFV<sup>™</sup></span>
                    <svg class="efv-curved-arrow" xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40">
                        <path d="M 10 5 Q 15 35, 50 35" stroke="#d4af37" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0 0, 10 3, 0 6" fill="#d4af37" />
                            </marker>
                        </defs>
                    </svg>
                </div>

                <!-- Chat Window -->
                <div id="efv-chat-window" class="efv-chat-window">
                    <div class="efv-chat-header">
                        <div class="efv-chat-title">
                            <div class="efv-ai-avatar">⚡</div>
                            <div>
                                <h3>EFV<sup>™</sup> Intelligence</h3>
                                <p>Alignment Intelligence System</p>
                            </div>
                        </div>
                        <button id="efv-chat-close" class="efv-close-btn">×</button>
                    </div>

                    <div id="efv-chat-messages" class="efv-chat-messages">
                        <div class="efv-message efv-ai-message">
                            <div class="efv-message-content">
                                Welcome to EFV™. Let's measure your alignment.
                            </div>
                        </div>
                    </div>

                    <div class="efv-chat-input-container">
                        <input 
                            type="text" 
                            id="efv-chat-input" 
                            placeholder="Ask about alignment, books, or EFV™..." 
                            autocomplete="off"
                        />
                        <button id="efv-chat-send" class="efv-send-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('efv-chat-toggle');
        const closeBtn = document.getElementById('efv-chat-close');
        const sendBtn = document.getElementById('efv-chat-send');
        const input = document.getElementById('efv-chat-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('efv-chat-window');
        const toggleBtn = document.getElementById('efv-chat-toggle');

        if (this.isOpen) {
            chatWindow.classList.add('active');
            toggleBtn.style.display = 'none';
        } else {
            chatWindow.classList.remove('active');
            toggleBtn.style.display = 'flex';
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('efv-chat-window').classList.remove('active');
        document.getElementById('efv-chat-toggle').style.display = 'flex';
    }

    async sendMessage() {
        const input = document.getElementById('efv-chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message to UI
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: this.history })
            });

            const data = await response.json();

            // Remove typing indicator
            this.hideTyping();

            if (data.response) {
                this.addMessage(data.response, 'ai');
                this.history.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.response }
                );
            } else {
                this.addMessage('I apologize, but I encountered an error. Please try again.', 'ai');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            this.addMessage('Connection error. Please check if the server is running.', 'ai');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('efv-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `efv-message efv-${sender}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'efv-message-content';
        contentDiv.textContent = text;

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTyping() {
        const messagesContainer = document.getElementById('efv-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'efv-typing';
        typingDiv.className = 'efv-message efv-ai-message';
        typingDiv.innerHTML = `
            <div class="efv-message-content">
                <div class="efv-typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingDiv = document.getElementById('efv-typing');
        if (typingDiv) typingDiv.remove();
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new EFVChatbot());
} else {
    new EFVChatbot();
}
