// Settings Management Module

export class SettingsManager {
    constructor() {
        this.loadSettings();
    }

    // Load settings from localStorage
    loadSettings() {
        this.apiProvider = localStorage.getItem('api_provider') || 'openrouter';
        this.openrouterApiKeyValue = localStorage.getItem('openrouter_api_key') || '';
        this.openrouterModelValue = localStorage.getItem('openrouter_model') || '';
        this.googleApiKeyValue = localStorage.getItem('google_api_key') || '';
        this.googleModelValue = localStorage.getItem('google_model') || '';
        
        // Set current values
        this.apiKey = this.apiProvider === 'google' ? this.googleApiKeyValue : this.openrouterApiKeyValue;
        this.model = this.apiProvider === 'google' ? this.googleModelValue : this.openrouterModelValue;
    }

    // Save settings to localStorage
    saveSettings(formData) {
        const { apiProvider, openrouterApiKey, openrouterModel, googleApiKey, googleModel } = formData;
        
        // Save to localStorage
        localStorage.setItem('api_provider', apiProvider);
        localStorage.setItem('openrouter_api_key', openrouterApiKey);
        localStorage.setItem('openrouter_model', openrouterModel);
        localStorage.setItem('google_api_key', googleApiKey);
        localStorage.setItem('google_model', googleModel);
        
        // Update current values
        this.apiProvider = apiProvider;
        this.apiKey = apiProvider === 'google' ? googleApiKey : openrouterApiKey;
        this.model = apiProvider === 'google' ? googleModel : openrouterModel;
    }

    // Get current settings
    getCurrentSettings() {
        return {
            apiProvider: this.apiProvider,
            apiKey: this.apiKey,
            model: this.model,
            openrouterApiKeyValue: this.openrouterApiKeyValue,
            openrouterModelValue: this.openrouterModelValue,
            googleApiKeyValue: this.googleApiKeyValue,
            googleModelValue: this.googleModelValue
        };
    }

    // Clear invalid API key
    clearInvalidApiKey(provider) {
        if (provider === 'google') {
            localStorage.removeItem('google_api_key');
            this.googleApiKeyValue = '';
            this.apiKey = '';
        } else {
            localStorage.removeItem('openrouter_api_key');
            this.openrouterApiKeyValue = '';
            this.apiKey = '';
        }
    }
} 