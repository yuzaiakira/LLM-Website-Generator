// OpenRouter API Integration Module

export class OpenRouterAPI {
    constructor(agent) {
        this.agent = agent;
    }

    // Generate website using OpenRouter API
    async generateWebsite(description, apiKey, model) {
        const prompt = this.agent.createWebsitePrompt(description);
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'LLM Website Generator'
        };
        
        const body = {
            model: model,
            messages: [
                { role: 'system', content: 'You are an expert web developer. Generate a complete, self-contained HTML website based on the user\'s description.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.2,
            stream: false
        };
        
        console.log('Sending request to OpenRouter:', { 
            apiUrl, 
            model: model, 
            headers: { ...headers, Authorization: 'Bearer ***' }
        });
        
        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error('Network error:', err);
            throw new Error('Network error. Please check your connection.');
        }
        
        console.log('OpenRouter response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
            throw new Error('401 Unauthorized');
        }
        
        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
                console.error('OpenRouter API error response:', errorText);
            } catch (e) {
                errorText = 'Could not read error response';
            }
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
        
        let data;
        try {
            data = await response.json();
            console.log('OpenRouter response:', data);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            throw new Error('Invalid response from OpenRouter API');
        }
        
        const content = data.choices?.[0]?.message?.content || '';
        if (!content) {
            console.error('No content in OpenRouter response:', data);
            throw new Error('No content received from OpenRouter API');
        }
        
        return this.agent.extractHTMLFromResponse(content);
    }
} 