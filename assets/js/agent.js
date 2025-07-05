// LLM Agent Logic Module

export class LLMAgent {
    constructor(googleAPI, openRouterAPI) {
        this.googleAPI = googleAPI;
        this.openRouterAPI = openRouterAPI;
    }

    // Generate website using selected API
    async generateWebsite(description, apiProvider, apiKey, model) {
        if (apiProvider === 'google') {
            return this.googleAPI.generateWebsite(description, apiKey, model);
        } else {
            return this.openRouterAPI.generateWebsite(description, apiKey, model);
        }
    }

    // Create prompt for website generation
    createWebsitePrompt(description) {
        return `Create a complete, self-contained HTML website based on this description: "${description}"

Requirements:
1. Return ONLY the complete HTML code, no explanations
2. Include all CSS inline or via CDN
3. Include all JavaScript inline or via CDN
4. Use modern HTML5 standards
5. Make it responsive and mobile-friendly
6. Use a clean, professional design
7. Include Tailwind CSS via CDN for styling
8. The website should be fully functional and complete

Generate the complete HTML file:`;
    }

    // Extract HTML from LLM response
    extractHTMLFromResponse(content) {
        // Try to extract HTML code blocks
        const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/);
        if (htmlMatch) {
            return htmlMatch[1].trim();
        }
        // Try to extract code blocks without language specification
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
            return codeMatch[1].trim();
        }
        // If no code blocks found, return the entire content
        return content.trim();
    }
} 