import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function createOrgSecrets() {
  try {
    const envContent = readFileSync('.env.production', 'utf-8');
    const envVars = envContent
      .split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        // Find the first = character
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) return [];
        
        // Split into key and value
        const key = line.slice(0, equalIndex).trim();
        let value = line.slice(equalIndex + 1).trim();
        
        // Remove surrounding quotes if they exist
        value = value.replace(/^["'](.*)["']$/, '$1');
        
        return [key, value];
      });

    // Your GitHub organization name
    const orgName = 'OHsync';

    for (const [key, value] of envVars) {
      if (!key || !value) continue;

      try {
        // Escape any quotes in the value to prevent command injection
        const escapedValue = value.replace(/"/g, '\\"');
        
        await execAsync(`gh secret set "${key}" -b"${escapedValue}" --org "${orgName}" --visibility=all`);
        console.log(`✅ Successfully set secret: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to set secret ${key}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Failed to process .env file:', error);
  }
}

createOrgSecrets();