// ==============================================================================
// Aroom: GitHub Push Script using isomorphic-git (no system Git required)
// Usage: GITHUB_TOKEN=your_token tsx scripts/push-to-github.ts
// ==============================================================================

import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Root of the entire Aroom workspace (one level up from backend/)
const REPO_DIR = path.resolve(__dirname, '../../');
const REMOTE_URL = 'https://github.com/Mfoniso1/aroom.git';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Mfoniso1';

if (!GITHUB_TOKEN) {
  console.error('\n❌ ERROR: GITHUB_TOKEN is not set.');
  console.error('Add it to backend/.env as: GITHUB_TOKEN=your_personal_access_token\n');
  process.exit(1);
}

// Files / folders to NEVER commit (in addition to .gitignore)
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '.env',
  '.git',
];

function shouldIgnore(filepath: string): boolean {
  return IGNORE_PATTERNS.some((p) => filepath.includes(p));
}

async function getAllFiles(dir: string, base: string = dir): Promise<string[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath).replace(/\\/g, '/');
    if (shouldIgnore(relPath) || shouldIgnore(entry.name)) continue;
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, base)));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

async function main() {
  console.log('\n🚀 Aroom — Pushing to GitHub via isomorphic-git\n');
  console.log(`📁 Repository directory: ${REPO_DIR}`);
  console.log(`🔗 Remote: ${REMOTE_URL}\n`);

  // 1. Initialize repo if not already
  const isRepo = fs.existsSync(path.join(REPO_DIR, '.git'));
  if (!isRepo) {
    console.log('📦 Initializing new git repository...');
    await git.init({ fs, dir: REPO_DIR, defaultBranch: 'main' });
    console.log('✔ Git repository initialized.');
  } else {
    console.log('✔ Existing git repository detected.');
  }

  // 2. Set author config
  const config = { fs, dir: REPO_DIR };
  await git.setConfig({ ...config, path: 'user.name', value: 'Aroom Engineering' });
  await git.setConfig({ ...config, path: 'user.email', value: 'dev@aroom.ng' });

  // 3. Add all files
  console.log('\n📄 Staging files...');
  const files = await getAllFiles(REPO_DIR);
  let addedCount = 0;
  for (const filepath of files) {
    try {
      await git.add({ fs, dir: REPO_DIR, filepath });
      addedCount++;
    } catch (e: any) {
      // skip files that can't be staged
    }
  }
  console.log(`✔ Staged ${addedCount} files.`);

  // 4. Create commit
  console.log('\n💾 Creating commit...');
  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message: 'feat: initial Aroom backend API & database implementation\n\n- PostgreSQL schema DDL with enums, tables, and composite indexes\n- UNILAG pilot campus seed data\n- Shared domain services: ListingService, InquiryService, TrustService, IdentityService\n- REST API: auth, listings, inquiries, reports, WhatsApp webhook\n- Supabase PostgreSQL connection and migration runner\n- 11-step end-to-end integration test suite',
    author: {
      name: 'Aroom Engineering',
      email: 'dev@aroom.ng',
    },
  });
  console.log(`✔ Commit created: ${sha}`);

  // 5. Add remote
  try {
    await git.addRemote({ fs, dir: REPO_DIR, remote: 'origin', url: REMOTE_URL });
    console.log('✔ Remote origin set.');
  } catch (e: any) {
    if (e.message?.includes('exists')) {
      // Update existing remote
      await git.deleteRemote({ fs, dir: REPO_DIR, remote: 'origin' });
      await git.addRemote({ fs, dir: REPO_DIR, remote: 'origin', url: REMOTE_URL });
      console.log('✔ Remote origin updated.');
    }
  }

  // 6. Push to GitHub
  console.log(`\n📤 Pushing to ${REMOTE_URL}...`);
  const result = await git.push({
    fs,
    http,
    dir: REPO_DIR,
    remote: 'origin',
    ref: 'main',
    force: true, // force push to handle non-empty remote
    onAuth: () => ({
      username: GITHUB_USERNAME,
      password: GITHUB_TOKEN,
    }),
    onProgress: (progress) => {
      if (progress.phase && progress.loaded) {
        process.stdout.write(`\r  ${progress.phase}: ${progress.loaded}/${progress.total || '?'}   `);
      }
    },
  });

  console.log('\n\n✨ Push complete!');
  console.log(`🔗 View your repository: https://github.com/Mfoniso1/aroom`);

  if (result.error) {
    console.error('⚠️  Remote reported an error:', result.error);
  }
}

main().catch((err) => {
  console.error('\n❌ Push failed:', err.message || err);
  process.exit(1);
});
