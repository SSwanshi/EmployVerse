const { extractResumeText } = require('./services/ats/textExtractor.service');
console.log('Text extractor imported successfully.');

const { extractStructuredResume } = require('./services/ats/structuredExtraction.service');
console.log('Structured extractor imported successfully.');

const scoringEngine = require('./services/ats/scoringEngine.service');
console.log('Scoring engine imported successfully.');

const semanticMatcher = require('./services/ats/semanticMatcher.service');
console.log('Semantic matcher imported successfully.');

const skillGap = require('./services/ats/skillGapAnalysis.service');
console.log('Skill gap imported successfully.');

const aiRecs = require('./services/ats/aiRecommendations.service');
console.log('AI recs imported successfully.');

console.log('All ATS services imported successfully.');
