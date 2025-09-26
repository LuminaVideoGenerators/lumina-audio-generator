exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt, minutes } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };
    const body = JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: 'You are a creative script writer for audio content.' },
            { role: 'user', content: `Generate a detailed, engaging script about "${prompt}". It should be designed to last approximately ${minutes} minutes when spoken at a normal pace (aim for about ${minutes * 150} words).` }
        ],
        max_tokens: minutes * 200,
        temperature: 0.8
    });

    try {
        const response = await fetch(url, { method: 'POST', headers, body });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        const script = data.choices[0].message.content.trim();
        return {
            statusCode: 200,
            body: JSON.stringify({ script })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate script: ' + error.message })
        };
    }
};