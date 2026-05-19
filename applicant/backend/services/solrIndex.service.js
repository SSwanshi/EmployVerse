const axios = require('axios');
const { getSolrBaseUrl } = require('../config/solr');

function concatJobSearchText(job) {
  const company = job.jobCompany?.companyName || '';
  const parts = [
    company,
    job.jobTitle,
    job.jobLocation,
    job.jobType,
    job.jobDescription,
    job.jobRequirements,
    job.jobExperience,
    job.noofPositions,
    job.jobSalary,
    job.jobExpiry,
  ];
  if (job.jobSalary !== undefined && job.jobSalary !== null) {
    parts.push(`${job.jobSalary} LPA`);
  }
  return parts
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
    .map((v) => String(v))
    .join(' ');
}

function concatInternshipSearchText(int) {
  const company = int.intCompany?.companyName || '';
  const parts = [
    company,
    int.intTitle,
    int.intLocation,
    int.intDescription,
    int.intRequirements,
    int.intDuration,
    int.intExperience,
    int.intPositions,
    int.intStipend,
    int.intExpiry,
  ];
  return parts
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
    .map((v) => String(v))
    .join(' ');
}

function jobToSolrDoc(job) {
  const mongoId = job._id.toString();
  return {
    id: `job_${mongoId}`,
    type_s: 'job',
    mongoId_s: mongoId,
    text_all: concatJobSearchText(job),
  };
}

function internshipToSolrDoc(int) {
  const mongoId = int._id.toString();
  return {
    id: `intern_${mongoId}`,
    type_s: 'internship',
    mongoId_s: mongoId,
    text_all: concatInternshipSearchText(int),
  };
}

/**
 * POST JSON docs to Solr (requires core + fields; see solr:init).
 */
async function postJsonDocs(docs) {
  if (!docs.length) return;
  const base = getSolrBaseUrl();
  const url = `${base}/update/json/docs?commit=true`;
  const res = await axios.post(url, docs, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000,
    validateStatus: () => true,
  });
  if (res.status !== 200) {
    const msg = res.data?.error?.msg || res.data?.message || JSON.stringify(res.data) || res.statusText;
    throw new Error(`Solr update failed: ${msg}`);
  }
}

module.exports = {
  concatJobSearchText,
  concatInternshipSearchText,
  jobToSolrDoc,
  internshipToSolrDoc,
  postJsonDocs,
};
