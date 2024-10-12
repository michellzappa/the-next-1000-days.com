import vocabData from '../data/vocabData.json';

export type VocabData = Record<string, string>;

export function getVocabData(): VocabData {
  return vocabData;
}
