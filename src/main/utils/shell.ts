import { exec } from 'node:child_process';
import { promisify } from 'node:util';

export const execAsync = promisify(exec);
