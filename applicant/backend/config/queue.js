const { Queue } = require('bullmq');
const Redis = require('ioredis');

let connection;

if (process.env.NODE_ENV === 'test') {
  connection = {};
} else {
  let redisUrl = process.env.REDIS_URL;
  let isUpstash = redisUrl && redisUrl.includes('upstash.io');
  
  if (isUpstash && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }

  const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000
  };

  if (redisUrl && redisUrl.startsWith('rediss://')) {
    redisOptions.tls = {
      rejectUnauthorized: false
    };
  }

  connection = new Redis(redisUrl, redisOptions);
  
  connection.on('error', (err) => {
    console.error('❌ Redis Connection Error in BullMQ Queue:', err.message || err);
  });
}

const notificationQueue = new Queue('notifications', {
  connection
});

const addNotificationJob = async (payload) => {
  return await notificationQueue.add('send_notification', payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
};

module.exports = {
  notificationQueue,
  addNotificationJob,
  connection
};
