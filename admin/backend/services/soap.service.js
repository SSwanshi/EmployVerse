const { getPremiumUsersSoap } = require('../controllers/admin.controller');

const premiumService = {
  PremiumUserService: {
    PremiumUserPort: {
      GetPremiumUsers: getPremiumUsersSoap
    }
  }
};

module.exports = premiumService;
