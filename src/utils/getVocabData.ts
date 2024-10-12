import fs from "fs";
import path from "path";

export type VocabData = Record<string, string>;

export function getVocabData(): VocabData {
  const vocabPath = path.join(process.cwd(), "src", "data", "vocabData.json");
  if (!fs.existsSync(vocabPath)) {
    console.error("vocabData.json not found at path:", vocabPath);
    return {};
  }

  try {
    const data = fs.readFileSync(vocabPath, "utf-8");
    const vocab: VocabData = JSON.parse(data);
    return vocab;
  } catch (error) {
    console.error("Error reading vocabData.json:", error);
    return {};
  }
}