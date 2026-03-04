interface AIRequestParams {
    prompt: string;
    model: 'fast' | 'smart' | 'best';
}

const MODEL_ALIASES = {
    fast: 'openai/gpt-4o-mini',
    smart: 'anthropic/claude-sonnet-4-5',
    best: 'anthropic/claude-opus-4-5',
} as const;

export class AIError extends Error {
    code: string;
    constructor(message: string, code: string = 'GENERATION_FAILED') {
        super(message);
        this.name = 'AIError';
        this.code = code;
    }
}

export async function callAI({ prompt, model }: AIRequestParams): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AIError('OpenRouter API key is missing', 'SERVER_ERROR');
    }

    const actualModel = MODEL_ALIASES[model];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: actualModel,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        throw new AIError(`AI generation failed with status ${response.status}`, 'GENERATION_FAILED');
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
        throw new AIError('Invalid response format from AI', 'GENERATION_FAILED');
    }

    return content;
}

/**
 * Strips markdown backticks and other common artifacts from AI JSON responses
 */
export function cleanAIJSON(response: string): string {
    return response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
}

/**
 * Safely parses AI-generated JSON by cleaning it first
 */
export function parseAIJSON<T>(response: string): T {
    try {
        const cleaned = cleanAIJSON(response)
        return JSON.parse(cleaned) as T
    } catch (error: any) {
        console.error('Failed to parse AI JSON:', response)
        throw new Error(`AI generated invalid format: ${error.message}`)
    }
}
