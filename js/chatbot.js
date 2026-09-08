// LearnAI Pro - Intelligent Course & Academic Doubt Chatbot Controller

window.AIChatbot = {
  isOpen: false,
  isTyping: false,
  isListening: false,
  isSpeaking: false,
  messages: [],
  speechRecognition: null,
  speechSynth: window.speechSynthesis || null,

  init: function() {
    // Load saved conversation from localStorage if available
    const saved = localStorage.getItem('plr_chat_history');
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
      } catch(e) {
        this.messages = [];
      }
    }

    if (!this.messages || this.messages.length === 0) {
      this.resetToWelcome();
    }

    // Initialize Web Speech Recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputEl = document.getElementById('ai-chat-input');
        if (inputEl) {
          inputEl.value = transcript;
          inputEl.focus();
        }
        this.isListening = false;
        this.render();
      };

      this.speechRecognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isListening = false;
        this.render();
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        this.render();
      };
    }
  },

  resetToWelcome: function() {
    const user = (window.AppState && window.AppState.currentUser) ? window.AppState.currentUser : { name: 'Student', gradeClass: 'Grade 11', preferredStyle: 'visual', careerGoal: 'AI & Machine Learning Engineer' };
    const userName = user.name || 'Student';
    const userClass = user.gradeClass || 'Grade 11';
    const userStyle = (user.preferredStyle || 'visual').toUpperCase();
    const careerGoal = user.careerGoal || 'AI & Machine Learning Engineer';

    this.messages = [
      {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `👋 Hi **${userName}**! I am your personal **LearnAI Pro Tutor**.\n\nI'm customized for your **${userClass}** syllabus, **${userStyle}** learning style, and **${careerGoal}** pathway.\n\nFeel free to ask me:\n- 🧠 **Subject Doubts**: Explain Backpropagation, CNNs, Big-O, Calculus, Newton's Laws, DNA, Chemical Bonds\n- 📚 **Your Courses**: Next recommended milestones, video breakdowns & practice exercises\n- 📝 **Quizzes & Notes**: How to prepare for skill assessments\n\nWhat would you like help with today?`,
        suggestions: [
          "What should I study next?",
          "Explain Backpropagation simply",
          "Explain Big-O Complexity",
          "Show my enrolled courses"
        ],
        action: null
      }
    ];
    this.saveHistory();
  },

  saveHistory: function() {
    try {
      localStorage.setItem('plr_chat_history', JSON.stringify(this.messages.slice(-30)));
    } catch(e) {}
  },

  toggle: function() {
    this.isOpen = !this.isOpen;
    this.render();
    if (this.isOpen) {
      setTimeout(() => {
        this.scrollToBottom();
        const inputEl = document.getElementById('ai-chat-input');
        if (inputEl) inputEl.focus();
      }, 100);
    }
  },

  openWithPrompt: function(promptText) {
    this.isOpen = true;
    this.render();
    setTimeout(() => {
      this.scrollToBottom();
      this.sendMessage(promptText);
    }, 100);
  },

  close: function() {
    this.isOpen = false;
    this.render();
  },

  clearChat: function() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.resetToWelcome();
    this.render();
  },

  toggleVoiceInput: function() {
    if (!this.speechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your question.");
      return;
    }
    if (this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    } else {
      try {
        this.speechRecognition.start();
        this.isListening = true;
      } catch(e) {
        console.error("Speech start error:", e);
      }
    }
    this.render();
  },

  speakText: function(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting, code blocks, and math for speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\$+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      this.isSpeaking = false;
      this.render();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.render();
    };

    this.isSpeaking = true;
    this.render();
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking: function() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.render();
  },

  copyCode: function(btn, codeString) {
    navigator.clipboard.writeText(codeString).then(() => {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check" style="width:14px; height:14px;"></i> Copied!`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    });
  },

  executeAction: function(action) {
    if (!action) return;
    if (action.type === 'navigate') {
      if (window.AppState) {
        window.AppState.setView(action.view, {
          subject: action.subject,
          courseId: action.courseId
        });
      }
      // On mobile or small screens, optionally minimize or keep open
      if (window.innerWidth < 768) {
        this.close();
      }
    }
  },

  sendMessage: async function(textToSend = null) {
    const inputEl = document.getElementById('ai-chat-input');
    const text = textToSend || (inputEl ? inputEl.value.trim() : '');
    if (!text || this.isTyping) return;

    if (inputEl && !textToSend) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
    }

    // Add user message
    const userMsg = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.push(userMsg);
    this.isTyping = true;
    this.saveHistory();
    this.render();
    this.scrollToBottom();

    // Call AI Engine
    const user = window.AppState ? window.AppState.currentUser : null;
    const currentCourseId = window.AppState ? window.AppState.selectedCourseId : null;

    let responseData = null;
    if (window.AIEngine && window.AIEngine.chatWithAi) {
      responseData = await window.AIEngine.chatWithAi(text, this.messages, user, currentCourseId);
    } else {
      responseData = {
        reply: `I received your question: "${text}". Please check that the LearnAI Pro system is fully loaded.`,
        suggestions: ["Explain Backpropagation", "Explain Big-O Complexity"],
        action: null
      };
    }

    // Simulate natural AI thinking delay for smoother conversational feeling
    setTimeout(() => {
      this.isTyping = false;
      const botMsg = {
        id: 'msg-b-' + Date.now(),
        sender: 'bot',
        text: responseData.reply || "I am here to help you understand your courses and study materials.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: responseData.suggestions || [],
        action: responseData.action || null
      };
      this.messages.push(botMsg);
      this.saveHistory();
      this.render();
      this.scrollToBottom();
    }, 450);
  },

  scrollToBottom: function() {
    const listEl = document.getElementById('ai-chat-messages');
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  },

  renderMarkdown: function(rawText) {
    if (!rawText) return '';
    let html = rawText;

    // Code blocks with syntax copy button
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function(match, lang, code) {
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const rawCodeForAttr = encodeURIComponent(code.trim());
      return `
        <div class="ai-chat-code-block">
          <div class="ai-chat-code-header">
            <span>${lang ? lang.toUpperCase() : 'CODE'}</span>
            <button class="ai-chat-copy-code-btn" onclick="AIChatbot.copyCode(this, decodeURIComponent('${rawCodeForAttr}'))">
              <i data-lucide="copy" style="width:13px; height:13px;"></i> Copy
            </button>
          </div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="ai-chat-inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="ai-chat-heading">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="ai-chat-heading">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="ai-chat-heading">$1</h2>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // LaTeX Math Blocks ($$ ... $$)
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="ai-chat-math-block"><code>$1</code></div>');
    // Inline Math ($ ... $)
    html = html.replace(/\$([^\$]+)\$/g, '<span class="ai-chat-math-inline">$1</span>');

    // Tables
    html = html.replace(/\|(.+)\|\n\|([ \-:|]+)\|\n((\|.+\|\n?)+)/g, function(match, header, divider, body) {
      const ths = header.split('|').map(s => s.trim()).filter(Boolean).map(h => `<th>${h}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').map(s => s.trim()).filter(Boolean).map(c => `<td>${c}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<div class="ai-chat-table-wrapper"><table class="ai-chat-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    });

    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ai-chat-list-item">$1</li>');
    html = html.replace(/(<li class="ai-chat-list-item">.*<\/li>\n?)+/g, '<ul class="ai-chat-list">$&</ul>');

    // Numbered lists
    html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ai-chat-ordered-item"><span class="list-num">$1.</span> $2</li>');
    html = html.replace(/(<li class="ai-chat-ordered-item">.*<\/li>\n?)+/g, '<ul class="ai-chat-ordered-list">$&</ul>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<div style="height:8px;"></div>');
    html = html.replace(/\n/g, '<br>');

    return html;
  },

  render: function() {
    let container = document.getElementById('ai-chatbot-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ai-chatbot-container';
      document.body.appendChild(container);
    }

    const user = (window.AppState && window.AppState.currentUser) ? window.AppState.currentUser : null;
    const currentCourse = (window.AppState && window.AppState.data && window.AppState.data.courses) 
      ? window.AppState.data.courses.find(c => c.id === window.AppState.selectedCourseId) 
      : null;

    const contextLabel = currentCourse 
      ? `Active Course: ${currentCourse.title}` 
      : (user ? `${user.gradeClass || 'Student'} • ${user.name || (user.email ? user.email.split('@')[0] : 'Student')}` : 'Online AI Tutor');

    const html = `
      <!-- Floating Trigger Button in Bottom-Right Corner (Matches 3.PNG - 5.PNG) -->
      <div class="ai-chatbot-fab-wrapper ${this.isOpen ? 'chat-open' : ''}">
        <button class="ai-chatbot-fab" onclick="AIChatbot.toggle()" title="Ask LearnAI Tutor" aria-label="AI Tutor Chat">
          ${this.isOpen ? `
            <i data-lucide="x" class="fab-icon"></i>
          ` : `
            <i data-lucide="bot" class="fab-icon"></i>
          `}
        </button>
      </div>

      <!-- Floating Expandable Chatbot Window -->
      ${this.isOpen ? `
        <div class="ai-chatbot-window" id="ai-chatbot-window">
          <!-- Window Header -->
          <div class="ai-chat-header">
            <div class="ai-chat-header-info">
              <div class="ai-chat-avatar">
                <i data-lucide="bot"></i>
                <span class="online-indicator" title="AI Tutor is Online"></span>
              </div>
              <div>
                <div class="ai-chat-title">
                  LearnAI Pro Tutor
                  <span class="ai-badge-pill">AI 2.0</span>
                </div>
                <div class="ai-chat-subtitle">
                  <i data-lucide="sparkles" style="width:11px; height:11px;"></i>
                  ${contextLabel}
                </div>
              </div>
            </div>

            <div class="ai-chat-header-actions">
              ${this.isSpeaking ? `
                <button class="ai-header-btn active" onclick="AIChatbot.stopSpeaking()" title="Stop Audio">
                  <i data-lucide="volume-x"></i>
                </button>
              ` : ''}
              
              <button class="ai-header-btn" onclick="AIChatbot.clearChat()" title="Clear & Start New Session">
                <i data-lucide="refresh-cw"></i>
              </button>
              <button class="ai-header-btn" onclick="AIChatbot.close()" title="Minimize / Close">
                <i data-lucide="chevron-down"></i>
              </button>
            </div>
          </div>

          <!-- Messages Stream Container -->
          <div class="ai-chat-messages" id="ai-chat-messages">
            ${this.messages.map(msg => `
              <div class="ai-chat-msg-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}">
                ${msg.sender === 'bot' ? `
                  <div class="msg-avatar bot-avatar">
                    <i data-lucide="sparkles"></i>
                  </div>
                ` : ''}

                <div class="ai-chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}">
                  <div class="bubble-content">
                    ${msg.sender === 'bot' ? this.renderMarkdown(msg.text) : msg.text.replace(/\n/g, '<br>')}
                  </div>

                  <!-- Bot Interactive Action Button (e.g. Open Course, Take Quiz) -->
                  ${msg.sender === 'bot' && msg.action ? `
                    <div class="ai-chat-action-container">
                      <button class="ai-chat-action-btn" onclick="AIChatbot.executeAction(${JSON.stringify(msg.action).replace(/"/g, '&quot;')})">
                        <i data-lucide="arrow-right-circle"></i> ${msg.action.label || 'View in App'}
                      </button>
                    </div>
                  ` : ''}

                  <!-- Footer with timestamp & Audio Listen button for Auditory learners -->
                  <div class="bubble-footer">
                    <span class="bubble-time">${msg.timestamp}</span>
                    ${msg.sender === 'bot' ? `
                      <div class="bubble-actions">
                        <button class="bubble-icon-action" onclick="AIChatbot.speakText(decodeURIComponent('${encodeURIComponent(msg.text)}'))" title="Listen to explanation (Audio)">
                          <i data-lucide="volume-2"></i> Listen
                        </button>
                        <button class="bubble-icon-action" onclick="AIChatbot.copyCode(this, decodeURIComponent('${encodeURIComponent(msg.text)}'))" title="Copy answer">
                          <i data-lucide="copy"></i> Copy
                        </button>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Bot Follow-up Suggestion Chips -->
                  ${msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 ? `
                    <div class="ai-chat-suggestions">
                      ${msg.suggestions.map(sug => `
                        <button class="ai-suggestion-chip" onclick="AIChatbot.sendMessage('${sug.replace(/'/g, "\\'")}')">
                          💡 ${sug}
                        </button>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>

                ${msg.sender === 'user' ? `
                  <div class="msg-avatar user-avatar">
                    <img src="${(user && user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="User">
                  </div>
                ` : ''}
              </div>
            `).join('')}

            ${this.isTyping ? `
              <div class="ai-chat-msg-row bot-row">
                <div class="msg-avatar bot-avatar">
                  <i data-lucide="sparkles"></i>
                </div>
                <div class="ai-chat-bubble bot-bubble typing-bubble">
                  <div class="ai-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span style="font-size:0.75rem; color:var(--text-subtle); margin-left:8px;">LearnAI Tutor is thinking...</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Input Area -->
          <div class="ai-chat-input-area">
            <form onsubmit="event.preventDefault(); AIChatbot.sendMessage();" class="ai-chat-form">
              <div class="ai-input-wrapper">
                <textarea 
                  id="ai-chat-input" 
                  rows="1" 
                  placeholder="Ask a question about your courses, topics, doubts..." 
                  onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); AIChatbot.sendMessage(); }"
                  oninput="this.style.height = 'auto'; this.style.height = Math.min(100, this.scrollHeight) + 'px';"
                ></textarea>
                
                <button 
                  type="button" 
                  class="ai-input-tool-btn ${this.isListening ? 'listening' : ''}" 
                  onclick="AIChatbot.toggleVoiceInput()" 
                  title="${this.isListening ? 'Listening... click to stop' : 'Voice Input (Speech to Text)'}"
                >
                  <i data-lucide="${this.isListening ? 'mic-off' : 'mic'}"></i>
                </button>
              </div>

              <button type="submit" class="ai-chat-send-btn" title="Send message (Enter)">
                <i data-lucide="send"></i>
              </button>
            </form>
          </div>
        </div>
      ` : ''}
    `;

    container.innerHTML = html;

    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }
};

// Initialize chatbot when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    window.AIChatbot.init();
    window.AIChatbot.render();
  }, 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.AIChatbot.init();
    window.AIChatbot.render();
  });
}
