"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const users_1 = __importDefault(require("./src/0_routes/users"));
const app = (0, express_1.default)(); // Type annotation for Express app
const port = 3000;
require('dotenv').config();
const useMockService = process.env.TO_MOCK === 'true'; // We need this to excape problems with .env values are string by default
app.use(body_parser_1.default.json()); // Add bodyParser middleware
app.use((0, cors_1.default)()); // Add CORS middleware
// ... mount routes
app.use('/users', (0, users_1.default)(useMockService));
// Route for handling GET requests to the root path (/)
app.get('/', (req, res) => {
    res.send('Hello World from TypeScript!');
});
// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
module.exports = app;
