import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // NOTE: In a real app, user might input this or it comes from env
    // For this demo, we assume process.env.API_KEY is available as per instructions
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        console.warn("No API Key found for Gemini");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const enhanceText = async (text: string, type: 'grammar' | 'expand' | 'tone'): Promise<string> => {
    const ai = getClient();
    if (!ai) return text;

    let prompt = "";
    if (type === 'grammar') prompt = "Fix grammar and spelling, keep the same tone/language: " + text;
    if (type === 'expand') prompt = "Expand on this idea slightly to make it more inspiring, keep the language used: " + text;
    if (type === 'tone') prompt = "Make this text sound more professional and reflective (Vas3k style blog), keep language: " + text;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || text;
    } catch (e) {
        console.error("Gemini Error:", e);
        return text;
    }
};

export const generateTags = async (content: string): Promise<string[]> => {
    const ai = getClient();
    if (!ai) return ['general'];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this blog post and generate 3-5 relevant, short tags (one word each). Return them as a comma-separated list. Content: ${content.substring(0, 500)}`,
        });
        const text = response.text || "";
        return text.split(',').map(s => s.trim().replace('#', ''));
    } catch (e) {
        return ['general', 'life'];
    }
};
