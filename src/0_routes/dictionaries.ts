import express from "express";
import { Dictionary } from "../3_models/dictionary";
import {
  addNewDictionary,
  getDictionariesByUserId,
  getDictionaryById,
  deleteDictionary,
  addWordToDictionary,
  deleteWordFromDictionary,
  updateWordInDictionary,
  getUserDictionariesWithExistingWordCheck,
  getDictionariesWithWordsByUserId
} from "../1_controllers/dictionaries";
// import { verifyToken } from "../middlewares/auth"; // Assuming middleware for authentication

const router = express.Router();

// Get all dictionaries for a user (assuming user ID in request body)
router.get("/", async (req: express.Request, res: express.Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const dictionaries = await getDictionariesByUserId(userId);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});

router.get("/withWords", async (req: express.Request, res: express.Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const dictionaries = await getDictionariesWithWordsByUserId(userId);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});

router.get("/checked", async (req: express.Request, res: express.Response) => {
  const { userId } = req.body; 
  const { word } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const dictionaries = await getUserDictionariesWithExistingWordCheck(userId, word);
    if (!dictionaries) {
      return res.status(404).json({ message: "No dictionaries found" });
    }
    res.json(dictionaries);
  } catch (error) {
    console.error("Error fetching user dictionaries:", error);
    res.status(500).json({ message: "Error fetching dictionaries" });
  }
});


// Create a new dictionary (protected route with middleware?)
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    const newDictionary = await addNewDictionary(req.body);
    res.status(201).json({ message: "Dictionary created successfully", dictionary: newDictionary });
  } catch (error) {
    console.error("Error creating dictionary:", error);
    res.status(500).json({ message: "Error creating dictionary" });
  }
});

// Get a dictionary by ID
router.get("/:dictionaryId", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  try {
    const dictionary = await getDictionaryById(dictionaryId);
    if (!dictionary) {
      return res.status(404).json({ message: "Dictionary not found" });
    }
    res.json(dictionary);
  } catch (error) {
    console.error("Error fetching dictionary:", error);
    res.status(500).json({ message: "Error fetching dictionary" });
  }
});

// Delete a dictionary by ID
router.delete("/:dictionaryId", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const { userId } = req.body; 
  try {
    await deleteDictionary(dictionaryId, userId);
    res.json({ message: "Dictionary deleted successfully" }); // Or send no content (204)
  } catch (error) {
    console.error("Error deleting dictionary:", error);
    res.status(500).json({ message: "Error deleting dictionary" });
  }
});

router.post("/:dictionaryId/word", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const wordToAdd = req.body.word;
  try {
    const addedWord = await addWordToDictionary(dictionaryId, wordToAdd);
    res.json({ message: "Word added successfully", word: addedWord });
  } catch (error) {
    console.error("Error adding word:", error);
    res.status(500).json({ message: "Error adding word" });
  }
});

router.delete("/:dictionaryId/word", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const wordToDelete = req.body.word;
  try {
    await deleteWordFromDictionary(dictionaryId, wordToDelete);
    res.json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ message: "Error deleting word" });
  }
});

router.put("/:dictionaryId/word", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const updatedWord = req.body.word;
  try {
    await updateWordInDictionary(dictionaryId, updatedWord);
    res.json({ message: "Word updated successfully" });
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({ message: "Error updating word" });
  }
});

export default router;
