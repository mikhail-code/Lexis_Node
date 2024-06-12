import { Translate } from '@google-cloud/translate/build/src/v2';
// https://cloud.google.com/nodejs/docs/reference/translate/latest

const apiKey = process.env.GOOGLE_API_KEY;
const translateClient = new Translate({
    key: apiKey,
});

export const translate = async (text: string, targetLanguage: string) => {
  try {
    const [translation] = await translateClient.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error(`Failed to translate text: ${error}`);
    throw error;
  }
};