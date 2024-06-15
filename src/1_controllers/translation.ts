import { Request, Response } from 'express';
import * as GoogleTranslate from '../2_APIs/GoogleTranslate';

export const translate = async (req: Request, res: Response) => {
  const { text, sourceLanguageCode, targetLanguage  } = req.body;
  try {
    const translatedText = await GoogleTranslate.translate(text as string, sourceLanguageCode as string, targetLanguage as string);
    res.json({ translatedText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupportedLanguages = async (req: Request, res: Response) => {
  try {
    const languages = await GoogleTranslate.getSupportedLanguages();
    res.json({ languages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
