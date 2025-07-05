// Theme and UI Management Module

export class ThemeManager {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;
        this.initializeElements();
        this.bindEvents();
    }

    // Initialize DOM elements
    initializeElements() {
        this.settingsButton = document.getElementById('settings-button');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.cancelSettings = document.getElementById('cancel-settings');
        this.settingsForm = document.getElementById('settings-form');
        this.apiToggle = document.getElementById('api-toggle');
        this.openrouterFields = document.getElementById('openrouter-fields');
        this.googleFields = document.getElementById('google-fields');
        this.modelBadge = document.getElementById('model-badge');
        this.modelName = document.getElementById('model-name');
    }

    // Bind event listeners
    bindEvents() {
        // Settings modal
        this.settingsButton.addEventListener('click', () => {
            const settings = this.settingsManager ? this.settingsManager.getCurrentSettings() : {};
            this.openSettingsModal(settings);
        });
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        // Close modal on overlay click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
        });
        // API Toggle
        this.apiToggle.addEventListener('change', () => this.toggleApiProvider());
    }

    // Toggle between API providers
    toggleApiProvider() {
        const isGoogle = this.apiToggle.checked;
        if (isGoogle) {
            this.openrouterFields.classList.add('hidden');
            this.googleFields.classList.remove('hidden');
        } else {
            this.openrouterFields.classList.remove('hidden');
            this.googleFields.classList.add('hidden');
        }
    }

    // Open settings modal and prefill
    openSettingsModal(settings) {
        // Set toggle state
        this.apiToggle.checked = settings.apiProvider === 'google';
        this.toggleApiProvider();
        
        // Prefill fields
        document.getElementById('openrouter-api-key').value = settings.openrouterApiKeyValue || '';
        document.getElementById('openrouter-model').value = settings.openrouterModelValue || '';
        document.getElementById('google-api-key').value = settings.googleApiKeyValue || '';
        document.getElementById('google-model').value = settings.googleModelValue || '';
        
        this.settingsModal.classList.remove('hidden');
    }
    
    closeSettingsModal() {
        this.settingsModal.classList.add('hidden');
    }

    // Update model badge
    updateModelBadge(apiProvider, model) {
        if (model) {
            this.modelBadge.classList.remove('hidden');
            const provider = apiProvider === 'google' ? 'Google' : 'OpenRouter';
            this.modelName.textContent = `${provider}: ${model.split('/').pop() || model}`;
        } else {
            this.modelBadge.classList.add('hidden');
            this.modelName.textContent = 'No model selected';
        }
    }

    // Get form data
    getFormData() {
        const apiProvider = this.apiToggle.checked ? 'google' : 'openrouter';
        return {
            apiProvider,
            openrouterApiKey: document.getElementById('openrouter-api-key').value.trim(),
            openrouterModel: document.getElementById('openrouter-model').value.trim(),
            googleApiKey: document.getElementById('google-api-key').value.trim(),
            googleModel: document.getElementById('google-model').value.trim()
        };
    }

    // Validate form data
    validateFormData(formData) {
        const { apiProvider, openrouterApiKey, openrouterModel, googleApiKey, googleModel } = formData;
        
        if (apiProvider === 'google') {
            if (!googleApiKey || !googleModel) {
                alert('Please enter both API key and model for Google.');
                return false;
            }
        } else {
            if (!openrouterApiKey || !openrouterModel) {
                alert('Please enter both API key and model for OpenRouter.');
                return false;
            }
        }
        return true;
    }
} 