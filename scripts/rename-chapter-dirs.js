#!/usr/bin/env node
/*
  Rename chapter directories to drop leading zeroes:
    01-thinking -> 1-thinking
    02-creating -> 2-creating

  Usage:
    node scripts/rename-chapter-dirs.js        # dry run
    node scripts/rename-chapter-dirs.js --apply
*/

const fs = require('fs');
const path = require('path');

const isApply = process.argv.includes('--apply');
const contentDir = path.join(process.cwd(), 'content');

function isChapterDir(dirname) {
  return /^\d{1,3}-.+/.test(dirname);
}

function getRenamed(dirname) {
  const [num, ...rest] = dirname.split('-');
  const n = parseInt(num, 10);
  if (Number.isNaN(n)) return null;
  const newPrefix = String(n);
  return [newPrefix, ...rest].join('-');
}

function main() {
  const dirs = fs.readdirSync(contentDir).filter(isChapterDir);
  const ops = [];
  for (const dir of dirs) {
    const newName = getRenamed(dir);
    if (!newName || newName === dir) continue;
    ops.push({ from: path.join(contentDir, dir), to: path.join(contentDir, newName) });
  }

  if (ops.length === 0) {
    console.log('No chapter directories to rename.');
    return;
  }

  console.log(`Planned chapter dir renames (${isApply ? 'APPLY' : 'DRY RUN'}):`);
  for (const op of ops) {
    console.log(`  ${path.basename(op.from)} -> ${path.basename(op.to)}`);
  }

  if (!isApply) {
    console.log('\nDry run complete. Re-run with --apply to perform renames.');
    return;
  }

  for (const op of ops) {
    if (fs.existsSync(op.to)) {
      console.error(`Destination exists, aborting: ${op.to}`);
      process.exit(2);
    }
  }

  for (const op of ops) {
    fs.renameSync(op.from, op.to);
  }

  console.log('Chapter directory renames applied successfully.');
}

main();


