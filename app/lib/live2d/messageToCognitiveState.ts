import type { ChatMessage } from '~/lib/group-echo-chat';
import { type CognitiveState, cognitiveStateToExpression, type MelodyExpression } from './melody-adapter';

const POSITIVE_WORDS = ['insight', 'breakthrough', 'agree', 'great', 'love', 'excited', 'wonderful', 'discover'];
const NEGATIVE_WORDS = ['disagree', 'wrong', 'concern', 'problem', 'sad', 'fail', 'worry'];

/**
 * Derives a rough valence/arousal/dominance reading from a chat message's
 * type, content, and reaction tally, so group-chat participants can drive
 * a Live2D expression (see app/lib/live2d/melody-adapter.ts) without an
 * actual sentiment model.
 */
export function messageToCognitiveState(message: ChatMessage): CognitiveState {
  const content = message.content.toLowerCase();

  const positiveHits = POSITIVE_WORDS.filter((word) => content.includes(word)).length;
  const negativeHits = NEGATIVE_WORDS.filter((word) => content.includes(word)).length;
  const exclamations = (message.content.match(/!/g) || []).length;
  const questions = (message.content.match(/\?/g) || []).length;

  const agreeCount = message.reactions.filter((r) => r.type === 'agree' || r.type === 'insight').length;
  const disagreeCount = message.reactions.filter((r) => r.type === 'disagree').length;

  let valence = clamp(0.15 * (positiveHits - negativeHits) + 0.1 * (agreeCount - disagreeCount), -1, 1);
  let arousal = clamp(0.2 + 0.15 * exclamations + 0.1 * questions + (message.importance === 'high' ? 0.3 : 0), 0, 1);
  const dominance = clamp(message.type === 'synthesis' || message.type === 'insight' ? 0.65 : 0.4, 0, 1);

  if (message.type === 'question') {
    arousal = clamp(arousal + 0.1, 0, 1);
  }

  if (message.type === 'insight') {
    valence = clamp(valence + 0.2, -1, 1);
  }

  return { valence, arousal, dominance };
}

export function messageToExpression(message: ChatMessage): { expression: MelodyExpression; blend: number } {
  const { expression, blend } = cognitiveStateToExpression(messageToCognitiveState(message));
  return { expression, blend };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
