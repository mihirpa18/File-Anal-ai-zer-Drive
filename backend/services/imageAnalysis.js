const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const { GEMINI_MODEL } = require('../utils/constants');

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

/**
 * Converts a local file to a format the Gemini API can understand.
 * @param {string} path The local path to the file.
 * @param {string} mimeType The MIME type of the file.
 * @returns {{inlineData: {data: string, mimeType: string}}}
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

/**
 * Analyze an image using the Google Gemini Vision API.
 * @param {string} filePath - Path to the image file.
 * @param {string} mimeType - The MIME type of the image.
 * @returns {Promise<Object>} Analysis results with tags and a summary.
 */
const analyzeImage = async (filePath, mimeType) => {
  try {
    console.log(`Analyzing image with Gemini SDK: ${filePath}`);

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error('GOOGLE_GEMINI_API_KEY is not set.');
    }

    const imagePart = fileToGenerativePart(filePath, mimeType);

    const prompt = `
      Analyze this image and return a raw JSON object.
      The JSON object should have two keys:
      1. "tags": an array of exactly 5 relevant, single-word, lowercase descriptive tags.
      2. "summary": a concise one-sentence description of the image.

      Do not include any markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    

    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON object found in the AI's response.");
    }

    const jsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedResult = JSON.parse(jsonString);

    console.log(`Image analysis complete: ${parsedResult.tags.join(', ')}`);

    return {
      tags: parsedResult.tags || [],
      summary: parsedResult.summary || 'No summary available.',
    };

  } catch (error) {
    console.error('Gemini image analysis error:', error.message);
    return {
      tags: ['image', 'upload'],
      summary: 'Image uploaded successfully (AI analysis failed).',
      error: error.message,
    };
  }
};

module.exports = { analyzeImage };