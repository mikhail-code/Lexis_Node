import { Pool, PoolClient } from "pg";
import config from "../0_config/database";
import { Dictionary } from "../3_models/dictionary";

import express from "express";

const pool = new Pool(config);

async function addNewDictionary(body: any) {
    const { name, tags = [], main_language, learning_language, words = {}, owner } = body;

  // Validate user input (implement validation logic here)
  if (!name || !owner) {
    throw new Error("Missing required fields");
  }

  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN"); // Begin transaction

    const insertDictionary = await client.query(
      `INSERT INTO dictionaries (name, tags, main_language, learning_language, words, owner) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, // Retrieve all dictionary data
      [name, tags, main_language, learning_language, words, owner]
    );

    const newDictionary = new Dictionary(
      insertDictionary.rows[0].id,
      insertDictionary.rows[0].name,
      insertDictionary.rows[0].owner,
      insertDictionary.rows[0].main_language,
      insertDictionary.rows[0].learning_language,
      insertDictionary.rows[0].tags,
      insertDictionary.rows[0].words,
      insertDictionary.rows[0].owner
    );

    await client.query(
      `UPDATE users SET subscribed_dictionaries = array_append(subscribed_dictionaries, $1) WHERE id = $2`,
      [newDictionary.id, owner]
    );

    await client.query("COMMIT"); // Commit transaction on success

    return newDictionary; // Return the new dictionary directly
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on error
    console.error("Error adding new dictionary:", error);
    throw error; // Re-throw the error to be handled in the route
  } finally {
    client.release();
  }
}

// You can add other routes for functionalities like get all dictionaries, get by ID, etc.

export { addNewDictionary };