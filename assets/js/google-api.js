// Google API Integration Module

export class GoogleAPI {
    constructor(agent) {
        this.agent = agent;
    }

    // Generate website using Google API
    async generateWebsite(description, apiKey, model) {
        const prompt = this.agent.createWebsitePrompt(description);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const body = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096
            }
        };
        
        console.log('Sending request to Google API:', { 
            apiUrl: apiUrl.replace(apiKey, '***'), 
            model: model 
        });
        
        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        } catch (err) {
            console.error('Network error:', err);
            throw new Error('Network error. Please check your connection.');
        }
        
        console.log('Google API response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
            throw new Error('401 Unauthorized');
        }
        
        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
                console.error('Google API error response:', errorText);
            } catch (e) {
                errorText = 'Could not read error response';
            }
            throw new Error(`Google API error: ${response.status} - ${errorText}`);
        }
        
        let data;
        try {
            data = await response.json();
            console.log('Google API response:', data);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            throw new Error('Invalid response from Google API');
        }
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!content) {
            console.error('No content in Google API response:', data);
            throw new Error('No content received from Google API');
        }
        
        return this.agent.extractHTMLFromResponse(content);
    }
} 