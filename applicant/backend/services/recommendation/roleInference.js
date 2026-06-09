/**
 * Infers candidate roles based on an array of normalized skills.
 */

const roleMappings = [
  {
    role: 'Frontend Developer',
    keywords: ['React', 'Angular', 'Vue.js', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Tailwind', 'Bootstrap'],
    threshold: 2
  },
  {
    role: 'Backend Developer',
    keywords: ['Node.js', 'Express', 'Django', 'Flask', 'Python', 'Java', 'Spring Boot', 'Ruby on Rails', 'Go', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
    threshold: 2
  },
  {
    role: 'MERN Developer',
    keywords: ['MongoDB', 'Express', 'React', 'Node.js'],
    threshold: 3
  },
  {
    role: 'Full Stack Developer',
    keywords: ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Java', 'MongoDB', 'PostgreSQL', 'SQL'],
    threshold: 4 // Requires a mix of frontend and backend
  },
  {
    role: 'Data Scientist',
    keywords: ['Python', 'Machine Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'SQL', 'R'],
    threshold: 3
  },
  {
    role: 'DevOps Engineer',
    keywords: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Linux', 'Terraform', 'Ansible', 'GitLab', 'GitHub Actions'],
    threshold: 3
  },
  {
    role: 'Mobile Developer',
    keywords: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS', 'Mobile Development'],
    threshold: 2
  },
  {
    role: 'UI/UX Designer',
    keywords: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'UX Design', 'Wireframing', 'Prototyping'],
    threshold: 2
  }
];

/**
 * Infers roles from normalized skills
 * @param {string[]} normalizedSkills 
 * @returns {string[]} Inferred roles
 */
const inferRoles = (normalizedSkills) => {
  if (!normalizedSkills || normalizedSkills.length === 0) return [];
  
  const inferred = [];
  const skillsSet = new Set(normalizedSkills.map(s => s.toLowerCase()));

  for (const mapping of roleMappings) {
    let matchCount = 0;
    
    // Specifically handle Full Stack logic to ensure at least one FE and one BE skill
    if (mapping.role === 'Full Stack Developer') {
      const feSkills = ['react', 'angular', 'vue.js', 'html', 'css', 'javascript'];
      const beSkills = ['node.js', 'django', 'java', 'python', 'go', 'express', 'spring boot', 'ruby'];
      const dbSkills = ['mongodb', 'postgresql', 'sql', 'mysql', 'redis'];
      
      const hasFe = feSkills.some(skill => skillsSet.has(skill));
      const hasBe = beSkills.some(skill => skillsSet.has(skill));
      const hasDb = dbSkills.some(skill => skillsSet.has(skill));
      
      if (hasFe && (hasBe || hasDb)) {
        inferred.push(mapping.role);
      }
      continue;
    }

    for (const keyword of mapping.keywords) {
      if (skillsSet.has(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount >= mapping.threshold) {
      inferred.push(mapping.role);
    }
  }

  // Deduplicate and return
  return [...new Set(inferred)];
};

module.exports = {
  inferRoles,
  roleMappings
};
