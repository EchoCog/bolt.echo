/**
 * Cognitive-state → Live2D expression mapping.
 *
 * Vendored from cogpy/live2d-mel's melody-adapter.ts (the Cubism runtime
 * adapter for the "Melody" avatar built for the Deep Tree Echo cognitive
 * avatar system). Only the expression/VAD-mapping surface is kept here —
 * the texture palette, accessory overlays, and DHI blend-shape bridge stay
 * in live2d-mel since bolt.echo doesn't render a Cubism canvas (no WebGL
 * runtime or model assets are bundled). This slice is what group chat
 * participants use to derive a facial "expression" from message content,
 * ready to hand off to a Cubism renderer later without changing the shape
 * of the data.
 */

export interface MelodyExtendedParams {
  /** Cyan iris glow intensity (0–1) */
  eyeGlow: number;
  /** Hair gradient shift purple↔cyan (0–1) */
  hairShift: number;
  /** Arm guard number glow pulse (0–1) */
  armGlow: number;
  /** Robot companion orb float intensity (0–1) */
  orbFloat: number;
}

export type MelodyExpression = 'default' | 'smirk' | 'excited' | 'shy' | 'angry' | 'surprised' | 'sad' | 'love';

export const MELODY_EXPRESSION_EMOJI: Record<MelodyExpression, string> = {
  default: '🙂',
  smirk: '😏',
  excited: '🤩',
  shy: '😳',
  angry: '😠',
  surprised: '😲',
  sad: '😔',
  love: '🥰',
};

/**
 * Maps DTE cognitive/emotional state to a Melody expression + extended params.
 * Integrates with the virtual endocrine system and ESN reservoir output.
 */
export interface CognitiveState {
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  dominance: number; // 0 to 1
  /** Reservoir output vector (optional) */
  reservoirActivation?: number[];
}

export function cognitiveStateToExpression(state: CognitiveState): {
  expression: MelodyExpression;
  blend: number;
  extras: Partial<MelodyExtendedParams>;
} {
  const { valence, arousal, dominance } = state;

  // Map VAD to expression
  let expression: MelodyExpression = 'default';
  let blend = 1.0;

  if (valence > 0.5 && arousal > 0.6) {
    expression = 'excited';
    blend = Math.min(1.0, arousal);
  } else if (valence > 0.3 && arousal < 0.4) {
    expression = 'love';
    blend = valence;
  } else if (valence > 0.1 && dominance > 0.5) {
    expression = 'smirk';
    blend = dominance;
  } else if (valence < -0.3 && arousal > 0.5) {
    expression = 'angry';
    blend = Math.abs(valence);
  } else if (valence < -0.2 && arousal < 0.4) {
    expression = 'sad';
    blend = Math.abs(valence);
  } else if (arousal > 0.7 && Math.abs(valence) < 0.3) {
    expression = 'surprised';
    blend = arousal;
  } else if (valence > 0 && dominance < 0.3) {
    expression = 'shy';
    blend = 1.0 - dominance;
  }

  // Map arousal to glow effects
  const extras: Partial<MelodyExtendedParams> = {
    eyeGlow: 0.5 + arousal * 0.5,
    hairShift: arousal * 0.6,
    armGlow: arousal > 0.7 ? (arousal - 0.7) * 3.33 : 0,
    orbFloat: valence > 0.3 ? valence : 0,
  };

  return { expression, blend, extras };
}
