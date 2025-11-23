import { Lesson } from "@/types/lesson";
import fs from "fs";
import path from "path";

const lessonsDirectory = path.join(process.cwd(), "content/lessons");

export function getAllLessons(): Lesson[] {
  const fileNames = fs.readdirSync(lessonsDirectory);
  const lessons = fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const fullPath = path.join(lessonsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const lesson: Lesson = JSON.parse(fileContents);
      return lesson;
    })
    .sort((a, b) => {
      // Sort by lesson id (assuming they are like lesson1, lesson2, etc.)
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

  return lessons;
}

export function getLessonById(id: string): Lesson | null {
  try {
    const fullPath = path.join(lessonsDirectory, `${id}.json`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const lesson: Lesson = JSON.parse(fileContents);
    return lesson;
  } catch (error) {
    console.error(`Error loading lesson ${id}:`, error);
    return null;
  }
}

export function getLessonIds(): string[] {
  const fileNames = fs.readdirSync(lessonsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""));
}
