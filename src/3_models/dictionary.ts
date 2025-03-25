import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import User from './User'; // Ensure correct import path
import { v4 as uuidv4 } from 'uuid';
import { Word, DictionaryResponse, DictionaryInfo } from '../types/Types'; // Adjust import path as necessary


@Table({ tableName: 'dictionaries', timestamps: true })
class Dictionary extends Model<Dictionary> {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.ARRAY(DataType.STRING))
  tags?: string[];

  @AllowNull(false)
  @Column(DataType.STRING)
  main_language!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  learning_language!: string;

  @Column(DataType.JSONB)
  words?: Word[];

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  owner!: string;

  @BelongsTo(() => User)
  user!: User;

  static async getDictionaries(userId: string): Promise<DictionaryResponse[]> {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscribedDictionaries?.length) {
        return [];
      }

      const dictionaries = await Dictionary.findAll({
        where: {
          id: user.subscribedDictionaries,
        },
        include: [{ model: User, as: 'user' }],
      });

      return dictionaries.map((dict) => ({
        id: dict.id,
        name: dict.name,
        tags: dict.tags || [],
        owner: dict.user.login,
        main_language: dict.main_language,
        learning_language: dict.learning_language,
        owner_uuid: dict.user.id,
        words: dict.words || [],
        lastModified: dict.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching dictionaries:', error);
      throw error;
    }
  }

  static async getDictionariesInfo(userId: string): Promise<DictionaryInfo[]> {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscribedDictionaries?.length) {
        return [];
      }

      const dictionaries = await Dictionary.findAll({
        where: {
          id: user.subscribedDictionaries,
        },
        include: [{ model: User, as: 'user' }],
      });

      return dictionaries.map((dict) => ({
        id: dict.id,
        name: dict.name,
        tags: dict.tags || [],
        owner: dict.user.login,
        main_language: dict.main_language,
        learning_language: dict.learning_language,
        owner_uuid: dict.user.id,
        lastModified: dict.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching dictionary info:', error);
      throw error;
    }
  }

  static async createDictionary(data: Partial<Dictionary>): Promise<Dictionary> {
    // Get sequelize from the model (ensure it's initialized)
    const transaction = await Dictionary.sequelize!.transaction();
    try {
      const dictionary = await Dictionary.create(
        {
          ...data,
          id: uuidv4(),
          words: [],
        } as Dictionary,
        { transaction }
      );
  
      const user = await User.findByPk(data.owner!, { transaction });
      if (user) {
        user.subscribedDictionaries = [
          ...(user.subscribedDictionaries || []),
          dictionary.id,
        ];
        await user.save({ transaction });
      }
  
      await transaction.commit();
      return dictionary;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async addWord(wordData: Word): Promise<void> {
    if (!this.words) {
      this.words = [];
    }
    const wordExists = this.words?.some((w) => w.word === wordData.word);
    if (wordExists) {
      throw new Error(`Word '${wordData.word}' already exists in dictionary`);
    }
    this.words.push(wordData);
    this.changed('words', true); // Mark the 'words' column as changed because this is the way in squelise apparently
    await this.save();
  }
  
  async updateWord(wordData: Word): Promise<void> {
    if (!this.words) {
      throw new Error('Dictionary has no words');
    }
  
    const index = this.words.findIndex((w) => w.word === wordData.word);
    if (index === -1) {
      throw new Error(`Word '${wordData.word}' not found in dictionary`);
    }
  
    this.words[index] = wordData;
    this.changed('words', true); // Mark the 'words' column as changed
    await this.save();
  }
  
  async deleteWord(word: string): Promise<void> {
    if (!this.words) {
      throw new Error('Dictionary has no words');
    }
  
    const index = this.words.findIndex((w) => w.word === word);
    if (index === -1) {
      throw new Error(`Word '${word}' not found in dictionary`);
    }
  
    this.words.splice(index, 1);
    this.changed('words', true); // Mark the 'words' column as changed
    await this.save();
  }
}

export default Dictionary;
