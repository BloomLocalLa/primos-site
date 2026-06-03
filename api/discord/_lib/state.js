import { createClient } from '@supabase/supabase-js'

let _default = null
function defaultClient() {
  if (!_default) {
    _default = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return _default
}

export async function getState(key, client = defaultClient()) {
  const { data, error } = await client
    .from('bot_state').select('value').eq('key', key).maybeSingle()
  if (error) throw new Error(`getState ${key}: ${error.message}`)
  return data ? data.value : null
}

export async function setState(key, value, client = defaultClient()) {
  const { error } = await client
    .from('bot_state').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(`setState ${key}: ${error.message}`)
}
