import Dictionary from '../3_models/Dictionary';
import { Word, CheckedDictionary } from '../types/Types';

export class DictionaryController {
  static async getUserDictionariesWithExistingWordCheck(
    userId: string,
    word: string
  ): Promise<CheckedDictionary[]> {
    try {
      const dictionaries = await Dictionary.getDictionaries(userId);
      
      return dictionaries.map(dictionary => ({
        dictionaryName: dictionary.name,
        dictionaryId: dictionary.id,
        exists: dictionary.words?.some(
          dictWord => dictWord.word.toLowerCase().trim() === word.toLowerCase().trim()
        ) || false
      }));
    } catch (error) {
      console.error('Error checking word existence:', error);
      throw error;
    }
  }

  static async addNewDictionary(data: Partial<Dictionary>): Promise<Dictionary> {
    if (!data.name || !data.owner) {
      throw new Error('Missing required fields: name and owner');
    }
    return Dictionary.createDictionary(data);
  }

  static async getDictionariesByUserId(userId: string) {
    return Dictionary.getDictionariesInfo(userId);
  }

  static async getDictionariesWithWordsByUserId(userId: string) {
    return Dictionary.getDictionaries(userId);
  }

  static async getDictionaryById(dictionaryId: string) {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    return dictionary;
  }

  static async deleteDictionary(dictionaryId: string, userId: string) {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    if (dictionary.owner !== userId) {
      throw new Error('Unauthorized to delete this dictionary');
    }
    await dictionary.destroy();
  }

  static async addWordToDictionary(
    dictionaryId: string,
    wordData: Word
  ): Promise<void> {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    await dictionary.addWord(wordData);
  }

  static async updateWordInDictionary(
    dictionaryId: string,
    wordData: Word
  ): Promise<void> {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    await dictionary.updateWord(wordData);
  }

  static async deleteWordFromDictionary(
    dictionaryId: string,
    word: string
  ): Promise<void> {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    await dictionary.deleteWord(word);
  }
}