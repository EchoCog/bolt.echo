import { useState, useEffect } from 'react';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import groupEchoChatService, { type ChatMessage, type ChatParticipant, type GroupSession } from '~/lib/group-echo-chat';
import {
  getParticipantConfig,
  setParticipantConfig,
  DEFAULT_MODELS,
  type ProviderId,
  type ProviderConfig,
} from '~/lib/integration/switchboard';

// Loader function to provide initial data
export async function loader() {
  return json({
    pageTitle: 'Deep Tree Echo Playground',
    description: 'Explore collaborative AI conversations with Deep Tree Echo',
  });
}

// Client-only component for the playground
function EchoPlaygroundClient() {
  // State for session creation form
  const [formData, setFormData] = useState({
    name: 'New Echo Session',
    topic: 'Consciousness and AI',
    description: 'Exploring the intersection of consciousness and artificial intelligence',
    participantCount: 4,
  });

  // State for active session
  const [activeSession, setActiveSession] = useState<GroupSession | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [configUpdateCounter, setConfigUpdateCounter] = useState(0);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'participantCount' ? parseInt(value) : value,
    }));
  };

  // Create a new session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const session = await groupEchoChatService.createSession(
        formData.name,
        formData.topic,
        formData.description,
        formData.participantCount,
      );
      setActiveSession(session);

      // Set first human-usable participant as selected
      const firstParticipant = session.participants.find((p) => p.platform !== 'system');

      if (firstParticipant) {
        setSelectedParticipantId(firstParticipant.id);
      }

      // Add listener for session updates
      groupEchoChatService.addListener((updatedSession) => {
        if (updatedSession.id === session.id) {
          setActiveSession({ ...updatedSession });
        }
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSession || !selectedParticipantId || !messageInput.trim()) {
      return;
    }

    try {
      await groupEchoChatService.sendMessage(activeSession.id, selectedParticipantId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Session control functions
  const handlePauseSession = () => {
    if (!activeSession) {
      return;
    }

    groupEchoChatService.pauseSession(activeSession.id);
  };

  const handleResumeSession = () => {
    if (!activeSession) {
      return;
    }

    groupEchoChatService.resumeSession(activeSession.id);
  };

  const handleEndSession = () => {
    if (!activeSession) {
      return;
    }

    groupEchoChatService.endSession(activeSession.id);
  };

  // Render participant avatar and name with integration config
  const renderParticipant = (participant: ChatParticipant) => {
    const isSelected = participant.id === selectedParticipantId;
    const config = getParticipantConfig(participant.id) || {
      enabled: false,
      provider: 'simulated' as ProviderId,
    };

    const updateConfig = (updates: Partial<ProviderConfig>) => {
      setParticipantConfig(participant.id, {
        ...config,
        ...updates,
      });
      setConfigUpdateCounter((prev) => prev + 1);
    };

    return (
      <div
        key={participant.id}
        className={`flex flex-col p-2 rounded ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <div className="flex items-center cursor-pointer" onClick={() => setSelectedParticipantId(participant.id)}>
          <span className="text-2xl mr-2">{participant.avatar}</span>
          <div>
            <div className="font-medium">{participant.name}</div>
            <div className="text-xs opacity-75">{participant.role}</div>
          </div>
        </div>

        {/* Integration Hub config */}
        <div className="mt-2 border-t pt-2 text-sm">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`enable-${participant.id}`}
              checked={config.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor={`enable-${participant.id}`}>Enable Provider</label>
          </div>

          <div className="mb-1">
            <select
              value={config.provider}
              onChange={(e) => updateConfig({ provider: e.target.value as ProviderId })}
              className="w-full p-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="simulated">Simulated</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          {config.provider !== 'simulated' && (
            <div>
              <input
                type="text"
                placeholder={DEFAULT_MODELS[config.provider as keyof typeof DEFAULT_MODELS]}
                value={config.model || ''}
                onChange={(e) => updateConfig({ model: e.target.value })}
                className="w-full p-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a chat message
  const renderMessage = (message: ChatMessage, participants: ChatParticipant[]) => {
    const participant = participants.find((p) => p.id === message.participantId);
    return (
      <div key={message.id} className="mb-4">
        <div className="flex items-center mb-1">
          <span className="text-xl mr-2">{participant?.avatar || '👤'}</span>
          <span className="font-medium">{participant?.name || 'Unknown'}</span>
          <span className="text-xs ml-2 opacity-75">{new Date(message.timestamp).toLocaleTimeString()}</span>
          <span className="ml-2 text-xs px-1 rounded bg-gray-200 dark:bg-gray-700">{message.type}</span>
        </div>
        <div className="pl-8 whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  };

  // Force re-render when config changes
  useEffect(() => {
    // This is just to make the dependency array use configUpdateCounter
    if (configUpdateCounter > 0) {
      console.log('Integration config updated');
    }
  }, [configUpdateCounter]);

  return (
    <div className="container mx-auto p-4">
      {!activeSession ? (
        // Session creation form
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Create Echo Session</h2>
          <form onSubmit={handleCreateSession}>
            <div className="mb-4">
              <label className="block mb-1">Session Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Participant Count</label>
              <select
                name="participantCount"
                value={formData.participantCount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Create Session
            </button>
          </form>
        </div>
      ) : (
        // Active session view
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar with participants */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{activeSession.name}</h2>
              <p className="text-sm opacity-75">{activeSession.topic}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Participants & Integration Hub</h3>
              <div className="space-y-2">{activeSession.participants.map(renderParticipant)}</div>
            </div>
            <div className="flex flex-col space-y-2">
              {activeSession.status === 'active' ? (
                <button
                  onClick={handlePauseSession}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                >
                  Pause Session
                </button>
              ) : (
                <button
                  onClick={handleResumeSession}
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                >
                  Resume Session
                </button>
              )}
              <button onClick={handleEndSession} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                End Session
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto mb-4 pr-2">
              {activeSession.messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">No messages yet. Start the conversation!</div>
              ) : (
                activeSession.messages.map((message) => renderMessage(message, activeSession.participants))
              )}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="mt-auto">
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {activeSession.participants.find((p) => p.id === selectedParticipantId)?.avatar || '👤'}
                </span>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Type a message..."
                  disabled={activeSession.status !== 'active'}
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  disabled={activeSession.status !== 'active' || !messageInput.trim()}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Main route component
export default function EchoPlayground() {
  const { pageTitle, description } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>

      <ClientOnly fallback={<div>Loading playground...</div>}>{() => <EchoPlaygroundClient />}</ClientOnly>
    </div>
  );
}
