const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts and normalizes text from PDF or DOCX files.
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimetype - The file mimetype
 * @returns {Promise<string>} Normalized extracted text
 */
const extractResumeText = async (fileBuffer, mimetype) => {
  let rawText = '';

  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      rawText = data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = result.value;
    } else {
      throw new Error('Unsupported file format. Please upload PDF or DOCX.');
    }

    return normalizeText(rawText);
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from resume');
  }
};

const normalizeText = (text) => {
  if (!text) return '';
  return text
    // Replace multiple spaces with a single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with a double newline to preserve paragraphs
    .replace(/\n\s*\n/g, '\n\n')
    // Remove null characters or unusual hidden characters
    .replace(/\u0000/g, '')
    // Trim leading/trailing whitespace
    .trim();
};

module.exports = {
  extractResumeText
};
