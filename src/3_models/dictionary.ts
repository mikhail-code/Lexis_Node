import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default,
  Unique,
  IsEmail,
  AllowNull,
} from 'sequelize-typescript';
import { User } from '../3_models/user'; // Import the User model
import { v4 as uuidv4 } from 'uuid';
import { Word, DictionaryResponse, DictionaryInfo } from './types';
import sequelize from '../0_config/database';

export class Dictionary extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column(DataType.ARRAY(DataType.STRING))
  tags?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  main_language!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  learning_language!: string;

  @Column(DataType.JSONB)
  words?: Word[];

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
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
          id: user.subscribedDictionaries
        },
        include: [{ model: User, as: 'user' }]
      });

      return dictionaries.map(dict => ({
        id: dict.id,
        name: dict.name,
        tags: dict.tags || [],
        owner: dict.user.login,
        main_language: dict.main_language,
        learning_language: dict.learning_language,
        owner_uuid: dict.user.id,
        words: dict.words || [],
        lastModified: dict.updatedAt
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
          id: user.subscribedDictionaries
        },
        include: [{ model: User, as: 'user' }]
      });

      return dictionaries.map(dict => ({
        id: dict.id,
        name: dict.name,
        tags: dict.tags || [],
        owner: dict.user.login,
        main_language: dict.main_language,
        learning_language: dict.learning_language,
        owner_uuid: dict.user.id,
        lastModified: dict.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching dictionary info:', error);
      throw error;
    }
  }

  static async createDictionary(data: Partial<Dictionary>): Promise<Dictionary> {
    const transaction = await sequelize.transaction();
    try {
      const dictionary = await Dictionary.create({
        ...data,
        id: uuidv4(),
        words: []
      }, { transaction });

      const user = await User.findByPk(data.owner!, { transaction });
      if (user) {
        user.subscribedDictionaries = [...(user.subscribedDictionaries || []), dictionary.id];
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
    
    const wordExists = this.words.some(w => w.word === wordData.word);
    if (wordExists) {
      throw new Error(`Word '${wordData.word}' already exists in dictionary`);
    }

    this.words.push(wordData);
    await this.save();
  }

  async updateWord(wordData: Word): Promise<void> {
    if (!this.words) {
      throw new Error('Dictionary has no words');
    }

    const index = this.words.findIndex(w => w.word === wordData.word);
    if (index === -1) {
      throw new Error(`Word '${wordData.word}' not found in dictionary`);
    }

    this.words[index] = wordData;
    await this.save();
  }

  async deleteWord(word: string): Promise<void> {
    if (!this.words) {
      throw new Error('Dictionary has no words');
    }

    const index = this.words.findIndex(w => w.word === word);
    if (index === -1) {
      throw new Error(`Word '${word}' not found in dictionary`);
    }

    this.words.splice(index, 1);
    await this.save();
  }
}