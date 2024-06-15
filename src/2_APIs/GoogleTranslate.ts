import { TranslationServiceClient } from '@google-cloud/translate';

const projectId = process.env.GOOGLE_PROJECT_ID;
const location = 'global';

const translationClient = new TranslationServiceClient();

export const translate = async (text: string, sourceLanguageCode: string, targetLanguage: string) => {
  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLanguageCode,
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);
    if (response && response.translations && response.translations.length > 0) {
      // console.log(`Translation: ${response.translations[0].translatedText}`);
      // console.log(`Detected source language: ${response.translations[0].detectedLanguageCode}`);
      return response.translations[0].translatedText;
    } else {
      console.log('No translations found');
    }
  } catch (error) {
    console.error(`Failed to translate text: ${error}`);
    throw error;
  }
};

export const getSupportedLanguages = async () => {
  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
    };

    const [response] = await translationClient.getSupportedLanguages(request);
    if (response && response.languages) {
      console.log('Supported languages:');
      for (const language of response.languages) {
        console.log(`Language code: ${language.languageCode}`);
        console.log(`Display name: ${language.displayName}`);
      }
      return response.languages;
    } else {
      console.log('No languages found');
    }
  } catch (error) {
    console.error(`Failed to get supported languages: ${error}`);
    throw error;
  }
};

