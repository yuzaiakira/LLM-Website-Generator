// Main Application - LLM Website Generator (Modular Version)

import { ThemeManager } from './theme.js';
import { LLMAgent } from './agent.js';
import { GoogleAPI } from './google-api.js';
import { OpenRouterAPI } from './openrouter.js';
import { SettingsManager } from './settings.js';
import { UIManager } from './ui-manager.js';

class WebsiteGenerator {
    constructor() {
        this.initializeModules();
        this.bindEvents();
        this.updateModelBadge();
    }

    // Initialize all modules
    initializeModules() {
        // Initialize managers
        this.settingsManager = new SettingsManager();
        this.themeManager = new ThemeManager(this.settingsManager);
        this.uiManager = new UIManager();
        
        // Initialize API modules
        this.agent = new LLMAgent();
        this.googleAPI = new GoogleAPI(this.agent);
        this.openRouterAPI = new OpenRouterAPI(this.agent);
        
        // Update agent with API instances
        this.agent.googleAPI = this.googleAPI;
        this.agent.openRouterAPI = this.openRouterAPI;
    }

    // Bind application-level events
    bindEvents() {
        // Handle settings form submission
        this.themeManager.settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
        
        // Handle website generation requests
        document.addEventListener('generateWebsite', (e) => this.handleGenerateWebsite(e.detail.message));
    }

    // Handle settings form submission
    handleSettingsSubmit(e) {
        e.preventDefault();
        
        const formData = this.themeManager.getFormData();
        
        if (!this.themeManager.validateFormData(formData)) {
            return;
        }
        
        // Save settings
        this.settingsManager.saveSettings(formData);
        
        // Close modal and update UI
        this.themeManager.closeSettingsModal();
        this.updateModelBadge();
    }

    // Handle website generation
    async handleGenerateWebsite(message) {
        try {
            const settings = this.settingsManager.getCurrentSettings();
            
            // Check credentials
            if (!settings.apiKey || !settings.model) {
                this.themeManager.openSettingsModal(settings);
                throw new Error('API key or model not set');
            }
            
            // Get current code if it exists
            const currentCode = this.uiManager.codeEditor.getCode();
            
            // Enhance the message with current code context if available
            let enhancedMessage = message;
            if (currentCode && currentCode.trim()) {
                enhancedMessage = `Current code:\n\`\`\`html\n${currentCode}\n\`\`\`\n\nUser request: ${message}`;
            }
            
            // Generate website using selected API
            const generatedHTML = await this.agent.generateWebsite(
                enhancedMessage, 
                settings.apiProvider, 
                settings.apiKey, 
                settings.model
            );
            
            // Add bot response
            this.uiManager.addMessage('I\'ve generated your website! Check the Code and Demo tabs to see the result.', 'bot');
            
            // Update code output and preview
            this.uiManager.updateCodeOutput(generatedHTML);
            this.uiManager.updatePreview(generatedHTML);
            
        } catch (error) {
            console.error('Error generating website:', error);
            this.handleError(error);
        } finally {
            this.uiManager.resetButtonState();
        }
    }

    // Handle errors
    handleError(error) {
        if (error.message && error.message.includes('401')) {
            const settings = this.settingsManager.getCurrentSettings();
            alert(`Your ${settings.apiProvider === 'google' ? 'Google' : 'OpenRouter'} API key is invalid or expired. Please enter a valid key.`);
            this.settingsManager.clearInvalidApiKey(settings.apiProvider);
            this.themeManager.openSettingsModal(settings);
        } else if (error.message && error.message.includes('API key or model not set')) {
            // Already handled
        } else {
            this.uiManager.addMessage('Sorry, I encountered an error while generating your website. Please try again.', 'bot');
        }
    }

    // Update model badge
    updateModelBadge() {
        const settings = this.settingsManager.getCurrentSettings();
        this.themeManager.updateModelBadge(settings.apiProvider, settings.model);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteGenerator();
}); 