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
  // Upstash requires rediss:// (TLS) and specific family options can cause issues
  let redisUrl = process.env.REDIS_URL;
  let isUpstash = redisUrl && redisUrl.includes('upstash.io');
  
  if (isUpstash && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
    console.log("🔒 Upgraded to TLS protocol (rediss://) for Upstash");
  }

  // Simplified and stable configuration
  const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: 10000,
    retryStrategy: (times) => {
      const delay = Math.min(times * 200, 3000); // 200ms up to 3s
      return delay;
    }
  };

  // Add TLS options if using rediss://
  if (redisUrl && redisUrl.startsWith('rediss://')) {
    redisOptions.tls = {
      rejectUnauthorized: false
    };
  }

  redis = new Redis(redisUrl, redisOptions);

  let reconnectCount = 0;

  redis.on("connect", () => {
    reconnectCount = 0;
    console.log("✅ Redis TCP connection established");
  });

  redis.on("ready", () => {
    console.log("✅ Redis ready for commands");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err.message || err);
  });

  redis.on("reconnecting", () => {
    reconnectCount++;
    console.log(`⏳ Redis reconnecting... (attempt ${reconnectCount})`);
  });

  redis.on("close", () => {
    console.log("🔌 Redis connection closed");
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log("\n📵 Closing Redis connection...");
    try {
      await redis.quit();
    } catch (e) {
      redis.disconnect();
    }
    process.exit(0);
  });
}

module.exports = redis;