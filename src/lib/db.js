/**
 * Supabase Client Singleton
 */
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase = null;

function getClient() {
  if (!supabase) {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
  }
  return supabase;
}

function from(table) {
  return getClient().from(table);
}

module.exports = { getClient, from };
