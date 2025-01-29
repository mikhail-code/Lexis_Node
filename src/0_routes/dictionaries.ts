import express from 'express';
import { DictionaryController } from '../1_controllers/dictionaries';
import { isAuthenticated } from '../4_middlewares/auth'; // Assuming middleware for authentication

const router = express.Router();

// Get all dictionaries for a user
router.get('/', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const dictionaries = await DictionaryController.getDictionariesByUserId(userId as string);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});

// Get all dictionaries with words for a user
router.get('/withWords', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const dictionaries = await DictionaryController.getDictionariesWithWordsByUserId(userId as string);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});

// Get dictionaries with a check for an existing word
router.get('/checked', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const { userId, word } = req.query;
  if (!userId || !word) {
    return res.status(400).json({ message: "Missing user ID or word" });
  }
  try {
    const dictionaries = await DictionaryController.getUserDictionariesWithExistingWordCheck(userId as string, word as string);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});

// Create a new dictionary
router.post('/', isAuthenticated, async (req: express.Request, res: express.Response) => {
  try {
    const newDictionary = await DictionaryController.addNewDictionary(req.body);
    res.status(201).json({ message: "Dictionary created successfully", dictionary: newDictionary });
  } catch (error) {
    console.error("Error creating dictionary:", error);
    res.status(500).json({ message: "Error creating dictionary" });
  }
});

// Delete a dictionary by ID
router.delete('/:dictionaryId', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const { userId } = req.body;
  try {
    await DictionaryController.deleteDictionary(dictionaryId, userId);
    res.json({ message: "Dictionary deleted successfully" });
  } catch (error) {
    console.error("Error deleting dictionary:", error);
    res.status(500).json({ message: "Error deleting dictionary" });
  }
});

// Get a dictionary by ID
router.get('/:dictionaryId', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  try {
    const dictionary = await DictionaryController.getDictionaryById(dictionaryId);
    if (!dictionary) {
      return res.status(404).json({ message: "Dictionary not found" });
    }
    res.json(dictionary);
  } catch (error) {
    console.error("Error fetching dictionary:", error);
    res.status(500).json({ message: "Error fetching dictionary" });
  }
});

// Add a word to a dictionary
router.post('/:dictionaryId/word', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const wordToAdd = req.body.word;
  try {
    await DictionaryController.addWordToDictionary(dictionaryId, wordToAdd);
    res.json({ message: "Word added successfully" });
  } catch (error) {
    console.error("Error adding word:", error);
    res.status(500).json({ message: "Error adding word" });
  }
});

// Delete a word from a dictionary
router.delete('/:dictionaryId/word', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const wordToDelete = req.body.word;
  try {
    await DictionaryController.deleteWordFromDictionary(dictionaryId, wordToDelete);
    res.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ message: "Error deleting word" });
  }
});

// Update a word in a dictionary
router.put('/:dictionaryId/word', isAuthenticated, async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const updatedWord = req.body.word;
  try {
    await DictionaryController.updateWordInDictionary(dictionaryId, updatedWord);
    res.json({ message: "Word updated successfully" });
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({ message: "Error updating word" });
  }
});

export default router;
