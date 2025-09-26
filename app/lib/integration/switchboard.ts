/**
 * Switchboard Integration Hub
 *
 * Client-side switchboard to control which provider each participant uses in group chats.
 * Maintains an in-memory map of participant configurations.
 */

// Provider types
export type ProviderId = 'simulated' | 'openai' | 'anthropic';

// Configuration for a provider
export interface ProviderConfig {
  enabled: boolean;
  provider: ProviderId;
  model?: string;
}

// Default models for each provider
export const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
};

// Default configuration (simulated and disabled)
const DEFAULT_CONFIG: ProviderConfig = {
  enabled: false,
  provider: 'simulated',
};

/**
 * Switchboard class to manage participant provider configurations
 */
class Switchboard {
  private participantConfigs: Map<string, ProviderConfig> = new Map();

  /**
   * Set configuration for a specific participant
   */
  setParticipantConfig(participantId: string, config: ProviderConfig): void {
    this.participantConfigs.set(participantId, {
      ...config,

      // Ensure model is set if using a real provider
      model:
        config.provider !== 'simulated' && !config.model
          ? DEFAULT_MODELS[config.provider as keyof typeof DEFAULT_MODELS]
          : config.model,
    });
  }

  /**
   * Get configuration for a specific participant
   * Returns undefined if not explicitly set
   */
  getParticipantConfig(participantId: string): ProviderConfig | undefined {
    return this.participantConfigs.get(participantId);
  }

  /**
   * Get configuration for a specific participant
   * Returns default config if not explicitly set
   */
  getParticipantConfigWithDefault(participantId: string): ProviderConfig {
    return this.participantConfigs.get(participantId) || { ...DEFAULT_CONFIG };
  }

  /**
   * Get all participant configurations
   */
  getAll(): Record<string, ProviderConfig> {
    const configs: Record<string, ProviderConfig> = {};
    this.participantConfigs.forEach((config, id) => {
      configs[id] = config;
    });

    return configs;
  }

  /**
   * Set multiple participant configurations at once
   */
  setMany(configMap: Record<string, ProviderConfig>): void {
    Object.entries(configMap).forEach(([participantId, config]) => {
      this.setParticipantConfig(participantId, config);
    });
  }

  /**
   * Clear all configurations
   */
  clear(): void {
    this.participantConfigs.clear();
  }

  /**
   * Check if a participant has a real provider configured and enabled
   */
  hasRealProviderEnabled(participantId: string): boolean {
    const config = this.getParticipantConfigWithDefault(participantId);
    return config.enabled && config.provider !== 'simulated';
  }

  /**
   * Get provider details for a participant
   */
  getProviderDetails(participantId: string): { provider: ProviderId; model?: string } | null {
    const config = this.getParticipantConfigWithDefault(participantId);

    if (!config.enabled) {
      return null;
    }

    return {
      provider: config.provider,
      model:
        config.provider !== 'simulated'
          ? config.model || DEFAULT_MODELS[config.provider as keyof typeof DEFAULT_MODELS]
          : undefined,
    };
  }
}

// Create singleton instance
const switchboard = new Switchboard();

// Export functions
export const setParticipantConfig = (id: string, config: ProviderConfig) =>
  switchboard.setParticipantConfig(id, config);

export const getParticipantConfig = (id: string): ProviderConfig | undefined => switchboard.getParticipantConfig(id);

export const getAll = (): Record<string, ProviderConfig> => switchboard.getAll();

export const setMany = (map: Record<string, ProviderConfig>) => switchboard.setMany(map);

export const hasRealProviderEnabled = (id: string): boolean => switchboard.hasRealProviderEnabled(id);

export const getProviderDetails = (id: string) => switchboard.getProviderDetails(id);

export default switchboard;
