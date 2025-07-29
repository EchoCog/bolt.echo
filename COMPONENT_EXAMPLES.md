# Bolt.new Component Examples

This document provides detailed examples and usage patterns for the key components in the Bolt.new codebase.

## Chat Components

### Basic Chat Implementation

```tsx
import { Chat } from '~/components/chat/Chat.client';
import { useChatHistory } from '~/lib/persistence';

function MyApp() {
  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <Chat 
      initialMessages={initialMessages}
      storeMessageHistory={storeMessageHistory}
    />
  );
}
```

### Custom Chat with Enhanced Features

```tsx
import { useStore } from '@nanostores/react';
import { useChat } from 'ai/react';
import { Chat } from '~/components/chat/Chat.client';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';

function CustomChat() {
  const { showChat } = useStore(chatStore);
  
  const { messages, isLoading, input, handleInputChange, append } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: () => {
      console.log('Chat finished');
    },
  });

  const handleSendMessage = async (event: React.UIEvent, messageInput?: string) => {
    const input = messageInput || input;
    
    if (input.length === 0 || isLoading) {
      return;
    }

    // Save all files before sending message
    await workbenchStore.saveAllFiles();
    
    // Get file modifications and include them in the message
    const fileModifications = workbenchStore.getFileModifcations();
    
    if (fileModifications) {
      const diff = fileModificationsToHTML(fileModifications);
      append({ 
        role: 'user', 
        content: `${diff}\n\n${input}` 
      });
      workbenchStore.resetAllFileModifications();
    } else {
      append({ role: 'user', content: input });
    }
  };

  return (
    <Chat 
      messages={messages}
      input={input}
      isLoading={isLoading}
      onSendMessage={handleSendMessage}
      onInputChange={handleInputChange}
    />
  );
}
```

### Custom Message Components

```tsx
import { UserMessage } from '~/components/chat/UserMessage';
import { AssistantMessage } from '~/components/chat/AssistantMessage';
import { CodeBlock } from '~/components/chat/CodeBlock';
import { Markdown } from '~/components/chat/Markdown';

function CustomMessages({ messages }) {
  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage>
              <Markdown>{message.content}</Markdown>
            </AssistantMessage>
          )}
        </div>
      ))}
    </div>
  );
}

// Custom CodeBlock with syntax highlighting
function CustomCodeBlock({ children, language, filename }) {
  return (
    <CodeBlock 
      language={language} 
      filename={filename}
    >
      {children}
    </CodeBlock>
  );
}
```

## Workbench Components

### Basic Workbench Setup

```tsx
import { Workbench } from '~/components/workbench/Workbench.client';
import { workbenchStore } from '~/lib/stores/workbench';

function MyWorkbench() {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const files = useStore(workbenchStore.files);

  const handleFileSelect = (filePath: string) => {
    workbenchStore.setSelectedFile(filePath);
  };

  const handleFileSave = async () => {
    await workbenchStore.saveCurrentDocument();
  };

  return (
    <Workbench 
      chatStarted={true}
      isStreaming={false}
    />
  );
}
```

### Custom Editor Panel

```tsx
import { EditorPanel } from '~/components/workbench/EditorPanel';
import { workbenchStore } from '~/lib/stores/workbench';

function CustomEditor() {
  const currentDocument = useStore(workbenchStore.currentDocument);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const files = useStore(workbenchStore.files);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);

  const handleEditorChange = (update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  };

  const handleEditorScroll = (position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  };

  const handleFileSelect = (filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  };

  const handleFileSave = () => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to save file');
    });
  };

  const handleFileReset = () => {
    workbenchStore.resetCurrentDocument();
  };

  return (
    <EditorPanel
      editorDocument={currentDocument}
      isStreaming={false}
      selectedFile={selectedFile}
      files={files}
      unsavedFiles={unsavedFiles}
      onFileSelect={handleFileSelect}
      onEditorScroll={handleEditorScroll}
      onEditorChange={handleEditorChange}
      onFileSave={handleFileSave}
      onFileReset={handleFileReset}
    />
  );
}
```

### File Tree Navigation

```tsx
import { FileTree } from '~/components/workbench/FileTree';
import { workbenchStore } from '~/lib/stores/workbench';

function CustomFileTree() {
  const files = useStore(workbenchStore.files);
  const selectedFile = useStore(workbenchStore.selectedFile);

  const handleFileSelect = (filePath: string) => {
    workbenchStore.setSelectedFile(filePath);
  };

  return (
    <div className="file-tree-container">
      <h3>Project Files</h3>
      <FileTree
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
```

### File Breadcrumb Navigation

```tsx
import { FileBreadcrumb } from '~/components/workbench/FileBreadcrumb';

function CustomBreadcrumb({ filePath }) {
  const handleNavigate = (path: string) => {
    // Navigate to the specified path
    console.log('Navigating to:', path);
  };

  return (
    <FileBreadcrumb
      filePath={filePath}
      onNavigate={handleNavigate}
    />
  );
}
```

## UI Components

### Dialog Usage

```tsx
import { Dialog, DialogButton, DialogTitle, DialogDescription } from '~/components/ui/Dialog';
import { useState } from 'react';

function CustomDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log('Confirmed!');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Dialog
      </button>

      {isOpen && (
        <Dialog onClose={handleCancel}>
          <DialogTitle>
            Confirm Action
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed with this action?
          </DialogDescription>
          <div className="flex gap-2 justify-end p-4">
            <DialogButton type="secondary" onClick={handleCancel}>
              Cancel
            </DialogButton>
            <DialogButton type="primary" onClick={handleConfirm}>
              Confirm
            </DialogButton>
          </div>
        </Dialog>
      )}
    </>
  );
}
```

### Icon Button Examples

```tsx
import { IconButton } from '~/components/ui/IconButton';

function IconButtonExamples() {
  return (
    <div className="flex gap-2">
      {/* Small button */}
      <IconButton
        icon="i-ph:plus"
        size="sm"
        onClick={() => console.log('Small button clicked')}
      />

      {/* Medium button with custom class */}
      <IconButton
        icon="i-ph:gear"
        size="md"
        className="bg-blue-500 hover:bg-blue-600"
        onClick={() => console.log('Settings clicked')}
      />

      {/* Large disabled button */}
      <IconButton
        icon="i-ph:trash"
        size="lg"
        disabled={true}
        onClick={() => console.log('This won\'t fire')}
      />

      {/* Extra large button */}
      <IconButton
        icon="i-ph:play"
        size="xl"
        onClick={() => console.log('Play clicked')}
      />
    </div>
  );
}
```

### Slider Component

```tsx
import { Slider } from '~/components/ui/Slider';
import { useState } from 'react';

function SliderExample() {
  const [selectedView, setSelectedView] = useState<'code' | 'preview'>('code');

  const sliderOptions = {
    left: {
      value: 'code' as const,
      text: 'Code Editor',
    },
    right: {
      value: 'preview' as const,
      text: 'Live Preview',
    },
  };

  return (
    <Slider
      selected={selectedView}
      options={sliderOptions}
      setSelected={setSelectedView}
    />
  );
}

// Generic slider example
function GenericSlider<T extends string>() {
  const [selected, setSelected] = useState<T>('option1' as T);

  const options = {
    left: {
      value: 'option1' as T,
      text: 'Option 1',
    },
    right: {
      value: 'option2' as T,
      text: 'Option 2',
    },
  };

  return (
    <Slider<T>
      selected={selected}
      options={options}
      setSelected={setSelected}
    />
  );
}
```

### Theme Switch

```tsx
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';

function ThemeSwitchExample() {
  const theme = useStore(themeStore);

  return (
    <div className="flex items-center gap-2">
      <span>Theme:</span>
      <ThemeSwitch />
      <span className="text-sm text-gray-500">
        Current: {theme}
      </span>
    </div>
  );
}
```

### Loading Dots

```tsx
import { LoadingDots } from '~/components/ui/LoadingDots';

function LoadingExample() {
  return (
    <div className="flex items-center gap-2">
      <span>Loading</span>
      <LoadingDots />
    </div>
  );
}
```

## Store Usage Examples

### Workbench Store Operations

```tsx
import { workbenchStore } from '~/lib/stores/workbench';
import { useStore } from '@nanostores/react';

function WorkbenchOperations() {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);

  const handleToggleWorkbench = () => {
    workbenchStore.setShowWorkbench(!showWorkbench);
  };

  const handleSaveAll = async () => {
    try {
      await workbenchStore.saveAllFiles();
      console.log('All files saved successfully');
    } catch (error) {
      console.error('Failed to save files:', error);
    }
  };

  const handleResetCurrent = () => {
    workbenchStore.resetCurrentDocument();
  };

  return (
    <div>
      <button onClick={handleToggleWorkbench}>
        {showWorkbench ? 'Hide' : 'Show'} Workbench
      </button>
      
      <button onClick={handleSaveAll} disabled={unsavedFiles.size === 0}>
        Save All Files ({unsavedFiles.size} unsaved)
      </button>
      
      <button onClick={handleResetCurrent}>
        Reset Current File
      </button>
      
      <div>
        Selected: {selectedFile || 'None'}
      </div>
    </div>
  );
}
```

### File Store Operations

```tsx
import { FilesStore } from '~/lib/stores/files';
import { webcontainer } from '~/lib/webcontainer';

function FileOperations() {
  const filesStore = new FilesStore(webcontainer);
  
  const handleSaveFile = async (filePath: string, content: string) => {
    try {
      await filesStore.saveFile(filePath, content);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleGetFile = (filePath: string) => {
    const file = filesStore.getFile(filePath);
    if (file) {
      console.log('File content:', file.content);
    } else {
      console.log('File not found');
    }
  };

  const handleGetModifications = () => {
    const modifications = filesStore.getFileModifications();
    if (modifications) {
      console.log('File modifications:', modifications);
    } else {
      console.log('No modifications');
    }
  };

  return (
    <div>
      <button onClick={() => handleSaveFile('/src/App.tsx', 'console.log("Hello")')}>
        Save File
      </button>
      
      <button onClick={() => handleGetFile('/src/App.tsx')}>
        Get File
      </button>
      
      <button onClick={handleGetModifications}>
        Get Modifications
      </button>
    </div>
  );
}
```

## Hook Usage Examples

### Custom Shortcuts Hook

```tsx
import { useShortcuts } from '~/lib/hooks/useShortcuts';
import { shortcutEventEmitter } from '~/lib/hooks/useShortcuts';

function CustomShortcuts() {
  useShortcuts(); // This sets up global keyboard listeners

  useEffect(() => {
    // Listen for custom shortcut events
    const unsubscribe = shortcutEventEmitter.on('save', () => {
      console.log('Save shortcut triggered');
      // Handle save action
    });

    return unsubscribe;
  }, []);

  return <div>Component with custom shortcuts</div>;
}
```

### Prompt Enhancer Hook

```tsx
import { usePromptEnhancer } from '~/lib/hooks/usePromptEnhancer';
import { useState } from 'react';

function PromptEnhancerExample() {
  const [input, setInput] = useState('');
  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();

  const handleEnhance = () => {
    enhancePrompt(input, setInput);
  };

  const handleReset = () => {
    resetEnhancer();
    setInput('');
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your prompt..."
        disabled={enhancingPrompt}
      />
      
      <div className="flex gap-2">
        <button 
          onClick={handleEnhance}
          disabled={enhancingPrompt || !input.trim()}
        >
          {enhancingPrompt ? 'Enhancing...' : 'Enhance Prompt'}
        </button>
        
        <button onClick={handleReset}>
          Reset
        </button>
      </div>
      
      {promptEnhanced && (
        <div className="text-green-600">
          Prompt enhanced successfully!
        </div>
      )}
    </div>
  );
}
```

### Message Parser Hook

```tsx
import { useMessageParser } from '~/lib/hooks/useMessageParser';
import { useEffect } from 'react';

function MessageParserExample({ messages, isLoading }) {
  const { parsedMessages, parseMessages } = useMessageParser();

  useEffect(() => {
    parseMessages(messages, isLoading);
  }, [messages, isLoading, parseMessages]);

  return (
    <div>
      {parsedMessages.map((parsedMessage, index) => (
        <div key={index}>
          <h4>Parsed Message {index + 1}:</h4>
          <pre>{parsedMessage}</pre>
        </div>
      ))}
    </div>
  );
}
```

### Snap Scroll Hook

```tsx
import { useSnapScroll } from '~/lib/hooks/useSnapScroll';

function SnapScrollExample() {
  const [messageRef, scrollRef] = useSnapScroll();

  return (
    <div 
      ref={scrollRef}
      className="h-96 overflow-y-auto border border-gray-300"
    >
      <div ref={messageRef}>
        {/* Messages will snap to this container */}
        <div className="p-4">Message 1</div>
        <div className="p-4">Message 2</div>
        <div className="p-4">Message 3</div>
        {/* More messages... */}
      </div>
    </div>
  );
}
```

## Utility Examples

### Logger Usage

```tsx
import { createScopedLogger } from '~/utils/logger';

function LoggerExample() {
  const logger = createScopedLogger('MyComponent');

  useEffect(() => {
    logger.info('Component mounted');
    
    return () => {
      logger.info('Component unmounted');
    };
  }, []);

  const handleClick = () => {
    logger.debug('Button clicked');
    
    try {
      // Some operation
      logger.info('Operation completed successfully');
    } catch (error) {
      logger.error('Operation failed', error);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Class Names Utility

```tsx
import { classNames } from '~/utils/classNames';

function ClassNamesExample({ isActive, isDisabled, variant }) {
  const buttonClass = classNames(
    'px-4 py-2 rounded',
    'font-medium transition-colors',
    {
      'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
      'bg-gray-500 hover:bg-gray-600 text-white': variant === 'secondary',
      'bg-red-500 hover:bg-red-600 text-white': variant === 'danger',
    },
    isActive && 'ring-2 ring-blue-300',
    isDisabled && 'opacity-50 cursor-not-allowed'
  );

  return (
    <button className={buttonClass} disabled={isDisabled}>
      Button
    </button>
  );
}
```

### Strip Indent Utility

```tsx
import { stripIndents } from '~/utils/stripIndent';

function StripIndentExample() {
  const code = stripIndents`
    function hello() {
      console.log('Hello, world!');
    }
  `;

  const template = stripIndents`
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  `;

  return (
    <div>
      <pre>{code}</pre>
      <div dangerouslySetInnerHTML={{ __html: template }} />
    </div>
  );
}
```

### Diff Utilities

```tsx
import { computeFileModifications, fileModificationsToHTML } from '~/utils/diff';

function DiffExample({ files, modifiedFiles }) {
  const modifications = computeFileModifications(files, modifiedFiles);
  
  if (modifications) {
    const htmlDiff = fileModificationsToHTML(modifications);
    
    return (
      <div>
        <h3>File Changes:</h3>
        <div dangerouslySetInnerHTML={{ __html: htmlDiff }} />
      </div>
    );
  }
  
  return <div>No changes detected</div>;
}
```

## Integration Examples

### Complete Chat + Workbench Integration

```tsx
import { Chat } from '~/components/chat/Chat.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';

function CompleteApp() {
  const chatStarted = useStore(chatStore.started);
  const isStreaming = useStore(chatStore.isStreaming);
  const showWorkbench = useStore(workbenchStore.showWorkbench);

  return (
    <div className="app-container">
      <div className="chat-section">
        <Chat />
      </div>
      
      {chatStarted && (
        <div className="workbench-section">
          <Workbench 
            chatStarted={chatStarted}
            isStreaming={isStreaming}
          />
        </div>
      )}
      
      {showWorkbench && (
        <div className="workbench-overlay">
          {/* Additional workbench UI */}
        </div>
      )}
    </div>
  );
}
```

### Custom Theme Integration

```tsx
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';

function ThemeIntegration() {
  const theme = useStore(themeStore);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Store theme preference
    localStorage.setItem('bolt_theme', theme);
  }, [theme]);

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    themeStore.theme.set(newTheme);
  };

  return (
    <div className={`theme-${theme}`}>
      <ThemeSwitch />
      <div className="content">
        {/* Your app content */}
      </div>
    </div>
  );
}
```

These examples demonstrate the most common usage patterns for the Bolt.new components, stores, hooks, and utilities. Each example can be customized and extended based on your specific requirements.