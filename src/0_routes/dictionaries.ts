import express, { RequestHandler } from 'express';
import { DictionaryController } from '../1_controllers/dictionaries';
import { isAuthenticated } from '../4_middlewares/auth';
import { AuthenticatedRequest } from '../types/auth.types';

const router = express.Router();

// Helper to type the request handlers
const handler = <T>(fn: (req: AuthenticatedRequest, res: express.Response) => Promise<T>): RequestHandler => {
  return (req, res, next) => fn(req as AuthenticatedRequest, res).catch(next);
};

// Get all dictionaries for authenticated user
router.get('/', isAuthenticated, handler(async (req, res) => {
  const dictionaries = await DictionaryController.getDictionariesByUserId(req.user.id);
  if (!dictionaries?.length) {
    return res.status(404).json({ message: "No dictionaries found" });
  }
  res.json(dictionaries);
}));

// Get all dictionaries with words for authenticated user
router.get('/withWords', isAuthenticated, handler(async (req, res) => {
  const dictionaries = await DictionaryController.getDictionariesWithWordsByUserId(req.user.id);
  if (!dictionaries?.length) {
    return res.status(404).json({ message: "No dictionaries found" });
  }
  res.json(dictionaries);
}));

// Get dictionaries with a check for an existing word
router.get('/checked', isAuthenticated, handler(async (req, res) => {
  const word = req.query.word as string;
  if (!word) {
    return res.status(400).json({ message: "Missing word parameter" });
  }
  const dictionaries = await DictionaryController.getUserDictionariesWithExistingWordCheck(req.user.id, word);
  if (!dictionaries?.length) {
    return res.status(404).json({ message: "No dictionaries found" });
  }
  res.json(dictionaries);
}));

// Create a new dictionary
router.post('/', isAuthenticated, handler(async (req, res) => {
  const dictionaryData = {
    ...req.body,
    owner: req.user.id
  };
  const newDictionary = await DictionaryController.addNewDictionary(dictionaryData);
  res.status(201).json({ message: "Dictionary created successfully", dictionary: newDictionary });
}));

// Delete a dictionary by ID
router.delete('/:dictionaryId', isAuthenticated, handler(async (req, res) => {
  const { dictionaryId } = req.params;
  try {
    await DictionaryController.deleteDictionary(dictionaryId, req.user.id);
    res.json({ message: "Dictionary deleted successfully" });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}));

// Get a dictionary by ID
router.get('/:dictionaryId', isAuthenticated, handler(async (req, res) => {
  const { dictionaryId } = req.params;
  try {
    const dictionary = await DictionaryController.getDictionaryById(dictionaryId, req.user.id);
    res.json(dictionary);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}));

// Add a word to a dictionary
router.post('/:dictionaryId/word', isAuthenticated, handler(async (req, res) => {
  const { dictionaryId } = req.params;
  const wordToAdd = req.body;
  try {
    await DictionaryController.addWordToDictionary(dictionaryId, wordToAdd, req.user.id);
    res.json({ message: "Word added successfully" });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}));

// Delete a word from a dictionary
router.delete('/:dictionaryId/word', isAuthenticated, handler(async (req, res) => {
  const { dictionaryId } = req.params;
  const wordToDelete = req.body.word;
  try {
    await DictionaryController.deleteWordFromDictionary(dictionaryId, wordToDelete, req.user.id);
    res.json({ message: "Word deleted successfully" });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}));

// Update a word in a dictionary
router.put('/:dictionaryId/word', isAuthenticated, handler(async (req, res) => {
  const { dictionaryId } = req.params;
  const updatedWord = req.body.word;
  try {
    await DictionaryController.updateWordInDictionary(dictionaryId, updatedWord, req.user.id);
    res.json({ message: "Word updated successfully" });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    throw error;
  }
}));

export default router;
