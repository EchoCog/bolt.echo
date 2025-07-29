export function getAPIKey(cloudflareEnv: Env) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `process.env`.
   */
  return (typeof process !== 'undefined' && process.env?.ANTHROPIC_API_KEY) || cloudflareEnv.ANTHROPIC_API_KEY;
}
