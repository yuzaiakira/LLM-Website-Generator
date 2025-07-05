// UI Management Module

import { CodeEditor } from './editor.js';

export class UIManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentTab = 'code';
        this.codeEditor = new CodeEditor();
        this.hasGeneratedCode = false;
    }

    // Initialize DOM elements
    initializeElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.generatedCode = document.getElementById('generated-code');
        this.previewFrame = document.getElementById('preview-frame');
        this.codeTab = document.getElementById('code-tab');
        this.demoTab = document.getElementById('demo-tab');
        this.codeContent = document.getElementById('code-content');
        this.demoContent = document.getElementById('demo-content');
        this.formatButton = document.getElementById('format-code-btn');
    }

    // Bind event listeners
    bindEvents() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        // Enhanced keyboard shortcuts
        this.userInput.addEventListener('keydown', (e) => {
            // Ctrl+Enter or Cmd+Enter to send
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.handleSendMessage();
            }
            
            // Escape to clear input
            if (e.key === 'Escape') {
                e.preventDefault();
                this.userInput.value = '';
                this.userInput.style.height = 'auto';
            }
        });
        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
        // Tab switching
        this.codeTab.addEventListener('click', () => this.switchTab('code'));
        this.demoTab.addEventListener('click', () => this.switchTab('demo'));
        
        // Format button
        this.formatButton.addEventListener('click', () => {
            this.codeEditor.formatCode();
        });
        
        // Listen for code changes to show editing indicator
        this.generatedCode.addEventListener('input', () => {
            this.showEditingIndicator();
        });
        
        // Listen for code formatting to reset indicator
        document.addEventListener('codeFormatted', () => {
            this.resetEditingIndicator();
        });
    }

    // Handle sending messages
    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat (newlines will be preserved in display)
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        
        // Show loading state
        this.sendButton.disabled = true;
        this.sendButton.textContent = 'Generating...';
        
        // Emit event for main app to handle (preserve original newlines for LLM)
        const event = new CustomEvent('generateWebsite', { 
            detail: { message } 
        });
        document.dispatchEvent(event);
    }

    // Add message to chat
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender === 'user' ? 'user-message' : 'bot-message'} glassmorphism rounded-lg p-3 message-bubble ml-auto`;
        if (sender === 'user') {
            messageDiv.style.marginLeft = 'auto';
        }
        
        // Preserve newlines in user messages
        const formattedContent = sender === 'user' 
            ? content.replace(/\n/g, '<br>')
            : content;
        
        messageDiv.innerHTML = `<p class="text-white">${formattedContent}</p>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Update code output
    updateCodeOutput(html) {
        this.hasGeneratedCode = true;
        this.codeEditor.setCode(html);
        this.showCodeSection();
        this.resetEditingIndicator();
    }

    // Update preview iframe
    updatePreview(html) {
        this.codeEditor.updatePreview(html);
    }

    // Show the code section when code is generated
    showCodeSection() {
        // Ensure the right side is visible and properly sized
        const rightSide = document.querySelector('.flex-1:last-child');
        if (rightSide) {
            rightSide.style.display = 'flex';
            rightSide.style.flex = '1';
        }
        
        // Make code editable
        this.codeEditor.makeEditable();
        
        // Show format button
        this.formatButton.classList.remove('hidden');
    }

    // Auto-resize textarea based on content
    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 200) + 'px';
        
        // Ensure proper scrolling if content exceeds max height
        if (this.userInput.scrollHeight > 200) {
            this.userInput.style.overflowY = 'auto';
        } else {
            this.userInput.style.overflowY = 'hidden';
        }
    }

    // Switch between tabs
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab button styles
        if (tabName === 'code') {
            this.codeTab.className = 'tab-active px-4 py-2 rounded-t-lg text-white text-sm font-medium transition-all';
            this.demoTab.className = 'tab-inactive px-4 py-2 rounded-t-lg text-white text-sm font-medium transition-all';
        } else {
            this.demoTab.className = 'tab-active px-4 py-2 rounded-t-lg text-white text-sm font-medium transition-all';
            this.codeTab.className = 'tab-inactive px-4 py-2 rounded-t-lg text-white text-sm font-medium transition-all';
        }
        
        // Switch content visibility
        if (tabName === 'code') {
            this.codeContent.classList.remove('hidden');
            this.demoContent.classList.add('hidden');
        } else {
            this.demoContent.classList.remove('hidden');
            this.codeContent.classList.add('hidden');
            
            // Update preview when switching to demo tab
            if (this.hasGeneratedCode) {
                setTimeout(() => {
                    this.codeEditor.updatePreview(this.codeEditor.getCode());
                }, 100); // Small delay to ensure DOM is updated
            }
        }
        
        // Emit custom event for tab switch
        const event = new CustomEvent('tabSwitched', { 
            detail: { tab: tabName } 
        });
        document.dispatchEvent(event);
    }

    // Reset button state
    resetButtonState() {
        this.sendButton.disabled = false;
        this.sendButton.textContent = 'Send';
    }
    
    // Show editing indicator
    showEditingIndicator() {
        if (this.hasGeneratedCode) {
            this.formatButton.textContent = 'Format (Modified)';
            this.formatButton.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
        }
    }
    
    // Reset editing indicator
    resetEditingIndicator() {
        this.formatButton.textContent = 'Format';
        this.formatButton.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
    }
} 