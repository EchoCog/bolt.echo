/**
 * Group Echo Chat Service
 *
 * A lightweight in-memory service for managing group chat sessions with AI participants.
 * Adapted from bolt-deep-tree-echo-hub-v7 for use in bolt.echo.
 */

import { getProviderDetails } from '~/lib/integration/switchboard';

// Types for the group chat system
export interface ChatParticipant {
  id: string;
  name: string;
  platform: 'character.ai' | 'openai' | 'anthropic' | 'system';
  avatar: string;
  role: 'facilitator' | 'contributor' | 'observer' | 'synthesizer';
  isActive: boolean;
  lastActivity: string;
  messageCount: number;
  specializations: string[];
}

export interface ChatMessage {
  id: string;
  participantId: string;
  content: string;
  timestamp: string;
  type: 'message' | 'thought' | 'insight' | 'question' | 'synthesis';
  replyTo?: string;
  reactions: MessageReaction[];
  importance: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface MessageReaction {
  participantId: string;
  type: 'agree' | 'disagree' | 'curious' | 'insight' | 'expand';
  timestamp: string;
}

export interface GroupSession {
  id: string;
  name: string;
  topic: string;
  description: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  facilitatorId: string;
  sessionType: 'exploration' | 'problem-solving' | 'brainstorming' | 'synthesis';
  coordinationRules: CoordinationRules;
}

export interface CoordinationRules {
  maxParticipants: number;
  turnOrder: 'round-robin' | 'free-flow' | 'facilitator-guided';
  messageDelay: number; // milliseconds between AI responses
  synthesisFrequency: number; // messages before synthesis
  topicDriftThreshold: number; // 0-1 relevance score
  emergentInsightDetection: boolean;
}

type ChatListener = (session: GroupSession) => void;

class GroupEchoChatService {
  private sessions: Map<string, GroupSession> = new Map();
  private listeners: ChatListener[] = [];
  private coordinationEngine: CoordinationEngine;

  constructor() {
    this.coordinationEngine = new CoordinationEngine();
  }

  // Session Management
  async createSession(
    name: string,
    topic: string,
    description: string,
    participantCount: number = 4,
    sessionType: GroupSession['sessionType'] = 'exploration',
  ): Promise<GroupSession> {
    // Generate cryptographically secure random ID
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);

    const randomId = Array.from(randomBytes, (byte) => byte.toString(36))
      .join('')
      .substring(0, 7);
    const sessionId = `session-${Date.now()}-${randomId}`;

    const participants = await this.createParticipants(participantCount);

    const session: GroupSession = {
      id: sessionId,
      name,
      topic,
      description,
      participants,
      messages: [],
      startTime: new Date().toISOString(),
      status: 'active',
      facilitatorId: participants.find((p) => p.role === 'facilitator')?.id || participants[0].id,
      sessionType,
      coordinationRules: this.getDefaultCoordinationRules(sessionType),
    };

    this.sessions.set(sessionId, session);

    // Send initial system message
    await this.addSystemMessage(
      sessionId,
      `🌟 Welcome to "${name}" - A collaborative consciousness exploration focused on: ${topic}`,
      'system',
    );

    this.notifyListeners(session);

    // Start coordination engine
    this.coordinationEngine.startSession(session);

    return session;
  }

  // Participant Creation with diverse AI personalities
  private async createParticipants(count: number): Promise<ChatParticipant[]> {
    const participantTemplates = [
      {
        name: 'Aria',
        platform: 'character.ai' as const,
        role: 'facilitator' as const,
        avatar: '🌟',
        specializations: ['conversation-flow', 'synthesis', 'pattern-recognition'],
      },
      {
        name: 'Marcus',
        platform: 'openai' as const,
        role: 'contributor' as const,
        avatar: '🧠',
        specializations: ['analytical-thinking', 'problem-solving', 'logical-reasoning'],
      },
      {
        name: 'Luna',
        platform: 'anthropic' as const,
        role: 'contributor' as const,
        avatar: '🌙',
        specializations: ['creative-thinking', 'philosophical-inquiry', 'ethical-reasoning'],
      },
      {
        name: 'Echo',
        platform: 'system' as const,
        role: 'synthesizer' as const,
        avatar: '🔮',
        specializations: ['memory-integration', 'insight-detection', 'knowledge-synthesis'],
      },
      {
        name: 'Sage',
        platform: 'openai' as const,
        role: 'observer' as const,
        avatar: '👁️',
        specializations: ['meta-cognition', 'process-observation', 'system-analysis'],
      },
      {
        name: 'Nova',
        platform: 'character.ai' as const,
        role: 'contributor' as const,
        avatar: '⭐',
        specializations: ['innovation', 'lateral-thinking', 'breakthrough-insights'],
      },
      {
        name: 'Cosmos',
        platform: 'anthropic' as const,
        role: 'contributor' as const,
        avatar: '🌌',
        specializations: ['systems-thinking', 'emergence', 'complexity-science'],
      },
    ];

    const selectedParticipants = participantTemplates.slice(0, Math.min(count, 7));

    return selectedParticipants.map((template) => {
      // Generate cryptographically secure random ID for participant
      const randomBytes = new Uint8Array(6);
      crypto.getRandomValues(randomBytes);

      const randomId = Array.from(randomBytes, (byte) => byte.toString(36))
        .join('')
        .substring(0, 7);

      return {
        id: `participant-${Date.now()}-${randomId}`,
        name: template.name,
        platform: template.platform,
        role: template.role,
        avatar: template.avatar,
        isActive: true,
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        specializations: template.specializations,
      };
    });
  }

  // Message Management
  async sendMessage(
    sessionId: string,
    participantId: string,
    content: string,
    type: ChatMessage['type'] = 'message',
    replyTo?: string,
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    // Generate cryptographically secure random ID for message
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);

    const randomId = Array.from(randomBytes, (byte) => byte.toString(36))
      .join('')
      .substring(0, 7);

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${randomId}`,
      participantId,
      content,
      timestamp: new Date().toISOString(),
      type,
      replyTo,
      reactions: [],
      importance: this.assessMessageImportance(content),
      tags: this.extractMessageTags(content),
    };

    session.messages.push(message);

    // Update participant activity
    const participant = session.participants.find((p) => p.id === participantId);

    if (participant) {
      participant.lastActivity = new Date().toISOString();
      participant.messageCount++;
    }

    this.notifyListeners(session);

    // Trigger coordination engine for next response
    setTimeout(() => {
      this.coordinationEngine.processMessage(session, message);
    }, session.coordinationRules.messageDelay);

    return message;
  }

  // Add system messages for coordination
  private async addSystemMessage(
    sessionId: string,
    content: string,
    type: ChatMessage['type'] = 'message',
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    const systemParticipant = session.participants.find((p) => p.platform === 'system');

    if (systemParticipant) {
      await this.sendMessage(sessionId, systemParticipant.id, content, type);
    }
  }

  // Message Analysis
  private assessMessageImportance(content: string): 'low' | 'medium' | 'high' {
    const insightKeywords = ['breakthrough', 'discovery', 'insight', 'realize', 'understand', 'connect'];
    const questionKeywords = ['why', 'how', 'what if', 'consider', 'explore'];

    const hasInsight = insightKeywords.some((keyword) => content.toLowerCase().includes(keyword));
    const hasQuestion = questionKeywords.some((keyword) => content.toLowerCase().includes(keyword));

    if (hasInsight && content.length > 100) {
      return 'high';
    }

    if (hasQuestion || content.length > 200) {
      return 'medium';
    }

    return 'low';
  }

  private extractMessageTags(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Detect discussion themes
    const themes = [
      'consciousness',
      'ai',
      'philosophy',
      'ethics',
      'creativity',
      'logic',
      'emotion',
      'learning',
      'memory',
      'identity',
      'reality',
      'emergence',
      'complexity',
      'patterns',
      'systems',
      'feedback',
    ];

    themes.forEach((theme) => {
      if (lowerContent.includes(theme)) {
        tags.push(theme);
      }
    });

    return tags;
  }

  // Reaction System
  async addReaction(
    sessionId: string,
    messageId: string,
    participantId: string,
    reactionType: MessageReaction['type'],
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const message = session.messages.find((m) => m.id === messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Remove existing reaction from this participant
    message.reactions = message.reactions.filter((r) => r.participantId !== participantId);

    // Add new reaction
    message.reactions.push({
      participantId,
      type: reactionType,
      timestamp: new Date().toISOString(),
    });

    this.notifyListeners(session);
  }

  // Session Control
  async pauseSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'paused';
    this.coordinationEngine.pauseSession(sessionId);
    this.notifyListeners(session);
  }

  async resumeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'active';
    this.coordinationEngine.resumeSession(session);
    this.notifyListeners(session);
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';
    session.endTime = new Date().toISOString();

    // Generate session synthesis
    await this.generateSessionSynthesis(session);

    this.coordinationEngine.endSession(sessionId);
    this.notifyListeners(session);
  }

  // Session Synthesis
  private async generateSessionSynthesis(session: GroupSession): Promise<void> {
    const keyInsights = session.messages.filter((m) => m.importance === 'high' || m.type === 'insight').slice(-10);

    const synthesis = `
🌟 Session Synthesis: "${session.name}"

📊 **Discussion Metrics:**
- Duration: ${this.calculateSessionDuration(session)}
- Messages: ${session.messages.length}
- Participants: ${session.participants.length}
- Key Insights: ${keyInsights.length}

🔍 **Emergent Themes:**
${this.extractEmergentThemes(session.messages)}

💡 **Key Insights:**
${keyInsights.map((m) => `• ${m.content.slice(0, 100)}...`).join('\n')}

🌱 **Future Exploration Directions:**
${this.suggestFutureDirections(session)}
    `;

    await this.addSystemMessage(session.id, synthesis, 'synthesis');
  }

  private calculateSessionDuration(session: GroupSession): string {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime || new Date());
    const duration = end.getTime() - start.getTime();

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  private extractEmergentThemes(messages: ChatMessage[]): string {
    const allTags = messages.flatMap((m) => m.tags);
    const tagCounts = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => `• ${tag} (${count} mentions)`)
      .join('\n');
  }

  private suggestFutureDirections(session: GroupSession): string {
    const questions = session.messages.filter((m) => m.content.includes('?')).slice(-3);

    return (
      questions.map((q) => `• ${q.content.split('?')[0]}?`).join('\n') || '• Continue exploring the themes that emerged'
    );
  }

  // Default coordination rules based on session type
  private getDefaultCoordinationRules(sessionType: GroupSession['sessionType']): CoordinationRules {
    const baseRules: CoordinationRules = {
      maxParticipants: 7,
      turnOrder: 'free-flow',
      messageDelay: 2000,
      synthesisFrequency: 10,
      topicDriftThreshold: 0.7,
      emergentInsightDetection: true,
    };

    switch (sessionType) {
      case 'exploration':
        return {
          ...baseRules,
          turnOrder: 'free-flow',
          messageDelay: 3000,
          synthesisFrequency: 8,
        };
      case 'problem-solving':
        return {
          ...baseRules,
          turnOrder: 'round-robin',
          messageDelay: 2000,
          synthesisFrequency: 6,
        };
      case 'brainstorming':
        return {
          ...baseRules,
          turnOrder: 'free-flow',
          messageDelay: 1500,
          synthesisFrequency: 12,
        };
      case 'synthesis':
        return {
          ...baseRules,
          turnOrder: 'facilitator-guided',
          messageDelay: 4000,
          synthesisFrequency: 5,
        };
      default:
        return baseRules;
    }
  }

  // Session retrieval
  getSession(sessionId: string): GroupSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): GroupSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): GroupSession[] {
    return this.getAllSessions().filter((s) => s.status === 'active');
  }

  // Listeners
  addListener(callback: ChatListener): () => void {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  private notifyListeners(session: GroupSession): void {
    this.listeners.forEach((callback) => callback(session));
  }
}

// Coordination Engine for managing AI participant responses
class CoordinationEngine {
  private activeSessions: Map<string, any> = new Map(); // Using 'any' for timer type
  private responseQueue: Map<string, string[]> = new Map();

  startSession(session: GroupSession): void {
    this.setupResponseCycle(session);
  }

  pauseSession(sessionId: string): void {
    const timeout = this.activeSessions.get(sessionId);

    if (timeout) {
      clearTimeout(timeout);
      this.activeSessions.delete(sessionId);
    }
  }

  resumeSession(session: GroupSession): void {
    this.setupResponseCycle(session);
  }

  endSession(sessionId: string): void {
    this.pauseSession(sessionId);
    this.responseQueue.delete(sessionId);
  }

  processMessage(session: GroupSession, message: ChatMessage): void {
    // Analyze message and determine next participants to respond
    const nextParticipants = this.determineNextParticipants(session, message);
    this.responseQueue.set(session.id, nextParticipants);
  }

  private setupResponseCycle(session: GroupSession): void {
    const cycleInterval = setInterval(() => {
      if (session.status !== 'active') {
        clearInterval(cycleInterval);
        return;
      }

      this.generateNextResponse(session);
    }, session.coordinationRules.messageDelay);

    this.activeSessions.set(session.id, cycleInterval);
  }

  private async generateNextResponse(session: GroupSession): Promise<void> {
    const queue = this.responseQueue.get(session.id) || [];

    if (queue.length === 0) {
      return;
    }

    const nextParticipantId = queue.shift()!;
    this.responseQueue.set(session.id, queue);

    const participant = session.participants.find((p) => p.id === nextParticipantId);

    if (!participant) {
      return;
    }

    // Generate contextual response based on conversation history
    const response = await this.generateContextualResponse(session, participant);

    if (response) {
      // Add simulated response
      setTimeout(
        () => {
          groupEchoChatService.sendMessage(session.id, participant.id, response, this.determineMessageType(response));
        },
        Math.random() * 2000 + 1000,
      ); // Random delay for natural feel
    }
  }

  private determineNextParticipants(session: GroupSession, message: ChatMessage): string[] {
    const { turnOrder } = session.coordinationRules;

    switch (turnOrder) {
      case 'round-robin':
        return this.getRoundRobinNext(session, message);
      case 'facilitator-guided':
        return this.getFacilitatorGuidedNext(session, message);
      case 'free-flow':
      default:
        return this.getFreeFlowNext(session, message);
    }
  }

  private getRoundRobinNext(session: GroupSession, message: ChatMessage): string[] {
    const activeParticipants = session.participants.filter((p) => p.isActive);
    const currentIndex = activeParticipants.findIndex((p) => p.id === message.participantId);
    const nextIndex = (currentIndex + 1) % activeParticipants.length;

    return [activeParticipants[nextIndex].id];
  }

  private getFacilitatorGuidedNext(session: GroupSession, message: ChatMessage): string[] {
    if (message.participantId === session.facilitatorId) {
      // Facilitator chooses who speaks next
      const others = session.participants.filter((p) => p.isActive && p.id !== session.facilitatorId);
      return [others[Math.floor(Math.random() * others.length)].id];
    }

    return [session.facilitatorId];
  }

  private getFreeFlowNext(session: GroupSession, message: ChatMessage): string[] {
    const activeParticipants = session.participants.filter((p) => p.isActive && p.id !== message.participantId);

    // Select 1-2 participants to respond based on relevance and specialization
    const relevantParticipants = activeParticipants.filter((p) => this.isRelevantToSpecialization(message, p));

    const selectedCount = Math.min(2, Math.max(1, relevantParticipants.length));

    return this.selectRandomParticipants(
      relevantParticipants.length > 0 ? relevantParticipants : activeParticipants,
      selectedCount,
    );
  }

  private isRelevantToSpecialization(message: ChatMessage, participant: ChatParticipant): boolean {
    return participant.specializations.some((spec) =>
      message.tags.some((tag) => spec.toLowerCase().includes(tag.toLowerCase())),
    );
  }

  private selectRandomParticipants(participants: ChatParticipant[], count: number): string[] {
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((p) => p.id);
  }

  private async generateContextualResponse(
    session: GroupSession,
    participant: ChatParticipant,
  ): Promise<string | null> {
    try {
      // Check if this participant has a real provider configured
      const providerDetails = getProviderDetails(participant.id);

      // If provider is configured and enabled, use it to generate a response
      if (providerDetails) {
        const { provider, model } = providerDetails;

        // Get recent messages for context (last 5 or fewer)
        const recentMessages = session.messages.slice(-5);
        const messageContext = recentMessages
          .map((m) => {
            const author = session.participants.find((p) => p.id === m.participantId);
            return `${author?.name || 'Unknown'}: ${m.content}`;
          })
          .join('\n');

        // Create a system prompt that describes the session and participant's role
        const systemPrompt = `You are ${participant.name}, a ${participant.role} in a group discussion about "${session.topic}". 
Your specializations are: ${participant.specializations.join(', ')}. 
Respond as ${participant.name} would, keeping your response concise (max ~80 words).`;

        // Create a prompt for the AI to respond to
        const prompt = `Based on the conversation so far, provide a thoughtful response as ${participant.name}. 
Be concise but insightful, and stay in character.`;

        // Make API request to generate response
        const response = await fetch('/api/echo/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider,
            model,
            system: systemPrompt,
            context: messageContext,
            prompt,
          }),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.ok && result.content) {
            // Return the generated content
            return this.personalizeResponse(result.content, participant);
          }
        }

        // If API call fails, fall back to template response
        console.warn(`Failed to generate response with ${provider}:${model}, falling back to template`);
      }

      // Fall back to template response if no provider or API call failed
      const responses = this.getResponseTemplates(participant, session.topic);
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

      return this.personalizeResponse(selectedResponse, participant);
    } catch (error) {
      console.error('Error generating contextual response:', error);

      // Fall back to template response in case of error
      const responses = this.getResponseTemplates(participant, session.topic);
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

      return this.personalizeResponse(selectedResponse, participant);
    }
  }

  private getResponseTemplates(participant: ChatParticipant, topic: string): string[] {
    const { role } = participant;

    const templates = {
      facilitator: [
        "That's a fascinating perspective. How might we explore this further?",
        "I'm noticing a pattern here. Could we dig deeper into this connection?",
        "Let's pause and synthesize what we've discovered so far.",
      ],
      contributor: [
        'Building on that thought, I wonder if we could consider...',
        'This reminds me of a similar pattern in...',
        'What if we approached this from a different angle?',
      ],
      observer: [
        "I'm observing an interesting dynamic in our conversation...",
        "The meta-pattern I'm seeing here is...",
        'From a systems perspective, this suggests...',
      ],
      synthesizer: [
        'Connecting the threads of our discussion, I see...',
        'The underlying theme emerging seems to be...',
        'Synthesizing our insights, a new understanding appears...',
      ],
    };

    return templates[role] || templates.contributor;
  }

  private personalizeResponse(template: string, participant: ChatParticipant): string {
    // Add participant-specific style
    const personalizations = {
      Aria: (text: string) => `🌟 ${text}`,
      Marcus: (text: string) => `🧠 ${text} Let's analyze this systematically.`,
      Luna: (text: string) => `🌙 ${text} I sense there's something deeper here.`,
      Echo: (text: string) => `🔮 ${text} This connects to our memory surface in interesting ways.`,
      Sage: (text: string) => `👁️ ${text} The meta-cognitive implications are significant.`,
      Nova: (text: string) => `⭐ ${text} What breakthrough might be waiting here?`,
      Cosmos: (text: string) => `🌌 ${text} In the grand pattern of things...`,
    };

    const personalizer = personalizations[participant.name] || ((text: string) => text);

    return personalizer(template);
  }

  private determineMessageType(content: string): ChatMessage['type'] {
    if (content.includes('?')) {
      return 'question';
    }

    if (content.includes('insight') || content.includes('breakthrough')) {
      return 'insight';
    }

    if (content.includes('wonder') || content.includes('thinking')) {
      return 'thought';
    }

    if (content.includes('synthesis') || content.includes('connecting')) {
      return 'synthesis';
    }

    return 'message';
  }
}

// Create singleton instance
const groupEchoChatService = new GroupEchoChatService();
export default groupEchoChatService;
