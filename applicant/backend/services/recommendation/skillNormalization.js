/**
 * Centralized skill normalization dictionary.
 * Maps various variations of a skill to a single standardized name.
 */

const normalizationDictionary = {
  // JavaScript
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'java script': 'JavaScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'next': 'Next.js',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'express': 'Express',
  'expressjs': 'Express',
  'express.js': 'Express',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',

  // Python
  'py': 'Python',
  'python': 'Python',
  'python3': 'Python',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',

  // Databases
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'redis': 'Redis',

  // DevOps & Cloud
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'Google Cloud Platform',
  'google cloud': 'Google Cloud Platform',
  'azure': 'Microsoft Azure',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',

  // Other languages
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'java': 'Java',
  'golang': 'Go',
  'go': 'Go',
  'rust': 'Rust',

  // ML/AI
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'ai': 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',
  'nlp': 'NLP',
  'deep learning': 'Deep Learning',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'keras': 'Keras',
  'pandas': 'Pandas',
  'numpy': 'NumPy'
};

/**
 * Normalizes an array of skills
 * @param {string[]} skills - Array of raw skills
 * @returns {string[]} Array of normalized, deduplicated skills
 */
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];
  
  const normalized = skills.map(skill => {
    const lower = skill.toLowerCase().trim();
    // Use dictionary if exists, else keep original but Title Cased
    if (normalizationDictionary[lower]) {
      return normalizationDictionary[lower];
    }
    // Capitalize first letter of each word for unknown skills
    return lower.replace(/\b\w/g, c => c.toUpperCase());
  });

  // Deduplicate
  return [...new Set(normalized)];
};

module.exports = {
  normalizeSkills,
  normalizationDictionary
};
