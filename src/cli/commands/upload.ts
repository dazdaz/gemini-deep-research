/**
 * Upload Command
 * Upload files for analysis
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileManager } from '../../lib/file-manager.js';
import { displayInfo, displayError, displaySuccess, displayTable } from '../utils/display.js';

interface UploadOptions {
  recursive: boolean;
  types?: string;
  maxSize: string;
}

export async function uploadCommand(files: string[], options: UploadOptions): Promise<void> {
  const fileManager = new FileManager({
    recursive: options.recursive,
    extensions: options.types 
      ? options.types.split(',').map(t => `.${t.trim()}`)
      : undefined,
    maxFileSize: parseInt(options.maxSize) * 1024 * 1024,
  });

  displayInfo('Scanning files and folders...\n');

  const allFiles: { name: string; path: string; size: number; type: string }[] = [];
  const errors: string[] = [];

  for (const filePath of files) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      errors.push(`File not found: ${filePath}`);
      continue;
    }

    const stats = fs.statSync(absolutePath);

    if (stats.isDirectory()) {
      // Scan folder
      try {
        const scanResult = fileManager.scanFolder(absolutePath);
        
        displayInfo(`Folder: ${filePath}`);
        displayInfo(`  Found: ${scanResult.files.length} files`);
        displayInfo(`  Skipped: ${scanResult.skipped.length} files`);
        displayInfo(`  Total size: ${formatBytes(scanResult.totalSize)}`);
        displayInfo('');

        for (const file of scanResult.files) {
          allFiles.push({
            name: file.name,
            path: file.path,
            size: file.size,
            type: file.mimeType,
          });
        }

        // Show skipped files if any
        if (scanResult.skipped.length > 0) {
          displayInfo('  Skipped files:');
          scanResult.skipped.slice(0, 5).forEach(skip => {
            displayInfo(`    - ${skip.path}: ${skip.reason}`);
          });
          if (scanResult.skipped.length > 5) {
            displayInfo(`    ... and ${scanResult.skipped.length - 5} more`);
          }
          displayInfo('');
        }
      } catch (error) {
        errors.push(`Error scanning ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Single file
      const doc = await fileManager.loadFile(absolutePath);
      if (doc) {
        allFiles.push({
          name: doc.name,
          path: absolutePath,
          size: doc.size,
          type: doc.mimeType,
        });
      } else {
        errors.push(`Could not load file: ${filePath}`);
      }
    }
  }

  // Display summary
  displayInfo('\n========== Summary ==========\n');

  if (allFiles.length > 0) {
    displaySuccess(`Total files loaded: ${allFiles.length}`);
    displayInfo(`Total size: ${formatBytes(allFiles.reduce((sum, f) => sum + f.size, 0))}`);
    
    displayInfo('\nFiles:');
    displayTable(
      ['Name', 'Size', 'Type'],
      allFiles.map(f => [f.name, formatBytes(f.size), f.type])
    );
  } else {
    displayError('No files were loaded.');
  }

  // Display errors
  if (errors.length > 0) {
    displayInfo('\n');
    errors.forEach(err => displayError(err));
  }

  // Show usage hint
  displayInfo('\nTo use these files in research:');
  const fileArgs = files.map(f => `--upload "${f}"`).join(' ');
  displayInfo(`  gemini-research research "Your query" ${fileArgs}`);
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
