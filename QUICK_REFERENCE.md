# Bolt.new Quick Reference Guide

A quick reference for the most commonly used APIs, components, and patterns in the Bolt.new codebase.

## 🚀 Quick Start

```tsx
import { Chat } from '~/components/chat/Chat.client';
import { Workbench } from '~/components/workbench/Workbench.client';

function App() {
  return (
    <div>
      <Chat />
      <Workbench chatStarted={true} />
    </div>
  );
}
```

## 📋 API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/chat` | POST | AI chat with streaming | `{ messages: Message[] }` |
| `/api/enhancer` | POST | Enhance user prompts | `{ message: string }` |

## 🧩 Core Components

### Chat Components
```tsx
// Main chat interface
<Chat />

// Individual message components
<UserMessage content="Hello" />
<AssistantMessage>AI response</AssistantMessage>
<CodeBlock language="javascript">console.log('Hello')</CodeBlock>
<Markdown>**Bold text**</Markdown>
```

### Workbench Components
```tsx
// Main workbench
<Workbench chatStarted={true} isStreaming={false} />

// Editor panel
<EditorPanel 
  editorDocument={document}
  selectedFile="/src/App.tsx"
  files={fileMap}
  onFileSelect={handleFileSelect}
/>

// File navigation
<FileTree files={files} selectedFile={selectedFile} onFileSelect={handleSelect} />
<FileBreadcrumb filePath="/src/components/Button.tsx" onNavigate={handleNavigate} />
```

### UI Components
```tsx
// Dialog
<Dialog onClose={handleClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogDescription>Description</DialogDescription>
  <DialogButton type="primary" onClick={handleConfirm}>Confirm</DialogButton>
</Dialog>

// Buttons
<IconButton icon="i-ph:plus" size="md" onClick={handleClick} />
<ThemeSwitch />

// Slider
<Slider selected={view} options={options} setSelected={setView} />
<LoadingDots />
```

## 🗃️ Stores

### WorkbenchStore
```tsx
import { workbenchStore } from '~/lib/stores/workbench';

// File operations
workbenchStore.setSelectedFile('/src/App.tsx');
workbenchStore.saveCurrentDocument();
workbenchStore.saveAllFiles();
workbenchStore.resetCurrentDocument();

// Workbench control
workbenchStore.setShowWorkbench(true);
workbenchStore.toggleTerminal(true);

// Get state
const selectedFile = useStore(workbenchStore.selectedFile);
const unsavedFiles = useStore(workbenchStore.unsavedFiles);
const files = useStore(workbenchStore.files);
```

### Other Stores
```tsx
// Chat state
const { showChat, started, aborted } = useStore(chatStore);

// Theme
const theme = useStore(themeStore);
themeStore.theme.set('dark');

// Settings
const shortcuts = useStore(settingsStore.shortcuts);
```

## 🪝 Hooks

### useShortcuts()
```tsx
import { useShortcuts } from '~/lib/hooks/useShortcuts';

function MyComponent() {
  useShortcuts(); // Sets up global keyboard listeners
}
```

### usePromptEnhancer()
```tsx
import { usePromptEnhancer } from '~/lib/hooks/usePromptEnhancer';

function MyComponent() {
  const { enhancingPrompt, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  
  const handleEnhance = () => {
    enhancePrompt(input, setInput);
  };
}
```

### useMessageParser()
```tsx
import { useMessageParser } from '~/lib/hooks/useMessageParser';

function MyComponent() {
  const { parsedMessages, parseMessages } = useMessageParser();
  
  useEffect(() => {
    parseMessages(messages, isLoading);
  }, [messages, isLoading]);
}
```

### useSnapScroll()
```tsx
import { useSnapScroll } from '~/lib/hooks/useSnapScroll';

function MyComponent() {
  const [messageRef, scrollRef] = useSnapScroll();
  
  return (
    <div ref={scrollRef}>
      <div ref={messageRef}>
        {/* Messages */}
      </div>
    </div>
  );
}
```

## 🛠️ Utilities

### Logger
```tsx
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('MyComponent');
logger.info('Component mounted');
logger.error('Error occurred', error);
```

### Class Names
```tsx
import { classNames } from '~/utils/classNames';

const className = classNames(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled'
);
```

### Strip Indent
```tsx
import { stripIndents } from '~/utils/stripIndent';

const code = stripIndents`
  function hello() {
    console.log('Hello');
  }
`;
```

### Diff Utilities
```tsx
import { computeFileModifications, fileModificationsToHTML } from '~/utils/diff';

const modifications = computeFileModifications(files, modifiedFiles);
const htmlDiff = fileModificationsToHTML(modifications);
```

## 📝 Common Patterns

### Chat with File Integration
```tsx
const handleSendMessage = async (input: string) => {
  // Save files before sending
  await workbenchStore.saveAllFiles();
  
  // Include file modifications in message
  const modifications = workbenchStore.getFileModifcations();
  if (modifications) {
    const diff = fileModificationsToHTML(modifications);
    append({ role: 'user', content: `${diff}\n\n${input}` });
    workbenchStore.resetAllFileModifications();
  } else {
    append({ role: 'user', content: input });
  }
};
```

### File Operations
```tsx
// Save file
await workbenchStore.saveFile('/src/App.tsx', content);

// Get file content
const file = workbenchStore.getFile('/src/App.tsx');
const content = file?.content;

// Check for unsaved changes
const unsavedFiles = workbenchStore.unsavedFiles.get();
const hasUnsavedChanges = unsavedFiles.size > 0;
```

### Theme Management
```tsx
// Get current theme
const theme = useStore(themeStore);

// Toggle theme
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  themeStore.theme.set(newTheme);
};

// Apply theme to document
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

### Dialog Usage
```tsx
const [isOpen, setIsOpen] = useState(false);

{isOpen && (
  <Dialog onClose={() => setIsOpen(false)}>
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>Are you sure?</DialogDescription>
    <div className="flex gap-2 justify-end p-4">
      <DialogButton type="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </DialogButton>
      <DialogButton type="primary" onClick={handleConfirm}>
        Confirm
      </DialogButton>
    </div>
  </Dialog>
)}
```

## 🎨 Styling

### CSS Classes
```css
/* Theme-aware colors */
.bg-bolt-elements-background-depth-1
.bg-bolt-elements-background-depth-2
.text-bolt-elements-textPrimary
.text-bolt-elements-textSecondary
.border-bolt-elements-borderColor

/* Button styles */
.bg-bolt-elements-button-primary-background
.bg-bolt-elements-button-secondary-background
.bg-bolt-elements-button-danger-background

/* Icon classes */
.i-ph:plus
.i-ph:gear
.i-ph:trash
```

### Animation Classes
```css
/* Transitions */
.transition-[left,width]
.duration-200
.bolt-ease-cubic-bezier

/* Z-index layers */
.z-workbench
.z-max
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for AI functionality
ANTHROPIC_API_KEY=your_api_key

# WebContainer configuration
WEB_CONTAINER_PROJECT_ID=your_project_id
```

### Package Scripts
```bash
# Development
pnpm dev

# Build
pnpm build

# Deploy
pnpm deploy

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix
```

## 🐛 Debugging

### Common Issues

1. **Chat not working**: Check API key configuration
2. **Files not saving**: Verify WebContainer permissions
3. **Theme not applying**: Check CSS custom properties
4. **Shortcuts not working**: Ensure useShortcuts() is called

### Debug Tools
```tsx
// Enable debug logging
const logger = createScopedLogger('Debug');
logger.debug('Debug info', { data });

// Check store state
console.log('Workbench state:', workbenchStore.get());
console.log('Files:', workbenchStore.files.get());
```

## 📚 Type Definitions

### Common Types
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

interface EditorDocument {
  filePath: string;
  value: string;
  scrollPosition?: ScrollPosition;
}

type FileMap = Record<string, File | Folder | undefined>;
```

This quick reference covers the most essential APIs and patterns. For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) and [COMPONENT_EXAMPLES.md](./COMPONENT_EXAMPLES.md).