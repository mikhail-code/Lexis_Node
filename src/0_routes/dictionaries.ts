import express from "express";
import { Dictionary } from "../3_models/dictionary"; // Assuming your dictionary model
import { addNewDictionary } from "../1_controllers/dictionaries";
// import { verifyToken } from "../middlewares/auth"; // Assuming your middleware for token verification

const router = express.Router();

// Get all dictionaries (potentially with pagination or filters)
router.get("/", async (req: express.Request, res: express.Response) => {
  // Implement logic to fetch dictionaries based on query parameters (optional)
  // ...
  const { owner } = req.body;
  const dictionaries = await Dictionary.getDictionaries( owner );
  if (!dictionaries) {
    return res.status(404).json({ message: "No dictionaries found" });
  }

  res.json(dictionaries);
});

// Get a specific dictionary by ID
// router.get("/:id", async (req: express.Request, res: express.Response) => {
//   const dictionaryId = req.params.id;

//   try {
//     const dictionary = await Dictionary.getDictionaryById(dictionaryId);
//     if (!dictionary) {
//       return res.status(404).json({ message: "Dictionary not found" });
//     }

//     res.json(dictionary);
//   } catch (error) {
//     console.error("Error fetching dictionary:", error);
//     res.status(500).json({ message: "Error fetching dictionary" });
//   }
// });

// Create a new dictionary (protected route for authenticated users)
router.post("/", async (req: express.Request, res: express.Response) => {
    const { name, tags = [], main_language, learning_language, words = {}, owner } = req.body; // Optional fields
  
    // Validate user input (implement validation logic here)
    if (!name || !owner) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    try {
    const newDictionary = await addNewDictionary(req.body);
      res.status(201).json({ message: "Dictionary created successfully", dictionary: newDictionary });
    } catch (error) {
      console.error("Error creating dictionary:", error);
      res.status(500).json({ message: "Error creating dictionary" });
    }
  });

// Update a dictionary (protected route for authenticated users with authorization checks)
// ... (implement update functionality)

// Delete a dictionary (protected route for authenticated users with authorization checks)
// ... (implement delete functionality)

export default router;
