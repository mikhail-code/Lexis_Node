export interface UserConfig {
    base_language: string;
    learning_languages: string[];
  }
  
  export interface Word {
    word: string;
    translation: string;
    transliteration?: string;
    comment?: string;
  }
  
  export interface DictionaryInfo {
    id: string;
    tags: string[];
    name: string;
    owner: string;
    main_language: string;
    learning_language: string;
    owner_uuid: string;
    lastModified?: Date;
  }
  
  export interface DictionaryResponse extends DictionaryInfo {
    words: Word[];
  }
  
  export interface CheckedDictionary {
    dictionaryName: string;
    dictionaryId: string;
    exists: boolean;
  }

  export interface LoginRequest {
    login: string;  // or email
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    birthDate?: Date;
    surname?: string;
    country?: string;
    login: string;
  }
  
  export interface UserResponse {
    userLogin: string;
    userID: string;
    name: string;
    surname: string;
    email: string;
    country: string;
    configuration: {
      base_language: string;
      learning_languages: string[];
    };
  }

  export interface TokenPayload {
    id: string;
    iat?: number;
    exp?: number;
  }
  
  export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
  }
  