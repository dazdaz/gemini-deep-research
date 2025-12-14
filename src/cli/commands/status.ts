/**
 * Status Command
 * Check research session status
 */

import { GeminiClient } from '../../lib/client.js';
import { displayInfo, displayError, displaySuccess, displayTable } from '../utils/display.js';

interface StatusOptions {
  list: boolean;
}

export async function statusCommand(sessionId: string | undefined, options: StatusOptions): Promise<void> {
  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    displayError('GEMINI_API_KEY environment variable is not set.');
    displayInfo('Set it with: export GEMINI_API_KEY=your-api-key');
    process.exit(1);
  }

  const client = new GeminiClient({ apiKey });

  try {
    if (options.list) {
      // List all sessions
      displayInfo('Fetching sessions...\n');
      
      const result = await client.listSessions(20);
      
      if (!result.success) {
        displayError(`Failed to fetch sessions: ${result.error?.message || 'Unknown error'}`);
        process.exit(1);
      }

      const sessions = result.data?.sessions || [];
      
      if (sessions.length === 0) {
        displayInfo('No active sessions found.');
        return;
      }

      displaySuccess(`Found ${sessions.length} session(s)\n`);
      
      displayTable(
        ['Session ID', 'Display Name', 'Model', 'Created'],
        sessions.map(s => [
          s.name.split('/').pop() || s.name,
          s.displayName || '-',
          s.model?.split('/').pop() || '-',
          s.createTime ? new Date(s.createTime).toLocaleString() : '-',
        ])
      );
    } else if (sessionId) {
      // Get specific session
      displayInfo(`Fetching session: ${sessionId}\n`);
      
      const sessionName = sessionId.startsWith('sessions/') 
        ? sessionId 
        : `sessions/${sessionId}`;
      
      const result = await client.getSession(sessionName);
      
      if (!result.success) {
        displayError(`Failed to fetch session: ${result.error?.message || 'Unknown error'}`);
        process.exit(1);
      }

      const session = result.data!;
      
      displaySuccess('Session Details:\n');
      displayInfo(`  ID: ${session.name}`);
      displayInfo(`  Display Name: ${session.displayName || '-'}`);
      displayInfo(`  Model: ${session.model || '-'}`);
      displayInfo(`  Created: ${session.createTime ? new Date(session.createTime).toLocaleString() : '-'}`);
      displayInfo(`  Updated: ${session.updateTime ? new Date(session.updateTime).toLocaleString() : '-'}`);
      
      if (session.history && session.history.length > 0) {
        displayInfo(`\n  History: ${session.history.length} interaction(s)`);
        
        session.history.slice(-3).forEach((content, i) => {
          const preview = content.parts?.[0]?.text?.slice(0, 100) || '-';
          displayInfo(`    ${i + 1}. [${content.role}] ${preview}${preview.length >= 100 ? '...' : ''}`);
        });
      }
    } else {
      // No session ID provided, show help
      displayInfo('Usage:');
      displayInfo('  gemini-research status <sessionId>  - Get specific session status');
      displayInfo('  gemini-research status --list       - List all sessions');
      displayInfo('');
      displayInfo('Example:');
      displayInfo('  gemini-research status abc123');
      displayInfo('  gemini-research status sessions/abc123');
    }
  } catch (error) {
    displayError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
