const Redis = require("ioredis");
const dotenv = require('dotenv');
dotenv.config();

let redis;

if (process.env.NODE_ENV === 'test') {
  redis = {
    on: () => {},
    get: async () => null,
    set: async () => null,
    quit: async () => null,
    connect: async () => null
  };
} else {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });
}

module.exports = redis;