const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdf = require('pdf-parse');
const { GEMINI_MODEL } = require('../utils/constants');

// Initialize the Google Generative AI client with  API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

/**
 * Extracts text from a given file (PDF or plain text).
 * @param {string} filePath - The path to the file.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractTextFromFile(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text || '';
    } else if (mimeType.startsWith('text/')) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error.message);
    return '';
  }
}

/**
 * Analyze text document using Google Gemini.
 * @param {string} filePath - Path to text/PDF file.
 * @param {string} mimetype - File MIME type.
 * @returns {Promise<Object>} Analysis results with tags and summary.
 */
const analyzeText = async (filePath, mimetype) => {
  try {
    console.log(`Analyzing document with Gemini SDK: ${filePath}`);

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not set.');
    }
    
    const textContent = await extractTextFromFile(filePath, mimetype);
    
    if (!textContent || textContent.trim().length === 0) {
      return { 
        tags: ['document', 'upload'], 
        summary: 'Document uploaded successfully (no content to analyze).' 
      };
    }

    const truncatedText = textContent.substring(0, 30000).trim();

    if (truncatedText.length < 10) {
      return { 
        tags: ['short document'], 
        summary: 'Document content is too short to analyze.' 
      };
    }

    const prompt = `
      Analyze the following document text and return ONLY a raw JSON object without any markdown formatting.
      The JSON object must have exactly two keys:
      1. "tags": an array of 5-7 relevant, single-word, lowercase keywords or topics.
      2. "summary": a concise 1-2 sentence summary of the document.

      Return ONLY the JSON object, nothing else.

      Document content:
      ${truncatedText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON object found in the AI's response.");
    }
    
    const jsonString = responseText.substring(startIndex, endIndex + 1);
    const parsedResult = JSON.parse(jsonString);

    console.log(`Text analysis complete: ${parsedResult.tags.join(', ')}`);

    return {
      tags: parsedResult.tags || ['document', 'text'],
      summary: parsedResult.summary || 'Document analyzed successfully.',
    };

  } catch (error) {
    console.error('Gemini text analysis error:', error.message);
    return {
      tags: ['document', 'text'],
      summary: 'Document uploaded successfully (AI analysis failed).',
      error: error.message,
    };
  }
};

module.exports = { analyzeText };