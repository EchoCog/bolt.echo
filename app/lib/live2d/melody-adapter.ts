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

export const MELODY_PARAM_DEFAULTS: MelodyExtendedParams = {
  eyeGlow: 0.7,
  hairShift: 0.0,
  armGlow: 0.0,
  orbFloat: 0.0,
};

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
 * Cubism-style face rig parameters. Named to match live2d-mel's
 * CubismParamSet so a future WebGL Cubism renderer can consume the same
 * values this package already computes.
 */
export interface CubismParamSet {
  ParamMouthForm: number;
  ParamMouthOpenY: number;
  ParamEyeLOpen: number;
  ParamEyeROpen: number;
  ParamEyeBallX: number;
  ParamEyeBallY: number;
  ParamBrowLY: number;
  ParamBrowRY: number;
  ParamBrowLAngle: number;
  ParamBrowRAngle: number;
  ParamAngleX?: number;
  ParamAngleY?: number;
}

export const MELODY_EXPRESSIONS: Record<MelodyExpression, { params: CubismParamSet; extras: Partial<MelodyExtendedParams> }> = {
  default: {
    params: {
      ParamMouthForm: 0.3,
      ParamMouthOpenY: 0.0,
      ParamEyeLOpen: 1.0,
      ParamEyeROpen: 1.0,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: 0.0,
      ParamBrowLY: 0.0,
      ParamBrowRY: 0.0,
      ParamBrowLAngle: 0.0,
      ParamBrowRAngle: 0.0,
    },
    extras: { eyeGlow: 0.7 },
  },
  smirk: {
    params: {
      ParamMouthForm: 0.6,
      ParamMouthOpenY: 0.05,
      ParamEyeLOpen: 0.8,
      ParamEyeROpen: 1.0,
      ParamEyeBallX: 0.1,
      ParamEyeBallY: 0.0,
      ParamBrowLY: 0.3,
      ParamBrowRY: 0.0,
      ParamBrowLAngle: 0.2,
      ParamBrowRAngle: -0.1,
    },
    extras: { eyeGlow: 0.9, hairShift: 0.2 },
  },
  excited: {
    params: {
      ParamMouthForm: 1.0,
      ParamMouthOpenY: 0.7,
      ParamEyeLOpen: 1.2,
      ParamEyeROpen: 1.2,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: 0.1,
      ParamBrowLY: 0.6,
      ParamBrowRY: 0.6,
      ParamBrowLAngle: 0.3,
      ParamBrowRAngle: 0.3,
    },
    extras: { eyeGlow: 1.0, hairShift: 0.5, armGlow: 0.8 },
  },
  shy: {
    params: {
      ParamMouthForm: 0.4,
      ParamMouthOpenY: 0.0,
      ParamEyeLOpen: 0.7,
      ParamEyeROpen: 0.7,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: -0.3,
      ParamBrowLY: -0.1,
      ParamBrowRY: -0.1,
      ParamBrowLAngle: 0.0,
      ParamBrowRAngle: 0.0,
      ParamAngleY: -0.2,
    },
    extras: { eyeGlow: 0.5, hairShift: 0.1 },
  },
  angry: {
    params: {
      ParamMouthForm: -0.5,
      ParamMouthOpenY: 0.0,
      ParamEyeLOpen: 0.6,
      ParamEyeROpen: 0.6,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: 0.0,
      ParamBrowLY: -0.4,
      ParamBrowRY: -0.4,
      ParamBrowLAngle: -0.5,
      ParamBrowRAngle: -0.5,
    },
    extras: { eyeGlow: 1.0, hairShift: 0.8, armGlow: 1.0 },
  },
  surprised: {
    params: {
      ParamMouthForm: 0.0,
      ParamMouthOpenY: 0.8,
      ParamEyeLOpen: 1.3,
      ParamEyeROpen: 1.3,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: 0.0,
      ParamBrowLY: 0.7,
      ParamBrowRY: 0.7,
      ParamBrowLAngle: 0.4,
      ParamBrowRAngle: 0.4,
    },
    extras: { eyeGlow: 1.0, hairShift: 0.3 },
  },
  sad: {
    params: {
      ParamMouthForm: -0.4,
      ParamMouthOpenY: 0.1,
      ParamEyeLOpen: 0.6,
      ParamEyeROpen: 0.6,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: -0.2,
      ParamBrowLY: 0.3,
      ParamBrowRY: 0.3,
      ParamBrowLAngle: -0.3,
      ParamBrowRAngle: -0.3,
    },
    extras: { eyeGlow: 0.3 },
  },
  love: {
    params: {
      ParamMouthForm: 1.0,
      ParamMouthOpenY: 0.4,
      ParamEyeLOpen: 0.7,
      ParamEyeROpen: 0.7,
      ParamEyeBallX: 0.0,
      ParamEyeBallY: 0.0,
      ParamBrowLY: 0.2,
      ParamBrowRY: 0.2,
      ParamBrowLAngle: 0.2,
      ParamBrowRAngle: 0.2,
    },
    extras: { eyeGlow: 1.0, hairShift: 0.7, orbFloat: 1.0 },
  },
};

/**
 * Blends a named expression's rig params toward neutral by `blend` (0-1),
 * matching how live2d-mel's Cubism runtime crossfades expressions.
 */
export function blendExpressionParams(expression: MelodyExpression, blend: number): CubismParamSet {
  const neutral = MELODY_EXPRESSIONS.default.params;
  const target = MELODY_EXPRESSIONS[expression].params;
  const t = Math.max(0, Math.min(1, blend));

  const lerp = (a: number | undefined, b: number | undefined) => (a ?? 0) + ((b ?? 0) - (a ?? 0)) * t;

  return {
    ParamMouthForm: lerp(neutral.ParamMouthForm, target.ParamMouthForm),
    ParamMouthOpenY: lerp(neutral.ParamMouthOpenY, target.ParamMouthOpenY),
    ParamEyeLOpen: lerp(neutral.ParamEyeLOpen, target.ParamEyeLOpen),
    ParamEyeROpen: lerp(neutral.ParamEyeROpen, target.ParamEyeROpen),
    ParamEyeBallX: lerp(neutral.ParamEyeBallX, target.ParamEyeBallX),
    ParamEyeBallY: lerp(neutral.ParamEyeBallY, target.ParamEyeBallY),
    ParamBrowLY: lerp(neutral.ParamBrowLY, target.ParamBrowLY),
    ParamBrowRY: lerp(neutral.ParamBrowRY, target.ParamBrowRY),
    ParamBrowLAngle: lerp(neutral.ParamBrowLAngle, target.ParamBrowLAngle),
    ParamBrowRAngle: lerp(neutral.ParamBrowRAngle, target.ParamBrowRAngle),
    ParamAngleX: lerp(neutral.ParamAngleX, target.ParamAngleX),
    ParamAngleY: lerp(neutral.ParamAngleY, target.ParamAngleY),
  };
}

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
