import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in process.env");
  }
  return new GoogleGenAI({ apiKey });
};

export const improveDescription = async (currentText: string): Promise<string> => {
  if (!currentText || currentText.length < 5) {
    throw new Error("Tekst jest zbyt krótki, aby go poprawić.");
  }

  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const prompt = `Jesteś asystentem technicznym. Popraw poniższy opis usterki zgłaszanej przez lokatora, aby był bardziej profesjonalny, zwięzły i czytelny dla zarządcy nieruchomości. Zachowaj kluczowe informacje. Nie dodawaj wstępów ani zakończeń, tylko poprawioną treść.
    
    Oryginalny opis: "${currentText}"`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Nie udało się połączyć z asystentem AI.");
  }
};