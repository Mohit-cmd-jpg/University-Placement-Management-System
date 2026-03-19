/**
 * Calculate the ATS Score based on job description, parsed resume data, and weights.
 * @param {Object} parsedResume { skills, experienceYears, keywords, jobTitles }
 * @param {String} jobDescription 
 * @param {Object} matchSettings { weights, customKeywords, roleBasedSkills }
 * @param {String} jobRole E.g. "Software Engineer"
 * @returns {Object} Score details Breakdown
 */

const calculateScore = (parsedResume, jobDescription, matchSettings, jobRole) => {
  const { weights, customKeywords, roleBasedSkills } = matchSettings;
  const jdLower = jobDescription.toLowerCase();

  // 1. Keyword Match Score (Weight: ~40%)
  const jdWords = jdLower.split(/\W+/).filter(w => w.length > 2); // Simple word boundary
  const resumeKeywordSet = new Set([...parsedResume.keywords, ...parsedResume.skills].map(w => w.toLowerCase()));
  
  // Combine custom admin keywords with some frequency analysis on JD
  const importantKeywords = [...new Set([...customKeywords, ...jdWords.slice(0, 50)])];
  let keywordMatches = 0;
  let missingKeywords = [];

  importantKeywords.forEach(kw => {
    if (resumeKeywordSet.has(kw.toLowerCase())) {
      keywordMatches++;
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordPercentage = importantKeywords.length > 0 
    ? (keywordMatches / importantKeywords.length) * 100 
    : 100;
  const keywordScoreCalculated = (keywordPercentage * weights.keywordWeight) / 100;


  // 2. Skills Match Score (Weight: ~30%)
  // Combine extracted skills from the JD and known admin role skills
  let requiredSkills = roleBasedSkills?.[jobRole] || [];
  let skillMatches = 0;
  
  requiredSkills.forEach(reqSkill => {
    const isFound = parsedResume.skills.some(
      s => s.toLowerCase() === reqSkill.toLowerCase()
    );
    if(isFound) skillMatches++;
  });

  let skillsPercentage = requiredSkills.length > 0 
    ? (skillMatches / requiredSkills.length) * 100 
    : 100;
    
  const skillsScoreCalculated = (skillsPercentage * weights.skillsWeight) / 100;

  
  // 3. Experience Match Score (Weight: ~20%)
  // Minimal heuristic for logic: check if years mentioned in JD match what they have
  // In a real system, extraction might pick "3+ years", here we'll do a basic check
  const experiencePercentage = parsedResume.experienceYears >= 2 ? 100 : 50; 
  const experienceScoreCalculated = (experiencePercentage * weights.experienceWeight) / 100;


  // 4. Formatting Match Score (Weight: ~10%)
  // Check if they successfully extracted structured titles
  const formattingPercentage = parsedResume.jobTitles && parsedResume.jobTitles.length > 0 ? 100 : 60;
  const formattingScoreCalculated = (formattingPercentage * weights.formattingWeight) / 100;


  // Final Compilation
  const finalScore = Math.round(
    keywordScoreCalculated + 
    skillsScoreCalculated + 
    experienceScoreCalculated + 
    formattingScoreCalculated
  );

  const suggestions = [];
  if (keywordPercentage < 60) suggestions.push('Try using more industry-specific words from the job description.');
  if (skillsPercentage < 50) suggestions.push(`Missing key role skills like: ${requiredSkills.slice(0, 3).join(', ')}.`);
  if (formattingPercentage < 80) suggestions.push('Ensure section headings are clear for better ATS parsing.');

  return {
    atsScore: finalScore,
    keywordMatch: Math.round(keywordPercentage),
    skillsMatch: Math.round(skillsPercentage),
    experienceMatch: Math.round(experiencePercentage),
    formattingScore: Math.round(formattingPercentage),
    missingKeywords: missingKeywords.slice(0, 10), // only return top 10 missing
    suggestions
  };
};

module.exports = {
  calculateScore
};
