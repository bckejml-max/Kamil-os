import assert from 'node:assert/strict';
import fs from 'node:fs';

const store=fs.readFileSync('lib/betting-ledger543-store.js','utf8');
const api=fs.readFileSync('api/market-history.js','utf8');
const migration='supabase/migrations/0034_betting_ledger543.sql';
const migrationExists=fs.existsSync(migration);

assert.match(store,/REQUIRED_REVISION\s*=\s*['"]0034_betting_ledger543\.sql['"]/,'OS1186 betting store must identify the required DB revision');
assert.match(api,/mutateBettingLedger543/,'OS1186 market-history must route ledger mutations through the guarded store');

if(!migrationExists){
  assert.match(store,/REMOTE_BETTING_LEDGER_DISABLED/,'OS1186 remote betting writes must stay disabled while migration 0034 is absent');
  assert.doesNotMatch(store,/\.from\s*\([^)]*\)\s*\.\s*(?:insert|update|upsert|delete)\s*\(/,'OS1186 disabled betting store must not contain direct Supabase writes');
  assert.match(store,/return\s+fail\(503\s*,\s*['"]REMOTE_BETTING_LEDGER_DISABLED['"]/,'OS1186 mutations must fail closed while the required migration is absent');
}

console.log(`OS1186 PASS: remote betting ledger is ${migrationExists?'migration-backed':'fail-closed while migration 0034 is absent'}`);
