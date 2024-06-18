import { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import config from "../0_config/database";

interface GetDictionaryInfoResponse {
  id: string;
  tags: string[];
  name: string;
  owner: string;
  main_language: string;
  learning_language: string;
  owner_uuid: string;
  lastModified?: Date;
}
interface GetDictionaryResponse {
  id: string;
  tags: string[];
  name: string;
  owner: string;
  main_language: string;
  learning_language: string;
  owner_uuid: string;
  words: Word[];
  lastModified?: Date;
}
export class Word {
  constructor(
    public word: string,
    public translation: string,
    public transliteration?: string, // Optional transliteration property
    public comment?: string // Optional comment property
  ) {}
}
async function validateWordData(wordData: any): Promise<void> {
  // Replace with your actual validation logic
  if (!wordData.word || typeof wordData.word !== "string") {
    throw new Error("Word property is required and must be a string");
  }

  if (!wordData.translation || typeof wordData.translation !== "string") {
    throw new Error("Translation property is required and must be a string");
  }

  // Add optional validation for transliteration and comment properties (if needed)
  if (
    wordData.transliteration &&
    typeof wordData.transliteration !== "string"
  ) {
    throw new Error("Transliteration property must be a string (if provided)");
  }

  if (wordData.comment && typeof wordData.comment !== "string") {
    throw new Error("Comment property must be a string (if provided)");
  }

  // You can perform additional validation checks here, like checking for minimum/maximum lengths, etc.
}

export { validateWordData };

function isValidUuid(uuid: string): boolean {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
export class Dictionary {
  id: string;
  name: string;
  tags: string[] = []; // Optional
  main_language: string; // Optional
  learning_language: string; // Optional
  words: any; // Dictionary of words (object)
  owner: string;
  subscribed_users: string[]; // Array of user IDs

  constructor(
    id: string = uuidv4(),
    name: string,
    owner: string,
    main_language: string,
    learning_language: string,
    tags?: string[],
    words?: any,
    subscribed_users?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.main_language = main_language;
    this.learning_language = learning_language;
    this.tags = tags || [];
    this.words = words || [];
    this.subscribed_users = subscribed_users || [];
  }
  static async getDictionaries(
    userId: string
  ): Promise<GetDictionaryResponse[]> {
    const pool = new Pool(config); // Assuming your database configuration

    const client: PoolClient = await pool.connect();
    try {
      // Get subscribed dictionary IDs for the user
      const subscribedDictionaryIdsQuery = `
        SELECT subscribed_dictionaries
        FROM users
        WHERE id = $1;
      `;
      const subscribedDictionaryIdsResult = await client.query(
        subscribedDictionaryIdsQuery,
        [userId]
      );

      if (subscribedDictionaryIdsResult.rows.length === 0) {
        return []; // No subscribed dictionaries
      }

      const subscribedDictionaryIds =
        subscribedDictionaryIdsResult.rows[0].subscribed_dictionaries;

      // If no subscribed IDs, return empty array
      if (!subscribedDictionaryIds || subscribedDictionaryIds.length === 0) {
        return [];
      }

      const dictionaryIdsPlaceholder = subscribedDictionaryIds
        .map((_: unknown, index: number) => `$${index + 1}`)
        .join(",");
      const getDictionariesQuery = `
        SELECT d.id, d.name, d.tags, d.owner, d.main_language, d.learning_language, d.words, u.login, u.id AS user_uuid, d.last_modified
        FROM dictionaries d
        INNER JOIN users u ON d.owner = u.id
        WHERE d.id IN (${dictionaryIdsPlaceholder});
      `;

      const dictionariesResult = await client.query(
        getDictionariesQuery,
        subscribedDictionaryIds
      );

      // Convert results to the desired response object format, including last_modified
      return dictionariesResult.rows.map((row) => ({
        tags: row.tags,
        name: row.name,
        id: row.id,
        owner: row.login,
        main_language: row.main_language,
        learning_language: row.learning_language,
        owner_uuid: row.user_uuid,
        words: row.words,
        lastModified: row.last_modified, // Add last_modified to the response
      }));
    } catch (error) {
      console.error("Error fetching subscribed dictionaries:", error);
      throw error; // Re-throw the error for handling in the controller
    } finally {
      client.release();
    }
  }

  static async getDictionariesInfo(
    userId: string
  ): Promise<GetDictionaryInfoResponse[]> {
    const pool = new Pool(config); // Assuming your database configuration

    const client: PoolClient = await pool.connect();
    try {
      // Get subscribed dictionary IDs for the user
      const subscribedDictionaryIdsQuery = `
        SELECT subscribed_dictionaries
        FROM users
        WHERE id = $1;
      `;
      const subscribedDictionaryIdsResult = await client.query(
        subscribedDictionaryIdsQuery,
        [userId]
      );

      if (subscribedDictionaryIdsResult.rows.length === 0) {
        return []; // No subscribed dictionaries
      }

      const subscribedDictionaryIds =
        subscribedDictionaryIdsResult.rows[0].subscribed_dictionaries;

      // If no subscribed IDs, return empty array
      if (!subscribedDictionaryIds || subscribedDictionaryIds.length === 0) {
        return [];
      }

      // Build the query to fetch dictionary details using a single IN clause
      const dictionaryIdsPlaceholder = subscribedDictionaryIds
      .map((_: unknown, index: number) => `$${index + 1}`)
      .join(",");
    const getDictionariesQuery = `
      SELECT d.id, d.name, d.tags, d.owner, d.main_language, d.learning_language, u.login, u.id AS user_uuid, d.last_modified
      FROM dictionaries d
      INNER JOIN users u ON d.owner = u.id
      WHERE d.id IN (${dictionaryIdsPlaceholder});
    `;

    const dictionariesResult = await client.query(
      getDictionariesQuery,
      subscribedDictionaryIds
    );

    // Convert results to the desired response object format, including last_modified
    return dictionariesResult.rows.map((row) => ({
      tags: row.tags,
      name: row.name,
      id: row.id,
      owner: row.login,
      main_language: row.main_language,
      learning_language: row.learning_language,
      owner_uuid: row.user_uuid,
      lastModified: row.last_modified ? row.last_modified : null, // Handle potential null values
    }));
  } catch (error) {
    console.error("Error fetching subscribed dictionaries:", error);
    throw error; // Re-throw the error for handling in the controller
  } finally {
    client.release();
  }
}

  // Define the interface for the desired response structure

  static async createDictionary(dictionaryData: any) {
    const pool = new Pool(config); // Assuming your database configuration
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN"); // Begin transaction

      const insertDictionary = await client.query(
        `INSERT INTO dictionaries (name, tags, main_language, learning_language, words, owner) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, // Retrieve all dictionary data
        [
          dictionaryData.name,
          dictionaryData.tags || [],
          dictionaryData.main_language,
          dictionaryData.learning_language,
          JSON.stringify([]),
          dictionaryData.owner,
        ]
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
        [newDictionary.id, dictionaryData.owner]
      );

      await client.query("COMMIT"); // Commit transaction on success

      return newDictionary; // Return the new dictionary directly
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback on error
      console.error("Error adding new dictionary:", error);
      throw error; // Re-throw the error to be handled in the controller
    } finally {
      client.release();
    }
  }

  static async getDictionaryById(dictionaryId: string): Promise<Dictionary> {
    const pool = new Pool(config); // Assuming your database configuration

    const client: PoolClient = await pool.connect();
    try {

      const query = `
              SELECT *
              FROM dictionaries
              WHERE id = $1
            `;

      const result = await client.query(query, [dictionaryId]);
      if (result.rows.length === 0) {
        throw new Error(`Dictionary with id ${dictionaryId} not found`);
      }
      // const dictionaryData = result.rows[0];
      // console.log(dictionaryData.words);
      // console.log(typeof dictionaryData.words);
      // dictionaryData.words = JSON.parse(dictionaryData.words); // Converting JSON string to array

      return new Dictionary(
        result.rows[0].id,
        result.rows[0].name,
        result.rows[0].owner,
        result.rows[0].main_language,
        result.rows[0].learning_language,
        result.rows[0].tags,
        result.rows[0].words,
        result.rows[0].subscribed_users
      );
    } catch (error) {
      console.error("Error fetching dictionary:", error);
      throw error; // Re-throw for handling in the controller
    } finally {
      client.release();
    }
  }

  static async deleteDictionary(dictionaryId: string, userId: string) {
    const pool = new Pool(config); // Assuming your database configuration

    const client: PoolClient = await pool.connect();
    try {
      const query = `
            DELETE FROM dictionaries
            WHERE id = $1
          `;
      await client.query(query, [dictionaryId]);

      const updateQuery = `
      UPDATE users 
      SET subscribed_dictionaries = array_remove(subscribed_dictionaries, $1) 
      WHERE id = $2
    `;
      await client.query(updateQuery, [dictionaryId, userId]);
    } catch (error) {
      console.error("Error deleting dictionary:", error);
      // Handle deletion error (optional)
    } finally {
      client.release();
    }
  }

  updateWords = async () => {
    //  So it should update DB with this.dictionary words
    // Update the dictionary in the database (optional)
    const pool = new Pool(config); // Assuming your database configuration
    const client: PoolClient = await pool.connect();
    try {
      const query = `
  UPDATE dictionaries
  SET words = $1
  WHERE id = $2
`;
      await client.query(query, [JSON.stringify(this.words), this.id]);
    } catch (error) {
      console.error("Error updating dictionary words:", error);
      // Handle update error (optional)
    } finally {
      client.release();
    }
  };
}
