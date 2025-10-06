#!/usr/bin/env node
/*
  Renumber chapter content files by converting global page IDs (e.g., 11, 12)
  to local chapter page IDs starting at 1 (e.g., 1, 2) using:
    newId = oldId - chapterNumber * 10

  Example for chapter 01:
    11.md -> 1.md
    12.md -> 2.md
    20.md -> 10.md
    21.md -> 11.md

  Usage:
    node scripts/renumber-content.js --apply     # perform renames
    node scripts/renumber-content.js             # dry run
*/

const fs = require('fs');
const path = require('path');

const isApply = process.argv.includes('--apply');
const contentDir = path.join(process.cwd(), 'content');

function isChapterDir(dirname) {
  return /^\d{2}-/.test(dirname);
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

  const chapterDirs = fs.readdirSync(contentDir).filter(isChapterDir);
  const operations = [];

  for (const dir of chapterDirs) {
    const chapterPath = path.join(contentDir, dir);
    const chapterNumber = getChapterNumber(dir);
    // Keep intro (00) unchanged
    if (chapterNumber === 0) continue;

    const files = fs.readdirSync(chapterPath).filter(isMarkdownNumericFile);

    for (const file of files) {
      const oldId = parseInt(file.replace(/\.md$/i, ''), 10);
      // Mapping: oldId = 11*chapter + (k - 1)  =>  newId (k) = oldId - 11*chapter + 1
      const newId = oldId - chapterNumber * 11 + 1;
      if (!Number.isFinite(newId) || newId <= 0) {
        console.warn(`Skipping ${dir}/${file} -> computed newId ${newId} not valid`);
        continue;
      }

      const src = path.join(chapterPath, file);
      const tmp = path.join(chapterPath, `${newId}.md.__tmp_renaming__`);
      const dst = path.join(chapterPath, `${newId}.md`);

      operations.push({ src, tmp, dst, dir, file, newId });
    }
  }

  if (operations.length === 0) {
    console.log('No renames necessary.');
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

  // Phase 1: move to temp names to avoid collisions
  for (const op of operations) {
    if (fs.existsSync(op.tmp)) fs.unlinkSync(op.tmp);
    fs.renameSync(op.src, op.tmp);
  }

  // Phase 2: move temp to final names
  for (const op of operations) {
    if (fs.existsSync(op.dst)) {
      console.error(`Destination already exists, aborting: ${op.dst}`);
      console.error('You may need to resolve conflicts manually.');
      process.exit(2);
    }
    fs.renameSync(op.tmp, op.dst);
  }

  console.log('Renames applied successfully.');
}

main();


