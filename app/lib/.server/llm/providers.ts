/**
 * LLM Provider Adapters
 * 
 * Server-side adapters for OpenAI and Anthropic APIs.
 * Minimal implementation using fetch directly without external SDKs.
 */

// Provider types
export type ProviderId = 'openai' | 'anthropic';

// Common parameters for generation requests
export interface GenerateParams {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

/**
 * Generate text using OpenAI's API
 * @param apiKey OpenAI API key
 * @param params Generation parameters
 * @returns Generated text
 */
export async function generateWithOpenAI(apiKey: string, params: GenerateParams): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error(`Failed to generate with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate text using Anthropic's API
 * @param apiKey Anthropic API key
 * @param params Generation parameters
 * @returns Generated text
 */
export async function generateWithAnthropic(apiKey: string, params: GenerateParams): Promise<string> {
  try {
    // Convert message format from OpenAI-style to Anthropic-style
    const anthropicMessages = params.messages.map(msg => {
      // Anthropic uses "human" and "assistant" roles instead of "user" and "assistant"
      const role = msg.role === 'user' ? 'human' : 
                  msg.role === 'assistant' ? 'assistant' : 
                  'human'; // Map system messages to human for simplicity
      
      return {
        role,
        content: msg.content
      };
    });

    // If first message is system, handle it specially for Anthropic
    const systemMessage = params.messages[0]?.role === 'system' ? params.messages[0].content : undefined;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: params.model,
        messages: systemMessage ? anthropicMessages.slice(1) : anthropicMessages,
        system: systemMessage,
        max_tokens: 800,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
    }

    const data = await response.json() as any;
    return data.content[0]?.text || '';
  } catch (error) {
    console.error('Anthropic generation error:', error);
    throw new Error(`Failed to generate with Anthropic: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate text using the specified provider
 * @param provider Provider ID ('openai' or 'anthropic')
 * @param apiKey API key for the provider
 * @param params Generation parameters
 * @returns Generated text
 */
export async function generateWithProvider(
  provider: ProviderId, 
  apiKey: string, 
  params: GenerateParams
): Promise<string> {
  if (!apiKey) {
    throw new Error(`API key is required for ${provider}`);
  }

  switch (provider) {
    case 'openai':
      return generateWithOpenAI(apiKey, params);
    case 'anthropic':
      return generateWithAnthropic(apiKey, params);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
