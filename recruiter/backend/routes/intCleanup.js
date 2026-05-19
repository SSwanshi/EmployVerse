const Internship = require('../models/Internship');

async function deleteExpiredInternship() {
  try {
    const result = await Internship.deleteMany({
      intExpiry: { $lt: new Date() }
    });
    console.log(`Deleted ${result.deletedCount} expired internships`);
  } catch (error) {
    console.error('Error deleting expired internships:', error);
  }
}

module.exports = deleteExpiredInternship;

