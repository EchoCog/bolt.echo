import { json } from "@remix-run/cloudflare";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { generateWithProvider } from "~/lib/.server/llm/providers";

export async function action({ request, context }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse request body
    const body = await request.json() as any;
    
    // Validate required fields
    const { provider, model, system, context, prompt } = body;
    
    if (!provider || (provider !== 'openai' && provider !== 'anthropic')) {
      return json(
        { ok: false, error: "Invalid provider. Must be 'openai' or 'anthropic'" },
        { status: 400 }
      );
    }
    
    if (!model) {
      return json(
        { ok: false, error: "Model is required" },
        { status: 400 }
      );
    }
    
    if (!prompt) {
      return json(
        { ok: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    // First check process.env, then Cloudflare environment if available
    let apiKey = provider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : process.env.ANTHROPIC_API_KEY;
    
    // Check Cloudflare environment if available
    if (!apiKey && context && typeof context === 'object') {
      const env = context.env || context;
      apiKey = provider === 'openai' 
        ? env.OPENAI_API_KEY 
        : env.ANTHROPIC_API_KEY;
    }
    
    if (!apiKey) {
      return json(
        { ok: false, error: `API key for ${provider} is not configured` },
        { status: 401 }
      );
    }

    // Prepare messages for the provider
    const messages = [];
    
    // Add system message if provided
    if (system) {
      messages.push({
        role: 'system',
        content: system
      });
    }
    
    // Add context as a user message if provided
    if (context) {
      messages.push({
        role: 'user',
        content: context
      });
    }
    
    // Add the actual prompt as a user message
    messages.push({
      role: 'user',
      content: prompt
    });

    // Generate response using the provider
    const content = await generateWithProvider(
      provider,
      apiKey,
      {
        model,
        messages
      }
    );

    // Return successful response
    return json({ ok: true, content });
    
  } catch (error) {
    console.error('Text generation error:', error);
    
    return json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
