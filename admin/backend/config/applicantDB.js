const mongoose = require("mongoose");
require("dotenv").config();

let applicantConn;

const connectApplicantDB = async () => {
  if (!applicantConn) {
    applicantConn = await mongoose.createConnection(
      process.env.MONGO_URI_APPLICANT || "mongodb://localhost:27017/applicant_db",
      {
        serverSelectionTimeoutMS: 20000
      }
    );
    console.log("✅ Applicant DB Connected (from admin server)");
  }
  return applicantConn;
};

module.exports = connectApplicantDB;

