#!/usr/bin/env node
/*
  Convert per-chapter local page IDs (1..11) into a global linear sequence
  of 11 pages per chapter:

    newId = (chapterNumber - 1) * 11 + localId

  Example:
    Chapter 1: 1..11 -> 1..11
    Chapter 2: 1..11 -> 12..22
    Chapter 3: 1..11 -> 23..33

  Usage:
    node scripts/renumber-global-linear.js           # dry run
    node scripts/renumber-global-linear.js --apply   # apply changes
*/

const fs = require('fs');
const path = require('path');

const isApply = process.argv.includes('--apply');
const contentDir = path.join(process.cwd(), 'content');

function isChapterDir(dirname) {
  return /^\d{1,3}-.+/.test(dirname);
}

function getChapterNumber(dirname) {
  return parseInt(dirname.split('-')[0], 10);
}

function isMarkdownNumericFile(filename) {
  if (!filename.endsWith('.md')) return false;
  const base = filename.replace(/\.md$/i, '');
  return /^\d+$/.test(base);
}

function main() {
  if (!fs.existsSync(contentDir)) {
    console.error(`Content directory not found: ${contentDir}`);
    process.exit(1);
  }

  const chapterDirs = fs
    .readdirSync(contentDir)
    .filter(isChapterDir)
    .sort((a, b) => getChapterNumber(a) - getChapterNumber(b));

  const operations = [];

  for (const dir of chapterDirs) {
    const chapterPath = path.join(contentDir, dir);
    const chapterNumber = getChapterNumber(dir);
    if (chapterNumber === 0) continue; // intro excluded

    const files = fs.readdirSync(chapterPath).filter(isMarkdownNumericFile);

    for (const file of files) {
      const localId = parseInt(file.replace(/\.md$/i, ''), 10);
      if (!Number.isFinite(localId)) continue;

      // Only remap local 1..11; skip anything outside
      if (localId < 1 || localId > 11) continue;

      const newId = (chapterNumber - 1) * 11 + localId;
      const src = path.join(chapterPath, file);
      const tmp = path.join(chapterPath, `${newId}.md.__tmp_gl__`);
      const dst = path.join(chapterPath, `${newId}.md`);

      operations.push({ src, tmp, dst, dir, file, localId, newId });
    }
  }

  if (operations.length === 0) {
    console.log('No eligible files to rename (expecting local 1..11 in each chapter).');
    return;
  }

  console.log(`Planned renames (${isApply ? 'APPLY' : 'DRY RUN'}):`);
  for (const op of operations) {
    console.log(`  ${path.relative(contentDir, op.src)} -> ${path.relative(contentDir, op.dst)}`);
  }

  if (!isApply) {
    console.log('\nDry run complete. Re-run with --apply to perform renames.');
    return;
  }

  // Phase 1: tmp
  for (const op of operations) {
    if (fs.existsSync(op.tmp)) fs.unlinkSync(op.tmp);
    fs.renameSync(op.src, op.tmp);
  }

  // Phase 2: final
  for (const op of operations) {
    if (fs.existsSync(op.dst)) {
      console.error(`Destination exists, aborting: ${op.dst}`);
      process.exit(2);
    }
    fs.renameSync(op.tmp, op.dst);
  }

  console.log('Global linear renames applied successfully.');
}

main();


