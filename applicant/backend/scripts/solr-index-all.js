/**
 * Full reindex of jobs + internships from MongoDB (recruiter DB) into Solr.
 * Run after solr:init. Safe to run repeatedly (overwrites same ids).
 *
 * Usage: node scripts/solr-index-all.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/recruiter/Job');
const createInternshipModel = require('../models/recruiter/Internships');
const createCompanyModel = require('../models/recruiter/Company');
const {
  jobToSolrDoc,
  internshipToSolrDoc,
  postJsonDocs,
} = require('../services/solrIndex.service');

const BATCH = 200;

async function main() {
  const recruiterConn = await connectRecruiterDB();
  createCompanyModel(recruiterConn);
  const Job = createJobModel(recruiterConn);
  const Internship = createInternshipModel(recruiterConn);

  const [jobs, internships] = await Promise.all([
    Job.find({}).populate({ path: 'jobCompany', strictPopulate: false }).lean(),
    Internship.find({}).populate({ path: 'intCompany', strictPopulate: false }).lean(),
  ]);

  const jobDocs = jobs.map(jobToSolrDoc);
  const internDocs = internships.map(internshipToSolrDoc);
  const all = [...jobDocs, ...internDocs];

  console.log(`Indexing ${jobDocs.length} jobs, ${internDocs.length} internships (${all.length} docs)...`);

  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    await postJsonDocs(chunk);
    console.log(`  ... ${Math.min(i + BATCH, all.length)} / ${all.length}`);
  }

  console.log('Solr index complete.');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
