import { Request, Response } from 'express';
import * as GoogleTranslate from '../2_APIs/GoogleTranslate';

export const translate = async (req: Request, res: Response) => {
  const { text, targetLanguage } = req.body;
  try {
    const translatedText = await GoogleTranslate.translate(text, targetLanguage);
    res.json({ translatedText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// export const changeLanguage = async (req: Request, res: Response) => {
//   const { language } = req.body;
//   try {
//     const result = await GoogleTranslate.changeLanguage(language);
//     res.json({ result });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };
