const Fuse = require('fuse.js');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/recruiter/Job');
const createInternshipModel = require('../models/recruiter/Internships');
const createCompanyModel = require('../models/recruiter/Company');
const { isSolrEnabled } = require('../config/solr');
const { searchJobsAndInternships } = require('../services/solrSearch.service');

async function searchWithFuse(enteredValue) {
  const recruiterConn = await connectRecruiterDB();
  const JobFindConn = createJobModel(recruiterConn);
  const InternshipFindConn = createInternshipModel(recruiterConn);
  createCompanyModel(recruiterConn);

  const JobFind = await JobFindConn.find({}).populate({
    path: 'jobCompany',
    strictPopulate: false,
  }).lean();

  const options1 = {
    keys: [
      {
        name: 'companyName',
        getFn: (obj) => (obj.jobCompany ? obj.jobCompany.companyName || '' : ''),
      },
      'jobTitle',
      'jobLocation',
      'jobType',
      'jobDescription',
      'jobRequirements',
      'jobExperience',
      'noofPositions',
      'jobSalary',
      'jobExpiry',
      {
        name: 'salaryLabel',
        getFn: (obj) =>
          obj.jobSalary !== undefined && obj.jobSalary !== null
            ? `${obj.jobSalary} LPA`
            : '',
      },
    ],
    threshold: 0.3,
    includeScore: true,
  };

  const fuse1 = new Fuse(JobFind, options1);
  function searchJobs(val) {
    if (!val) return [];
    return fuse1.search(val).map((result) => result.item);
  }

  const InternshipFind = await InternshipFindConn.find({}).populate({
    path: 'intCompany',
    strictPopulate: false,
  }).lean();

  const options2 = {
    keys: [
      {
        name: 'companyName',
        getFn: (obj) => (obj.intCompany ? obj.intCompany.companyName || '' : ''),
      },
      'intTitle',
      'intLocation',
      'intDescription',
      'intRequirements',
      'intDuration',
      'intExperience',
      'intPositions',
      'intStipend',
      'intExpiry',
    ],
    threshold: 0.3,
    includeScore: true,
  };

  const fuse2 = new Fuse(InternshipFind, options2);
  function searchIntern(val) {
    if (!val) return [];
    return fuse2.search(val).map((result) => result.item);
  }

  return {
    jobs: searchJobs(enteredValue),
    internships: searchIntern(enteredValue),
  };
}

const search = async (req, res) => {
  try {
    const { parsedValue } = req.body;
    const enteredValue = typeof parsedValue === 'string' ? parsedValue : '';

    let jobs;
    let internships;
    let engine = 'solr';

    if (isSolrEnabled() && enteredValue.trim()) {
      try {
        const out = await searchJobsAndInternships(enteredValue);
        jobs = out.jobs;
        internships = out.internships;
        engine = 'solr';
      } catch (e) {
        console.error('Solr search failed, falling back to Fuse:', e.message || e);
        const out = await searchWithFuse(enteredValue);
        jobs = out.jobs;
        internships = out.internships;
        engine = 'solr';
      }
    } else {
      const out = await searchWithFuse(enteredValue);
      jobs = out.jobs;
      internships = out.internships;
      engine = 'solr';
    }

    res.setHeader('X-Search-Engine', engine);
    res.json({
      engine,
      query: enteredValue,
      jobs,
      internships,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  search,
};
