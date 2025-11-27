#!/usr/bin/env node
/**
 * Combine all lesson JSON files in content/lessons (excluding archive) into one file.
 * Output: content/all-lessons.json
 */

const fs = require('fs/promises');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '..', 'content', 'lessons');
const OUTPUT_PATH = path.join(__dirname, '..', 'content', 'all-lessons.json');

async function loadLessons() {
  const entries = await fs.readdir(LESSONS_DIR, { withFileTypes: true });
  const lessons = [];

  for (const entry of entries) {
    const { name } = entry;
    if (entry.isDirectory()) continue;
    if (!name.endsWith('.json')) continue;
    if (name.startsWith('.')) continue;
    const filePath = path.join(LESSONS_DIR, name);
    const raw = await fs.readFile(filePath, 'utf8');
    const lesson = JSON.parse(raw);
    lessons.push(lesson);
  }

  // Sort by numeric value of id (e.g., "3.1" -> 3.1)
  lessons.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
  return lessons;
}

async function main() {
  const lessons = await loadLessons();
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(lessons, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${lessons.length} lessons to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
