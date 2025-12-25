/**
 * Ryan Configuration
 */
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5407,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  
  // Other workers
  SUSAN_URL: process.env.SUSAN_URL || 'http://localhost:5403',
  CLAIR_URL: process.env.CLAIR_URL || 'http://localhost:5406',
  
  // AI settings
  CLAUDE_MODEL: 'claude-3-5-haiku-20241022',
};
