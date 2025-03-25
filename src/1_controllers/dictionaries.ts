import Dictionary from '../3_models/Dictionary';
import { Word, CheckedDictionary } from '../types/Types';

export class DictionaryController {
  private static async verifyDictionaryOwnership(dictionaryId: string, userId: string): Promise<Dictionary> {
    const dictionary = await Dictionary.findByPk(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }
    if (dictionary.owner !== userId) {
      throw new Error('Unauthorized: You do not own this dictionary');
    }
    return dictionary;
  }

  static async getUserDictionariesWithExistingWordCheck(
    userId: string,
    word: string
  ): Promise<CheckedDictionary[]> {
    try {
      const dictionaries = await Dictionary.getDictionaries(userId);
      
      console.log(dictionaries[0].words);
      console.log(dictionaries[1].words);
      return dictionaries.map(dictionary => ({
        dictionaryName: dictionary.name,
        dictionaryId: dictionary.id,
        exists: dictionary.words?.some(
          dictWord => {
            console.log('Inside some callback - word:', word, typeof word);
            return dictWord.word.toLowerCase().trim() === word.toLowerCase().trim();
          }
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

  static async getDictionaryById(dictionaryId: string, userId: string) {
    const dictionary = await this.verifyDictionaryOwnership(dictionaryId, userId);
    return dictionary;
  }

  static async deleteDictionary(dictionaryId: string, userId: string) {
    const dictionary = await this.verifyDictionaryOwnership(dictionaryId, userId);
    await dictionary.destroy();
  }

  static async addWordToDictionary(
    dictionaryId: string,
    wordData: Word,
    userId: string
  ): Promise<void> {
    const dictionary = await this.verifyDictionaryOwnership(dictionaryId, userId);
    await dictionary.addWord(wordData);
  }

  static async updateWordInDictionary(
    dictionaryId: string,
    wordData: Word,
    userId: string
  ): Promise<void> {
    console.log("Adding word to dictionary");
    const dictionary = await this.verifyDictionaryOwnership(dictionaryId, userId);
    await dictionary.updateWord(wordData);
  }

  static async deleteWordFromDictionary(
    dictionaryId: string,
    word: string,
    userId: string
  ): Promise<void> {
    const dictionary = await this.verifyDictionaryOwnership(dictionaryId, userId);
    await dictionary.deleteWord(word);
  }
}