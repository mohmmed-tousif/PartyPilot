/**
 * Loads environment variables at process start. Keep in one place.
 */
import dotenv from 'dotenv';

export function loadEnv() {
  const result = dotenv.config();
  if (result.error) {
    // Not fatal in dev if using shell exports, but warn
    console.warn('ℹ️ .env not found or could not be parsed (using process env)');
  }
}
