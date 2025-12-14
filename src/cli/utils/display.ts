/**
 * Display Utilities
 * Terminal output formatting for the CLI
 */

import { ResearchResult } from '../../lib/types.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * Display an info message
 */
export function displayInfo(message: string): void {
  console.log(`${colors.cyan}${message}${colors.reset}`);
}

/**
 * Display an error message
 */
export function displayError(message: string): void {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

/**
 * Display a success message
 */
export function displaySuccess(message: string): void {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Display a warning message
 */
export function displayWarning(message: string): void {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Display progress message
 */
export function displayProgress(message: string): void {
  // Clear line and write progress
  process.stdout.write(`\r${colors.dim}⟳ ${message}${colors.reset}                    `);
}

/**
 * Display a research result
 */
export function displayResult(result: ResearchResult): void {
  console.log(`${colors.bold}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}                    RESEARCH RESULTS                          ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  // Status
  const statusColor = result.status === 'completed' ? colors.green : colors.red;
  console.log(`${colors.bold}Status:${colors.reset} ${statusColor}${result.status.toUpperCase()}${colors.reset}`);
  
  // Query
  console.log(`${colors.bold}Query:${colors.reset} ${result.query}`);
  
  // Metadata
  if (result.metadata) {
    console.log(`${colors.bold}Depth:${colors.reset} ${result.metadata.depth}`);
    console.log(`${colors.bold}Processing Time:${colors.reset} ${(result.metadata.processingTime / 1000).toFixed(2)}s`);
    console.log(`${colors.bold}Documents Used:${colors.reset} ${result.metadata.documentsUsed}`);
    console.log(`${colors.bold}Sources Found:${colors.reset} ${result.metadata.sourcesFound}`);
  }
  
  console.log('');
  console.log(`${colors.dim}───────────────────────────────────────────────────────────────${colors.reset}`);
  console.log('');

  // Content
  if (result.content) {
    console.log(result.content);
  } else if (result.error) {
    displayError(result.error);
  } else {
    displayWarning('No content returned');
  }

  // Sources
  if (result.sources && result.sources.length > 0) {
    console.log('');
    console.log(`${colors.dim}───────────────────────────────────────────────────────────────${colors.reset}`);
    console.log('');
    console.log(`${colors.bold}${colors.blue}Sources (${result.sources.length}):${colors.reset}`);
    console.log('');
    
    result.sources.forEach((source, index) => {
      console.log(`${colors.cyan}${index + 1}. ${source.title}${colors.reset}`);
      console.log(`   ${colors.dim}${source.url}${colors.reset}`);
      if (source.snippet) {
        console.log(`   ${colors.dim}${source.snippet.slice(0, 150)}${source.snippet.length > 150 ? '...' : ''}${colors.reset}`);
      }
      console.log('');
    });
  }

  console.log(`${colors.bold}${colors.magenta}═══════════════════════════════════════════════════════════════${colors.reset}`);
}

/**
 * Display a simple table
 */
export function displayTable(headers: string[], rows: string[][]): void {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map(r => (r[i] || '').length));
    return Math.max(h.length, maxRowWidth);
  });

  // Create separator
  const separator = widths.map(w => '─'.repeat(w + 2)).join('┼');

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
  console.log(`${colors.bold}${headerRow}${colors.reset}`);
  console.log(`${colors.dim}${separator}${colors.reset}`);

  // Print rows
  rows.forEach(row => {
    const rowStr = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' │ ');
    console.log(rowStr);
  });
}

/**
 * Display a spinner
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private current = 0;
  private interval: NodeJS.Timeout | null = null;
  private message: string;

  constructor(message: string = 'Loading...') {
    this.message = message;
  }

  start(): void {
    this.interval = setInterval(() => {
      process.stdout.write(`\r${colors.cyan}${this.frames[this.current]} ${this.message}${colors.reset}`);
      this.current = (this.current + 1) % this.frames.length;
    }, 80);
  }

  update(message: string): void {
    this.message = message;
  }

  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (finalMessage) {
      process.stdout.write(`\r${colors.green}✓ ${finalMessage}${colors.reset}\n`);
    } else {
      process.stdout.write('\r');
    }
  }

  fail(message: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r${colors.red}✗ ${message}${colors.reset}\n`);
  }
}

/**
 * Create a progress bar
 */
export function progressBar(current: number, total: number, width: number = 40): string {
  const percentage = Math.floor((current / total) * 100);
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${colors.cyan}[${bar}]${colors.reset} ${percentage}%`;
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Wrap text to specified width
 */
export function wrapText(text: string, width: number = 80): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > width) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}
