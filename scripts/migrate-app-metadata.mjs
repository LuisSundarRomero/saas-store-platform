/**
 * Migrates tenant_id from user_metadata → app_metadata for all existing admin users.
 * Run once: node scripts/migrate-app-metadata.mjs
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  console.log('Fetching users...')

  // List all users (paginated — adjust if you have >1000)
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) { console.error('listUsers failed:', error.message); process.exit(1) }

  console.log(`Found ${users.length} users`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const user of users) {
    const fromMeta = user.user_metadata?.tenant_id
    const alreadySet = user.app_metadata?.tenant_id

    if (alreadySet) {
      console.log(`  SKIP  ${user.email} — app_metadata.tenant_id already set (${alreadySet})`)
      skipped++
      continue
    }

    if (!fromMeta) {
      console.log(`  SKIP  ${user.email} — no user_metadata.tenant_id to migrate`)
      skipped++
      continue
    }

    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, tenant_id: fromMeta },
    })

    if (updateErr) {
      console.error(`  FAIL  ${user.email} — ${updateErr.message}`)
      failed++
    } else {
      console.log(`  OK    ${user.email} — tenant_id=${fromMeta}`)
      migrated++
    }
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

run()
