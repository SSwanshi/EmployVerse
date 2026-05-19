const axios = require('axios');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/recruiter/Job');
const createInternshipModel = require('../models/recruiter/Internships');
const createCompanyModel = require('../models/recruiter/Company');
const { getSolrBaseUrl } = require('../config/solr');

/** Escape characters that break Solr / Lucene query parsers */
function escapeSolrQuery(str) {
  if (!str) return '';
  return String(str).replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

async function solrSelect({ q, filterQuery, rows = 500 }) {
  const base = getSolrBaseUrl();
  const params = new URLSearchParams();
  params.set('q', q);
  params.set('defType', 'edismax');
  params.set('qf', 'text_all');
  params.set('mm', '50%');
  if (filterQuery) params.set('fq', filterQuery);
  params.set('rows', String(rows));
  params.set('wt', 'json');

  const url = `${base}/select?${params.toString()}`;
  const res = await axios.get(url, { timeout: 30000, validateStatus: () => true });
  if (res.status !== 200) {
    const msg = res.data?.error?.msg || res.statusText || 'Solr select failed';
    throw new Error(msg);
  }
  return res.data;
}

function extractOrderedMongoIds(solrResponse) {
  const docs = solrResponse?.response?.docs || [];
  return docs.map((d) => d.mongoId_s).filter(Boolean);
}

async function fetchJobsByIdsInOrder(ids) {
  if (!ids.length) return [];
  const recruiterConn = await connectRecruiterDB();
  createCompanyModel(recruiterConn);
  const Job = createJobModel(recruiterConn);
  const found = await Job.find({ _id: { $in: ids } })
    .populate({ path: 'jobCompany', strictPopulate: false })
    .lean();
  const map = new Map(found.map((j) => [String(j._id), j]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

async function fetchInternshipsByIdsInOrder(ids) {
  if (!ids.length) return [];
  const recruiterConn = await connectRecruiterDB();
  createCompanyModel(recruiterConn);
  const Internship = createInternshipModel(recruiterConn);
  const found = await Internship.find({ _id: { $in: ids } })
    .populate({ path: 'intCompany', strictPopulate: false })
    .lean();
  const map = new Map(found.map((j) => [String(j._id), j]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

/**
 * Full-text search via Solr; returns populated job/internship docs like the old Fuse response.
 */
async function searchJobsAndInternships(enteredValue) {
  const q = escapeSolrQuery(enteredValue.trim());
  if (!q) {
    return { jobs: [], internships: [] };
  }

  const [jobResp, internResp] = await Promise.all([
    solrSelect({ q, filterQuery: 'type_s:job' }),
    solrSelect({ q, filterQuery: 'type_s:internship' }),
  ]);

  const jobIds = extractOrderedMongoIds(jobResp);
  const internIds = extractOrderedMongoIds(internResp);

  const [jobs, internships] = await Promise.all([
    fetchJobsByIdsInOrder(jobIds),
    fetchInternshipsByIdsInOrder(internIds),
  ]);

  return { jobs, internships };
}

module.exports = {
  searchJobsAndInternships,
  escapeSolrQuery,
};
