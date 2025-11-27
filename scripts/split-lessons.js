#!/usr/bin/env node
/**
 * Split a combined lessons JSON file into individual lesson files.
 * Defaults: input content/all-lessons.json, output _lessons/
 * The output directory is created if missing. Files are named by lesson id (e.g., 2.0.json).
 */

const fs = require('fs/promises');
const path = require('path');

const DEFAULT_INPUT = path.join(__dirname, '..', 'content', 'all-lessons.json');
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', '_lessons');

async function readCombined(inputPath) {
  const raw = await fs.readFile(inputPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Expected an array at ${inputPath}`);
  }
  return data;
}

async function writeLessons(lessons, outDir) {
  await fs.mkdir(outDir, { recursive: true });
  for (const lesson of lessons) {
    if (!lesson.id) {
      console.warn('Skipping lesson without id', lesson);
      continue;
    }
    const fileName = `${lesson.id}.json`;
    const filePath = path.join(outDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(lesson, null, 2) + '\n', 'utf8');
  }
  return lessons.length;
}

async function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT;
  const outDir = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUTPUT_DIR;

  const lessons = await readCombined(inputPath);
  const count = await writeLessons(lessons, outDir);
  console.log(`Wrote ${count} lessons to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
