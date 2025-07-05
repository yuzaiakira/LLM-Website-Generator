 // Code Editor with Live Preview Module

export class CodeEditor {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentCode = '';
        this.debounceTimer = null;
        this.isUpdating = false;
    }

    // Initialize DOM elements
    initializeElements() {
        this.codeTextarea = document.getElementById('generated-code');
        this.previewFrame = document.getElementById('preview-frame');
        this.codeContent = document.getElementById('code-content');
        this.demoContent = document.getElementById('demo-content');
    }

    // Bind event listeners
    bindEvents() {
        // Listen for code changes
        this.codeTextarea.addEventListener('input', (e) => {
            this.handleCodeChange(e.target.textContent);
        });

        // Listen for tab switches to sync content
        document.addEventListener('tabSwitched', (e) => {
            if (e.detail.tab === 'demo') {
                this.updatePreview(this.currentCode);
            }
        });
    }

    // Handle code changes with debouncing
    handleCodeChange(newCode) {
        this.currentCode = newCode;
        
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce the preview update to prevent excessive re-renders
        this.debounceTimer = setTimeout(() => {
            this.updatePreview(newCode);
        }, 300);
    }

    // Update the preview iframe with new code
    updatePreview(htmlCode) {
        if (!htmlCode || this.isUpdating) return;

        try {
            this.isUpdating = true;
            
            // Create a blob with the HTML content
            const blob = new Blob([htmlCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Update the iframe source
            this.previewFrame.src = url;
            
            // Clean up the previous URL to prevent memory leaks
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
            
        } catch (error) {
            console.error('Error updating preview:', error);
            // Show error in preview
            this.showPreviewError(error.message);
        } finally {
            this.isUpdating = false;
        }
    }

    // Show error in preview iframe
    showPreviewError(errorMessage) {
        const errorHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        background: #f8f9fa; 
                        color: #dc3545;
                    }
                    .error-container {
                        background: #f8d7da;
                        border: 1px solid #f5c6cb;
                        border-radius: 4px;
                        padding: 15px;
                        margin: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h3>Preview Error</h3>
                    <p>${errorMessage}</p>
                    <p>Please check your HTML code for syntax errors.</p>
                </div>
            </body>
            </html>
        `;
        
        const blob = new Blob([errorHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        this.previewFrame.src = url;
    }

    // Set new code content
    setCode(htmlCode) {
        this.currentCode = htmlCode || '';
        this.codeTextarea.textContent = this.currentCode;
        this.updatePreview(this.currentCode);
    }

    // Get current code content
    getCode() {
        return this.currentCode;
    }

    // Make code editable
    makeEditable() {
        this.codeTextarea.contentEditable = true;
        this.codeTextarea.classList.add('editable');
        this.codeTextarea.setAttribute('spellcheck', 'false');
        
        // Add visual indication that it's editable
        this.codeTextarea.style.cursor = 'text';
        this.codeTextarea.style.outline = 'none';
        this.codeTextarea.style.border = '1px solid rgba(59, 130, 246, 0.3)';
        
        // Ensure proper scrolling behavior
        this.codeTextarea.style.overflow = 'auto';
        this.codeTextarea.style.overflowX = 'auto';
        this.codeTextarea.style.overflowY = 'auto';
        this.codeTextarea.style.whiteSpace = 'pre';
        this.codeTextarea.style.wordBreak = 'keep-all';
        
        // Set proper height for scrolling
        this.codeTextarea.style.height = '100%';
        this.codeTextarea.style.minHeight = '200px';
    }

    // Make code read-only
    makeReadOnly() {
        this.codeTextarea.contentEditable = false;
        this.codeTextarea.classList.remove('editable');
        this.codeTextarea.style.cursor = 'default';
        this.codeTextarea.style.border = 'none';
    }

    // Check if code is valid HTML
    validateHTML(htmlCode) {
        try {
            // Basic HTML validation
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlCode, 'text/html');
            
            // Check for parsing errors
            const errors = doc.querySelectorAll('parsererror');
            if (errors.length > 0) {
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // Format the code (basic formatting)
    formatCode() {
        if (!this.currentCode) return;
        
        try {
            // Basic HTML formatting - this is a simple implementation
            // For more advanced formatting, consider using a library like prettier
            let formatted = this.currentCode
                .replace(/>\s+</g, '>\n<') // Add line breaks between tags
                .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
                .trim();
            
            this.setCode(formatted);
            
            // Emit event to reset editing indicator
            const event = new CustomEvent('codeFormatted');
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error formatting code:', error);
        }
    }

    // Clear the editor
    clear() {
        this.currentCode = '';
        this.codeTextarea.textContent = '';
        this.previewFrame.src = 'about:blank';
    }
}