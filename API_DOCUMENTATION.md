# Bolt.new API Documentation

## Overview

Bolt.new is an AI-powered web development agent that allows you to prompt, run, edit, and deploy full-stack applications directly from your browser. This documentation covers all public APIs, functions, and components available in the codebase.

## Table of Contents

1. [Core Application](#core-application)
2. [API Routes](#api-routes)
3. [Components](#components)
4. [Stores](#stores)
5. [Hooks](#hooks)
6. [Utilities](#utilities)
7. [Types](#types)

---

## Core Application

### Root Component (`app/root.tsx`)

The main application root component that sets up the application structure, theme, and global styles.

#### Exports

- **`App`** - Main application component
- **`Layout`** - Layout wrapper component
- **`Head`** - Head component for meta tags and stylesheets
- **`links`** - Function returning stylesheet links

#### Usage

```tsx
import { App, Layout, Head, links } from '~/root';

// The App component is automatically used as the default export
// Layout wraps the application with theme and scroll restoration
// Head provides meta tags and stylesheets
// links function provides CSS imports
```

---

## API Routes

### Chat API (`app/routes/api.chat.ts`)

Handles AI chat interactions with streaming support and automatic continuation for long responses.

#### Endpoint: `POST /api/chat`

#### Request Body

```typescript
{
  messages: Message[] // Array of chat messages
}
```

#### Response

Returns a streaming response with AI-generated text.

#### Features

- **Streaming**: Real-time text streaming from AI models
- **Auto-continuation**: Automatically continues long responses that exceed token limits
- **Error handling**: Graceful error handling with appropriate HTTP status codes

#### Usage

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ]
  })
});

// Handle streaming response
const reader = response.body?.getReader();
// Process stream...
```

### Enhancer API (`app/routes/api.enhancer.ts`)

Improves user prompts using AI to make them more specific and effective.

#### Endpoint: `POST /api/enhancer`

#### Request Body

```typescript
{
  message: string // The original prompt to enhance
}
```

#### Response

Returns a streaming response with the enhanced prompt.

#### Usage

```typescript
const response = await fetch('/api/enhancer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Create a todo app'
  })
});

// Handle streaming response for enhanced prompt
```

---

## Components

### Chat Components

#### `Chat.client.tsx`

Main chat interface component that handles user interactions and AI responses.

##### Props

```typescript
interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
}
```

##### Features

- **Message streaming**: Real-time display of AI responses
- **File modifications**: Automatically includes file changes in messages
- **Prompt enhancement**: Built-in prompt improvement functionality
- **Keyboard shortcuts**: Global shortcut support
- **Toast notifications**: User feedback for actions

##### Usage

```tsx
import { Chat } from '~/components/chat/Chat.client';

<Chat />
```

#### `BaseChat.tsx`

Base chat component providing the UI structure for the chat interface.

##### Props

```typescript
interface BaseChatProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  input: string;
  showChat: boolean;
  chatStarted: boolean;
  isStreaming: boolean;
  enhancingPrompt: boolean;
  promptEnhanced: boolean;
  sendMessage: (event: React.UIEvent, messageInput?: string) => void;
  messageRef: RefObject<HTMLDivElement>;
  scrollRef: RefObject<HTMLDivElement>;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleStop: () => void;
  messages: Message[];
  enhancePrompt: () => void;
}
```

#### `Messages.client.tsx`

Component for rendering chat messages with proper formatting.

##### Props

```typescript
interface MessagesProps {
  messages: Message[];
  messageRef: RefObject<HTMLDivElement>;
  scrollRef: RefObject<HTMLDivElement>;
}
```

#### `UserMessage.tsx`

Component for rendering user messages.

#### `AssistantMessage.tsx`

Component for rendering AI assistant messages.

#### `CodeBlock.tsx`

Component for rendering code blocks with syntax highlighting.

##### Props

```typescript
interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
}
```

#### `Markdown.tsx`

Component for rendering markdown content with proper formatting.

##### Props

```typescript
interface MarkdownProps {
  children: string;
}
```

#### `Artifact.tsx`

Component for rendering AI-generated artifacts and actions.

##### Props

```typescript
interface ArtifactProps {
  id: string;
  title: string;
  closed: boolean;
  children: ReactNode;
}
```

### Workbench Components

#### `Workbench.client.tsx`

Main workbench component providing the development environment interface.

##### Props

```typescript
interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}
```

##### Features

- **File editing**: Integrated code editor
- **Preview mode**: Live preview of applications
- **Terminal integration**: Built-in terminal support
- **File tree**: File system navigation
- **View switching**: Toggle between code and preview modes

#### `EditorPanel.tsx`

Panel component for the code editor interface.

##### Props

```typescript
interface EditorPanelProps {
  editorDocument?: EditorDocument;
  isStreaming?: boolean;
  selectedFile?: string;
  files: FileMap;
  unsavedFiles: Set<string>;
  onFileSelect: (filePath: string | undefined) => void;
  onEditorScroll: (position: ScrollPosition) => void;
  onEditorChange: (update: EditorUpdate) => void;
  onFileSave: () => void;
  onFileReset: () => void;
}
```

#### `FileTree.tsx`

Component for displaying and navigating the file system.

##### Props

```typescript
interface FileTreeProps {
  files: FileMap;
  selectedFile?: string;
  onFileSelect: (filePath: string) => void;
}
```

#### `Preview.tsx`

Component for rendering live previews of applications.

#### `FileBreadcrumb.tsx`

Component for displaying file path breadcrumbs.

##### Props

```typescript
interface FileBreadcrumbProps {
  filePath: string;
  onNavigate: (path: string) => void;
}
```

### UI Components

#### `Dialog.tsx`

Modal dialog component with animations and backdrop.

##### Props

```typescript
interface DialogProps {
  children: ReactNode | ReactNode[];
  className?: string;
  onBackdrop?: (event: React.UIEvent) => void;
  onClose?: (event: React.UIEvent) => void;
}
```

##### Sub-components

- **`DialogButton`**: Button component for dialogs
  ```typescript
  interface DialogButtonProps {
    type: 'primary' | 'secondary' | 'danger';
    children: ReactNode;
    onClick?: (event: React.UIEvent) => void;
  }
  ```
- **`DialogTitle`**: Title component for dialogs
- **`DialogDescription`**: Description component for dialogs

#### `IconButton.tsx`

Button component with icon support.

##### Props

```typescript
interface IconButtonProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: (event: React.UIEvent) => void;
  disabled?: boolean;
}
```

#### `Slider.tsx`

Slider component for switching between options.

##### Props

```typescript
interface SliderOptions<T> {
  left: {
    value: T;
    text: string;
  };
  right: {
    value: T;
    text: string;
  };
}

interface SliderProps<T> {
  selected: T;
  options: SliderOptions<T>;
  setSelected: (value: T) => void;
}
```

#### `ThemeSwitch.tsx`

Component for switching between light and dark themes.

#### `LoadingDots.tsx`

Loading animation component with animated dots.

#### `PanelHeader.tsx`

Header component for panels.

#### `PanelHeaderButton.tsx`

Button component for panel headers.

---

## Stores

### WorkbenchStore (`app/lib/stores/workbench.ts`)

Main store for managing the workbench state and functionality.

#### Properties

```typescript
class WorkbenchStore {
  artifacts: MapStore<Record<string, ArtifactState>>;
  showWorkbench: WritableAtom<boolean>;
  currentView: WritableAtom<WorkbenchViewType>;
  unsavedFiles: WritableAtom<Set<string>>;
  modifiedFiles: Set<string>;
  artifactIdList: string[];
}
```

#### Methods

```typescript
// File management
setDocuments(files: FileMap): void;
setSelectedFile(filePath: string | undefined): void;
setCurrentDocumentContent(newContent: string): void;
setCurrentDocumentScrollPosition(position: ScrollPosition): void;
saveFile(filePath: string): Promise<void>;
saveCurrentDocument(): Promise<void>;
saveAllFiles(): Promise<void>;
resetCurrentDocument(): void;
getFileModifcations(): FileModifications | undefined;
resetAllFileModifications(): void;

// Workbench control
setShowWorkbench(show: boolean): void;
toggleTerminal(value?: boolean): void;
attachTerminal(terminal: ITerminal): void;
onTerminalResize(cols: number, rows: number): void;

// Artifact management
addArtifact(data: ArtifactCallbackData): void;
updateArtifact(data: ArtifactCallbackData, state: Partial<ArtifactUpdateState>): void;
addAction(data: ActionCallbackData): Promise<void>;
runAction(data: ActionCallbackData): Promise<void>;
abortAllActions(): void;
```

#### Usage

```typescript
import { workbenchStore } from '~/lib/stores/workbench';

// Show/hide workbench
workbenchStore.setShowWorkbench(true);

// Select a file
workbenchStore.setSelectedFile('/src/App.tsx');

// Save current document
await workbenchStore.saveCurrentDocument();

// Get file modifications
const modifications = workbenchStore.getFileModifcations();
```

### FilesStore (`app/lib/stores/files.ts`)

Store for managing file system operations and state.

#### Properties

```typescript
class FilesStore {
  files: MapStore<FileMap>;
  filesCount: number;
}
```

#### Methods

```typescript
getFile(filePath: string): File | undefined;
getFileModifications(): FileModifications | undefined;
resetFileModifications(): void;
saveFile(filePath: string, content: string): Promise<void>;
```

#### Types

```typescript
interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;
type FileMap = Record<string, Dirent | undefined>;
```

### EditorStore (`app/lib/stores/editor.ts`)

Store for managing editor state and document content.

#### Properties

```typescript
class EditorStore {
  documents: MapStore<Record<string, EditorDocument>>;
  selectedFile: WritableAtom<string | undefined>;
  currentDocument: ReadableAtom<EditorDocument | undefined>;
}
```

#### Methods

```typescript
setDocuments(files: FileMap): void;
setSelectedFile(filePath: string | undefined): void;
updateFile(filePath: string, content: string): void;
updateScrollPosition(filePath: string, position: ScrollPosition): void;
```

### ChatStore (`app/lib/stores/chat.ts`)

Store for managing chat state.

#### Properties

```typescript
interface ChatStore {
  showChat: WritableAtom<boolean>;
  started: WritableAtom<boolean>;
  aborted: WritableAtom<boolean>;
}
```

### ThemeStore (`app/lib/stores/theme.ts`)

Store for managing application theme.

#### Properties

```typescript
interface ThemeStore {
  theme: WritableAtom<'light' | 'dark'>;
}
```

### SettingsStore (`app/lib/stores/settings.ts`)

Store for managing application settings.

#### Properties

```typescript
interface SettingsStore {
  shortcuts: WritableAtom<Shortcuts>;
}
```

### TerminalStore (`app/lib/stores/terminal.ts`)

Store for managing terminal state.

#### Properties

```typescript
class TerminalStore {
  showTerminal: WritableAtom<boolean>;
}
```

#### Methods

```typescript
toggleTerminal(value?: boolean): void;
attachTerminal(terminal: ITerminal): void;
onTerminalResize(cols: number, rows: number): void;
```

### PreviewsStore (`app/lib/stores/previews.ts`)

Store for managing application previews.

#### Properties

```typescript
class PreviewsStore {
  previews: MapStore<Preview[]>;
}
```

---

## Hooks

### `useShortcuts()` (`app/lib/hooks/useShortcuts.ts`)

Hook for handling global keyboard shortcuts.

#### Returns

`void` - Sets up global keyboard event listeners

#### Usage

```tsx
import { useShortcuts } from '~/lib/hooks/useShortcuts';

function MyComponent() {
  useShortcuts();
  // Component will now respond to configured shortcuts
}
```

### `usePromptEnhancer()` (`app/lib/hooks/usePromptEnhancer.ts`)

Hook for enhancing user prompts using AI.

#### Returns

```typescript
{
  enhancingPrompt: boolean;
  promptEnhanced: boolean;
  enhancePrompt: (input: string, setInput: (value: string) => void) => Promise<void>;
  resetEnhancer: () => void;
}
```

#### Usage

```tsx
import { usePromptEnhancer } from '~/lib/hooks/usePromptEnhancer';

function MyComponent() {
  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  
  const handleEnhance = () => {
    enhancePrompt(input, setInput);
  };
}
```

### `useMessageParser()` (`app/lib/hooks/useMessageParser.ts`)

Hook for parsing and processing chat messages.

#### Returns

```typescript
{
  parsedMessages: string[];
  parseMessages: (messages: Message[], isLoading: boolean) => void;
}
```

#### Usage

```tsx
import { useMessageParser } from '~/lib/hooks/useMessageParser';

function MyComponent() {
  const { parsedMessages, parseMessages } = useMessageParser();
  
  useEffect(() => {
    parseMessages(messages, isLoading);
  }, [messages, isLoading]);
}
```

### `useSnapScroll()` (`app/lib/hooks/useSnapScroll.ts`)

Hook for implementing snap scrolling behavior.

#### Returns

```typescript
[messageRef: RefObject<HTMLDivElement>, scrollRef: RefObject<HTMLDivElement>]
```

#### Usage

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

---

## Utilities

### Crypto Utilities (`app/lib/crypto.ts`)

Utilities for cryptographic operations.

#### Functions

```typescript
function generateKey(): Promise<CryptoKey>;
function encrypt(data: string, key: CryptoKey): Promise<string>;
function decrypt(encryptedData: string, key: CryptoKey): Promise<string>;
```

### Fetch Utilities (`app/lib/fetch.ts`)

Enhanced fetch utilities with error handling.

#### Functions

```typescript
function fetchWithTimeout(url: string, options?: RequestInit & { timeout?: number }): Promise<Response>;
```

### Recursive Pattern (`app/lib/recursive-pattern.ts`)

Utilities for handling recursive patterns in data structures.

#### Functions

```typescript
function findRecursivePattern<T>(items: T[], pattern: (item: T) => boolean): T[];
```

### Logger (`app/utils/logger.ts`)

Logging utilities for debugging and monitoring.

#### Functions

```typescript
function createScopedLogger(scope: string): Logger;
const renderLogger: Logger;
```

#### Usage

```typescript
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('MyComponent');
logger.info('Component mounted');
logger.error('An error occurred', error);
```

### Class Names (`app/utils/classNames.ts`)

Utility for conditionally joining CSS class names.

#### Function

```typescript
function classNames(...classes: (string | boolean | undefined | null)[]): string;
```

#### Usage

```typescript
import { classNames } from '~/utils/classNames';

const className = classNames(
  'base-class',
  isActive && 'active',
  isDisabled && 'disabled'
);
```

### Easings (`app/utils/easings.ts`)

Easing functions for animations.

#### Functions

```typescript
function cubicEasingFn(t: number): number;
```

### Strip Indent (`app/utils/stripIndent.ts`)

Utility for removing common indentation from template literals.

#### Function

```typescript
function stripIndents(strings: TemplateStringsArray, ...values: any[]): string;
```

#### Usage

```typescript
import { stripIndents } from '~/utils/stripIndent';

const code = stripIndents`
  function hello() {
    console.log('Hello, world!');
  }
`;
```

### Diff Utilities (`app/utils/diff.ts`)

Utilities for computing and displaying file differences.

#### Functions

```typescript
function computeFileModifications(files: FileMap, modifiedFiles: Map<string, string>): FileModifications | undefined;
function fileModificationsToHTML(modifications: FileModifications): string;
```

### Constants (`app/utils/constants.ts`)

Application constants.

#### Constants

```typescript
const WORK_DIR: string;
const MAX_TOKENS: number;
const MAX_RESPONSE_SEGMENTS: number;
```

---

## Types

### Message Types

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}
```

### Editor Types

```typescript
interface EditorDocument {
  filePath: string;
  value: string;
  scrollPosition?: ScrollPosition;
}

interface ScrollPosition {
  top: number;
  left: number;
}

interface EditorUpdate {
  content: string;
  // Additional editor-specific properties
}
```

### File Types

```typescript
interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

interface Folder {
  type: 'folder';
}

type Dirent = File | Folder;
type FileMap = Record<string, Dirent | undefined>;
```

### Terminal Types

```typescript
interface ITerminal {
  write(data: string): void;
  resize(cols: number, rows: number): void;
  // Additional terminal methods
}
```

### Artifact Types

```typescript
interface ArtifactState {
  id: string;
  title: string;
  closed: boolean;
  runner: ActionRunner;
}

interface ArtifactCallbackData {
  messageId: string;
  title: string;
  id: string;
}

interface ActionCallbackData {
  messageId: string;
  actionId: string;
  // Additional action-specific properties
}
```

### Settings Types

```typescript
interface Shortcuts {
  [key: string]: {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    ctrlOrMetaKey?: boolean;
    action: () => void;
  };
}
```

---

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run development server: `pnpm dev`

### Basic Usage

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

### Configuration

The application can be configured through various stores and environment variables. Key configuration options include:

- **Theme**: Light/dark mode via `themeStore`
- **Shortcuts**: Keyboard shortcuts via `settingsStore`
- **API Endpoints**: Configured in environment variables
- **WebContainer**: Development environment settings

---

## Contributing

For information on contributing to the Bolt.new codebase, see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.