import { Pool, PoolClient } from "pg";
import config from "../0_config/database";
import { Dictionary } from "../3_models/dictionary";

import express from "express";

const pool = new Pool(config);

// async function addNewDictionary(body: any) {
//     const { name, tags = [], main_language, learning_language, words = {}, owner } = body;

//   // Validate user input (implement validation logic here)
//   if (!name || !owner) {
//     throw new Error("Missing required fields");
//   }

//   const client: PoolClient = await pool.connect();
//   try {
//     await client.query("BEGIN"); // Begin transaction

//     const insertDictionary = await client.query(
//       `INSERT INTO dictionaries (name, tags, main_language, learning_language, words, owner) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, // Retrieve all dictionary data
//       [name, tags, main_language, learning_language, words, owner]
//     );

//     const newDictionary = new Dictionary(
//       insertDictionary.rows[0].id,
//       insertDictionary.rows[0].name,
//       insertDictionary.rows[0].owner,
//       insertDictionary.rows[0].main_language,
//       insertDictionary.rows[0].learning_language,
//       insertDictionary.rows[0].tags,
//       insertDictionary.rows[0].words,
//       insertDictionary.rows[0].owner
//     );

//     await client.query(
//       `UPDATE users SET subscribed_dictionaries = array_append(subscribed_dictionaries, $1) WHERE id = $2`,
//       [newDictionary.id, owner]
//     );

//     await client.query("COMMIT"); // Commit transaction on success

//     return newDictionary; // Return the new dictionary directly
//   } catch (error) {
//     await client.query("ROLLBACK"); // Rollback on error
//     console.error("Error adding new dictionary:", error);
//     throw error; // Re-throw the error to be handled in the route
//   } finally {
//     client.release();
//   }
// }

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
    const dictionaries = await Dictionary.getDictionaries(userId);
    return dictionaries;
  }
  
  // Get a dictionary by ID (using Dictionary.getDictionaryById)
  async function getDictionaryById(dictionaryId: string) {
    const dictionary = await Dictionary.getDictionaryById(dictionaryId);
    return dictionary;
  }
  
  // Delete a dictionary by ID (using Dictionary.deleteDictionary)
  async function deleteDictionary(dictionaryId: string) {
    await Dictionary.deleteDictionary(dictionaryId);
    // You can optionally return a success message here
  }
  
  // Update dictionary words by ID (using instance method updateWords)
  async function updateDictionaryWords(dictionaryId: string, newWords: any) {
    const dictionary = await Dictionary.getDictionaryById(dictionaryId);
    if (dictionary) {
      await dictionary.updateWords(newWords);
    } else {
      throw new Error("Dictionary not found");
    }
    return dictionary; // You can optionally return the updated dictionary
  }
  
  export { addNewDictionary, getDictionariesByUserId, getDictionaryById, deleteDictionary, updateDictionaryWords };