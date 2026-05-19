const invalidateJobCache = async (redis) => {
  try {
    const keys = await redis.keys("jobs:*");

    if (keys.length > 0) {
      console.log(`[Redis] Invalidating ${keys.length} job cache keys`);
      redis.del(...keys);
    }

  } catch (error) {
    console.error("[Redis] Cache invalidation error:", error);
  }
};

const invalidateInternshipCache = async (redis) => {
  try {
    const keys = await redis.keys("internships:*");

    if (keys.length > 0) {
      console.log(`[Redis] Invalidating ${keys.length} internship cache keys`);
      redis.del(...keys);
    }

  } catch (error) {
    console.error("[Redis] Cache invalidation error:", error);
  }
};

module.exports = {
  invalidateJobCache,
invalidateInternshipCache
};