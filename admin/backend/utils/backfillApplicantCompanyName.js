const mongoose = require('mongoose');
const connectApplicantDB = require('../config/applicantDB');

const DEFAULT_COMPANY_NAME = 'Not specified';

function getApplicantModel(connection) {
  if (connection.models.User) {
    return connection.models.User;
  }

  const applicantSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
  }, { strict: false });

  return connection.model('User', applicantSchema);
}

async function backfillApplicantCompanyName() {
  try {
    const applicantConn = await connectApplicantDB();
    const UserModel = getApplicantModel(applicantConn);

    const result = await UserModel.updateMany(
      {
        $or: [
          { companyName: { $exists: false } },
          { companyName: null },
          { companyName: '' },
        ],
      },
      {
        $set: { companyName: DEFAULT_COMPANY_NAME },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Admin] Backfilled companyName for ${result.modifiedCount} applicants.`);
    }
  } catch (error) {
    console.error('[Admin] Applicant companyName backfill failed:', error.message);
  }
}

module.exports = backfillApplicantCompanyName;
