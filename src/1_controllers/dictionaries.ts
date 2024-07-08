import { Pool, PoolClient } from "pg";
import config from "../0_config/database";
import { Dictionary, Word, validateWordData} from "../3_models/dictionary";

import express from "express";

const pool = new Pool(config);

interface CheckedDictionary{ //returns list of dictionaries with existing word check
  dictionaryName: string;
  dictionaryId: string;
  exists: boolean;
  lastModified: Date | null;
  wordsAmount: number;
}
async function getUserDictionariesWithExistingWordCheck(
  userId: string,
  word: string
): Promise<CheckedDictionary[]> {
  try {
    const dictionaries = await Dictionary.getDictionaries(userId);
    if (!dictionaries || dictionaries.length === 0) {
      console.warn("No dictionaries found for user:", userId);
      return [];
    }
    console.log(dictionaries);
    const checkedDictionaries: CheckedDictionary[] = [];
    for (const dictionary of dictionaries) {
      const words = dictionary.words || [];
      const wordsAmount = Array.isArray(words) ? words.length : Object.keys(words).length;
      
      const lowerCaseWord = word.toLowerCase().trim();
      const wordExists = words.some(
        (dictWord: Word) => dictWord.word.toLowerCase().trim() === lowerCaseWord
      );
      
      const newCheckedDictionary: CheckedDictionary = {
        dictionaryName: dictionary.name,
        dictionaryId: dictionary.id,
        exists: wordExists,
        lastModified: dictionary.lastModified || null,
        wordsAmount: wordsAmount
      };

      checkedDictionaries.push(newCheckedDictionary);
    }

    return checkedDictionaries;
  } catch (error) {
    console.error("Error fetching subscribed dictionaries:", error);
    throw error;
  }
}



async function validateDictionaryData(data: any) {
  // Implement validation logic here (e.g., check for required fields)
  if (!data.name || !data.owner) {
    throw new Error("Missing required fields");
  }
}
async function addNewDictionary(body: any) {
  try {
    const dictionaryData = body;
    await validateDictionaryData(dictionaryData);

    const newDictionary = await Dictionary.createDictionary(dictionaryData);
    return newDictionary; // Respond with the new dictionary object
  } catch (error) {
    console.error("Error adding new dictionary:", error);
    throw error;
  }
}
// Get all dictionaries for a user (using Dictionary.getDictionaries)
async function getDictionariesByUserId(userId: string) {
  const dictionaries = await Dictionary.getDictionariesInfo(userId);
  return dictionaries;
}
async function getDictionariesWithWordsByUserId(userId: string) {
  const dictionaries = await Dictionary.getDictionaries(userId);
  return dictionaries;
}

// Get a dictionary by ID (using Dictionary.getDictionaryById)
async function getDictionaryById(dictionaryId: string) {
  const dictionary = await Dictionary.getDictionaryById(dictionaryId);
  return dictionary;
}

// Delete a dictionary by ID (using Dictionary.deleteDictionary)
async function deleteDictionary(dictionaryId: string, userId: string) {
  await Dictionary.deleteDictionary(dictionaryId, userId);
  // You can optionally return a success message here
}

// WORDS:
async function addWordToDictionary(
  dictionaryId: string,
  wordData: any
): Promise<Word> {
  try {
    // Validate the word data before proceeding
    await validateWordData(wordData);

    // Fetch the dictionary by ID (can be refactored to use existing logic)
    const dictionary = await Dictionary.getDictionaryById(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }

    // Convert word data to Word object
    const newWord = new Word(
      wordData.word,
      wordData.translation,
      wordData.transliteration,
      wordData.comment
    );

    const wordIndex = dictionary.words.findIndex(
      (word: Word) => word.word === newWord.word
    );

    if (wordIndex != -1) {
      throw new Error(`Word '${newWord.word}' already exists in dictionary`);
    }

    const wordsArray = Object.values(dictionary.words);
    // Push the new word into the array
    wordsArray.push(newWord);
    // Update dictionary.words with the new array
    dictionary.words = wordsArray;

    // Save the updated dictionary (replace with your logic for updating dictionaries)
    await dictionary.updateWords();
    console.log("after changes:");
    console.log(dictionary.words);

    return newWord; // Return the newly added word
  } catch (error) {
    console.error("Error adding word to dictionary:", error);
    throw error; // Re-throw for handling in the route
  }
}

// Function to delete a word from a dictionary
async function deleteWordFromDictionary(
  dictionaryId: string,
  wordToDelete: string
): Promise<void> {
  try {
    // Fetch the dictionary by ID (can be refactored to use existing logic)
    const dictionary = await Dictionary.getDictionaryById(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }

    // Find the index of the word to delete
    const wordIndex = dictionary.words.findIndex(
      (word: Word) => word.word === wordToDelete
    );

    if (wordIndex === -1) {
      throw new Error(`Word '${wordToDelete}' not found in dictionary`);
    }
    const wordsArray = Object.values(dictionary.words);
    // Push the new word into the array
    wordsArray.splice(wordIndex, 1);
    // Update dictionary.words with the new array
    dictionary.words = wordsArray;

    // Remove the word from the dictionary's words array

    // Save the updated dictionary (replace with your logic for updating dictionaries)
    await dictionary.updateWords();
  } catch (error) {
    console.error("Error deleting word from dictionary:", error);
    throw error; // Re-throw for handling in the route
  }
}

// Function to update a word in a dictionary
async function updateWordInDictionary(
  dictionaryId: string,
  updatedWordData: any
): Promise<void> {
  try {
    // Validate the updated word data before proceeding
    await validateWordData(updatedWordData);

    // Fetch the dictionary by ID (can be refactored to use existing logic)
    const dictionary = await Dictionary.getDictionaryById(dictionaryId);
    if (!dictionary) {
      throw new Error(`Dictionary with id ${dictionaryId} not found`);
    }

    // Find the index of the word to update
    const wordIndex = dictionary.words.findIndex(
      (word: Word) => word.word === updatedWordData.word
    );

    if (wordIndex === -1) {
      throw new Error(`Word '${updatedWordData.word}' not found in dictionary`);
    }

    // Update the existing word with the new data
    dictionary.words[wordIndex] = new Word(
      updatedWordData.word,
      updatedWordData.translation,
      updatedWordData.transliteration,
      updatedWordData.comment
    );
    const wordsArray = Object.values(dictionary.words);
    // Update dictionary.words with the new array
    dictionary.words = wordsArray;
    // Save the updated dictionary (replace with your logic for updating dictionaries)
    await dictionary.updateWords();
  } catch (error) {
    console.error("Error updating word in dictionary:", error);
    throw error; // Re-throw for handling in the route
  }
}

export {
  addNewDictionary,
  getDictionariesByUserId,
  getDictionaryById,
  deleteDictionary,
  addWordToDictionary,
  deleteWordFromDictionary,
  updateWordInDictionary,
  getUserDictionariesWithExistingWordCheck,
  getDictionariesWithWordsByUserId,
};
