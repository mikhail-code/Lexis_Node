import { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import config from "../0_config/database";

export class Dictionary {
    id: string;
    name: string;
    tags: string[] = []; // Optional
    main_language: string; // Optional
    learning_language: string; // Optional
    words: any; // Dictionary of words (object)
    owner: string;
    subscribed_users: number[]; // Array of user IDs
  
    constructor(
      id: string = uuidv4(),
      name: string,
      owner: string,
      main_language: string,
      learning_language: string,
      tags?: string[],
      words?: any,
      subscribed_users?: number[]
    ) {
      this.id = id;
      this.name = name;
      this.owner = owner;
      this.main_language = main_language;
      this.learning_language = learning_language;
      this.tags = tags || [];
      this.words = words || {};
      this.subscribed_users = subscribed_users || [];
    }
    static async getDictionaries(userId: number): Promise<Dictionary[]> {
        const pool = new Pool(config); // Assuming your database configuration
    
        const client: PoolClient = await pool.connect();
        try {
          const query = `
            SELECT d.*
            FROM dictionaries d
            JOIN users_dictionaries ud ON d.id = ud.dictionary_id
            WHERE ud.user_id = $1
          `;
    
          const result = await client.query(query, [userId]);
          return result.rows.map((row) => new Dictionary(
            row.id,
            row.name,
            row.owner,
            row.main_language,
            row.learning_language,
            row.tags,
            row.words,
            row.subscribed_users));
        } catch (error) {
          console.error("Error fetching subscribed dictionaries:", error);
          throw error; // Re-throw for handling in the controller
        } finally {
          client.release();
        }
      }
  }
  