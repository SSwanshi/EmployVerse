const { pipeline } = require('@xenova/transformers');

class SemanticMatcher {
  constructor() {
    this.extractor = null;
    this.initPromise = null;
  }

  async init() {
    if (this.extractor) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        console.log("Loading all-MiniLM-L6-v2 semantic model...");
        this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          // quantize for faster inference on CPU
          quantized: true,
        });
        console.log("Semantic model loaded.");
        resolve();
      } catch (error) {
        console.error("Failed to load semantic model:", error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  async getEmbedding(text) {
    await this.init();
    // Return the [CLS] token embedding (first token) or mean pooling
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Compare candidate text representation with job text representation.
   * e.g., combine all skills and roles into a single sentence for both.
   */
  async getSemanticMatchScore(candidateProfile, jobIndex) {
    try {
      const candidateText = [
        ...candidateProfile.skills,
        ...candidateProfile.inferredRoles
      ].join(" ");
      
      const jobText = [
        ...jobIndex.requiredSkills,
        ...jobIndex.preferredSkills,
        ...jobIndex.roleCategory
      ].join(" ");

      if (!candidateText || !jobText) return 0;

      const vecA = await this.getEmbedding(candidateText);
      const vecB = await this.getEmbedding(jobText);

      return this.cosineSimilarity(vecA, vecB) * 100; // Return 0-100 score
    } catch (err) {
      console.error("Semantic matching error:", err);
      return 0; // Fallback gracefully
    }
  }
}

const semanticMatcher = new SemanticMatcher();
module.exports = semanticMatcher;
