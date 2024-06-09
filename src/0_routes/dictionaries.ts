import express from "express";
import { Dictionary } from "../3_models/dictionary";
import {
  addNewDictionary,
  getDictionariesByUserId,
  getDictionaryById,
  deleteDictionary,
  updateDictionaryWords,
} from "../1_controllers/dictionaries";
// import { verifyToken } from "../middlewares/auth"; // Assuming middleware for authentication

const router = express.Router();

// Get all dictionaries for a user (assuming user ID in request body)
router.get("/", async (req: express.Request, res: express.Response) => {
  const { userId } = req.body; // You might want to change this based on your authentication strategy
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
  try {
    await deleteDictionary(dictionaryId);
    res.json({ message: "Dictionary deleted successfully" }); // Or send no content (204)
  } catch (error) {
    console.error("Error deleting dictionary:", error);
    res.status(500).json({ message: "Error deleting dictionary" });
  }
});

// Update dictionary words by ID
router.put("/:dictionaryId/words", async (req: express.Request, res: express.Response) => {
  const dictionaryId = req.params.dictionaryId;
  const newWords = req.body;
  try {
    const updatedDictionary = await updateDictionaryWords(dictionaryId, newWords);
    if (!updatedDictionary) {
      return res.status(404).json({ message: "Dictionary not found" });
    }
    res.json({ message: "Dictionary words updated successfully", dictionary: updatedDictionary });
  } catch (error) {
    console.error("Error updating dictionary words:", error);
    res.status(500).json({ message: "Error updating dictionary words" });
  }
});

export default router;
