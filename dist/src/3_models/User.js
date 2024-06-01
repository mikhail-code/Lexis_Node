"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const pg_1 = require("pg");
const database_1 = __importDefault(require("../0_config/database"));
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcryptjs"));
const pool = new pg_1.Pool(database_1.default);
class User {
    constructor(id = (0, uuid_1.v4)(), name, surname, login, password, email, country, birth_date, config) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.login = login;
        this.password = password;
        this.email = email;
        this.country = country;
        this.birth_date = birth_date;
        this.config = config;
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt.genSalt(10);
            return yield bcrypt.hash(password, salt);
        });
    }
    comparePassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Compare the provided password with the hashed password stored in the database
            const isPasswordMatch = yield bcrypt.compare(password, this.password);
            return isPasswordMatch;
        });
    }
    static createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            //creating and storing user data in the database
            const client = yield pool.connect();
            const hashedPassword = yield user.hashPassword(user.password);
            try {
                const result = yield client.query("INSERT INTO users (name, surname, login, password, email, country, birth_date, config) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [
                    user.name,
                    user.surname,
                    user.login,
                    hashedPassword,
                    user.email,
                    user.country,
                    user.birth_date,
                    user.config,
                ]);
                // Destructuring to create User object
                return new User(result.rows[0].id, result.rows[0].name, result.rows[0].surname, result.rows[0].login, result.rows[0].password, result.rows[0].email, result.rows[0].country, result.rows[0].birth_date, result.rows[0].config);
            }
            finally {
                client.release();
            }
        });
    }
    static getUserByLogin(login) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                let result = yield client.query("SELECT * FROM users WHERE login = $1", [
                    login,
                ]);
                if (result.rows.length === 0) {
                    result = yield client.query("SELECT * FROM users WHERE email = $1", [
                        login,
                    ]);
                    if (result.rows.length === 0) {
                        return null;
                    }
                }
                // Destructuring to create User object
                return new User(result.rows[0].id, result.rows[0].name, result.rows[0].surname, result.rows[0].login, result.rows[0].password, result.rows[0].email, result.rows[0].country, result.rows[0].birth_date, result.rows[0].config);
            }
            finally {
                client.release();
            }
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                const result = yield client.query("SELECT * FROM users WHERE id = $1", [
                    id,
                ]);
                if (result.rows.length === 0) {
                    return null;
                }
                // Destructuring to create User object
                return new User(result.rows[0].id, result.rows[0].name, result.rows[0].surname, result.rows[0].login, result.rows[0].password, result.rows[0].email, result.rows[0].country, result.rows[0].birth_date, result.rows[0].config);
            }
            finally {
                client.release();
            }
        });
    }
    static getUsers(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                const result = yield client.query("SELECT * FROM users LIMIT $1", [
                    limit,
                ]);
                if (result.rows.length === 0) {
                    return null;
                }
                return result.rows.map((row) => new User(row.id, row.name, row.surname, row.login, row.password, row.email, row.country, row.birth_date, row.config));
            }
            finally {
                client.release();
            }
        });
    }
}
exports.User = User;
