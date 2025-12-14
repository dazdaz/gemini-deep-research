/**
 * Gemini Deep Research Agent Library
 * 
 * A comprehensive library for conducting deep research using the Gemini Interactions API.
 * 
 * @example
 * ```typescript
 * import { createDeepResearchAgent, loadDocumentsFromFolder } from 'gemini-research-agent';
 * 
 * const agent = createDeepResearchAgent(process.env.GEMINI_API_KEY);
 * 
 * // Simple research
 * const result = await agent.quickResearch('What are the latest advances in quantum computing?');
 * 
 * // Deep research with documents
 * const docs = await loadDocumentsFromFolder('./research-papers');
 * const result = await agent.deepResearch('Summarize the key findings', docs);
 * ```
 */

// Core exports
export { GeminiClient } from './client.js';
export { DeepResearchAgent, createDeepResearchAgent } from './deep-research.js';
export { 
  FileManager, 
  createFileManager, 
  loadDocument, 
  loadDocumentsFromFolder 
} from './file-manager.js';

// Type exports
export type {
  // Config
  GeminiConfig,
  
  // Interactions API
  InteractionType,
  InteractionState,
  Content,
  Part,
  InlineData,
  FileData,
  Session,
  CreateSessionRequest,
  InteractionRequest,
  InteractionResponse,
  ToolConfig,
  DeepResearchConfig,
  InteractionMetadata,
  TokenCount,
  
  // Research
  ResearchDepth,
  OutputFormat,
  SourceType,
  ResearchOptions,
  ResearchRequest,
  ResearchResult,
  ResearchMetadata,
  ResearchEvent,
  ResearchEventType,
  ResearchEventCallback,
  
  // Documents
  DocumentInput,
  FileUploadResult,
  FileFilters,
  ScanResult,
  ScannedFile,
  SkippedFile,
  
  // API
  ApiResponse,
  PaginatedResponse,
  SourceInfo,
  ErrorInfo,
} from './types.js';

// Version
export const VERSION = '1.0.0';

// Default configuration
export const DEFAULT_CONFIG = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  timeout: 300000, // 5 minutes
  defaultDepth: 'deep' as const,
  defaultFormat: 'markdown' as const,
};
