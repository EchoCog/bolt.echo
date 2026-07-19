import { memo } from 'react';
import { blendExpressionParams, MELODY_PARAM_DEFAULTS, type MelodyExpression } from '~/lib/live2d/melody-adapter';

interface MelodyAvatarCanvasProps {
  expression: MelodyExpression;
  blend: number;
  size?: number;
  className?: string;
}

/**
 * Renders live articulation for a Deep Tree Echo chat participant, driven
 * by the same Cubism-style rig parameters cogpy/live2d-mel's Cubism
 * runtime consumes (eyes, brows, mouth, glow). This is an SVG stand-in for
 * the real Live2D Cubism Core renderer — Cubism Core is a licensed,
 * closed-source runtime that can't be vendored here — but every value
 * drawn below is the exact param bolt.echo would hand to a WebGL Cubism
 * renderer if/when one is wired up.
 */
function MelodyAvatarCanvasImpl({ expression, blend, size = 64, className }: MelodyAvatarCanvasProps) {
  const params = blendExpressionParams(expression, blend);
  const eyeGlow = MELODY_PARAM_DEFAULTS.eyeGlow;

  const eyeLHeight = 6 + params.ParamEyeLOpen * 6;
  const eyeRHeight = 6 + params.ParamEyeROpen * 6;
  const eyeOffsetX = params.ParamEyeBallX * 3;
  const eyeOffsetY = -params.ParamEyeBallY * 3;

  const browLY = -18 + params.ParamBrowLY * -6 - params.ParamBrowLAngle * 2;
  const browRY = -18 + params.ParamBrowRY * -6 + params.ParamBrowRAngle * 2;

  const mouthOpen = Math.max(0, params.ParamMouthOpenY) * 10;
  const mouthCurve = params.ParamMouthForm * 10;

  const tiltX = (params.ParamAngleX ?? 0) * 6;
  const tiltY = (params.ParamAngleY ?? 0) * 6;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Avatar expression: ${expression}`}
    >
      <defs>
        <radialGradient id="melody-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity={eyeGlow} />
          <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
        </radialGradient>
      </defs>

      <g transform={`translate(${tiltX} ${tiltY})`}>
        {/* Head */}
        <circle cx="32" cy="32" r="28" fill="#2D1B69" opacity={0.15} />
        <circle cx="32" cy="32" r="24" fill="#FFE4C4" />

        {/* Brows */}
        <line x1="16" y1={32 + browLY} x2="26" y2={32 + browLY} stroke="#4B0082" strokeWidth={2} strokeLinecap="round" />
        <line x1="38" y1={32 + browRY} x2="48" y2={32 + browRY} stroke="#4B0082" strokeWidth={2} strokeLinecap="round" />

        {/* Eyes */}
        <g transform={`translate(${eyeOffsetX} ${eyeOffsetY})`}>
          <circle cx="21" cy="30" r="10" fill="url(#melody-glow)" />
          <circle cx="43" cy="30" r="10" fill="url(#melody-glow)" />
          <ellipse cx="21" cy="30" rx="4" ry={Math.max(0.5, eyeLHeight / 2)} fill="#00E5FF" />
          <ellipse cx="43" cy="30" rx="4" ry={Math.max(0.5, eyeRHeight / 2)} fill="#00E5FF" />
        </g>

        {/* Mouth */}
        <path
          d={`M 22 44 Q 32 ${44 + mouthCurve + mouthOpen} 42 44`}
          fill="none"
          stroke="#4B0082"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export const MelodyAvatarCanvas = memo(MelodyAvatarCanvasImpl);
