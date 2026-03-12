// Redis is optional - if not configured, the app will work without caching
let client = null;
let redisAvailable = false;
let initAttempted = false;

export const getRedisClient = () => {
  // Return null if Redis is not configured or not available
  if (!redisAvailable || !client) {
    return null;
  }
  return client;
};

export const initRedis = async () => {
  // Only attempt initialization once
  if (initAttempted) {
    return;
  }
  initAttempted = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("Redis not configured - running without cache");
    return;
  }

  // Suppress console.error temporarily to catch Redis connection errors
  const originalError = console.error;
  let errorSuppressed = false;
  
  console.error = (...args) => {
    // Suppress Redis connection errors
    const message = args[0]?.toString() || '';
    if (message.includes('Redis error') || message.includes('ECONNREFUSED') || message.includes('6379')) {
      errorSuppressed = true;
      return; // Don't log Redis connection errors
    }
    originalError.apply(console, args);
  };

  try {
    const { createClient } = await import("redis");
    client = createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: false, // Don't auto-reconnect if connection fails
        connectTimeout: 2000 // 2 second timeout
      }
    });

    // Set up error handler that does nothing during initial connection
    client.on("error", () => {
      // Silently ignore all errors - we'll handle connection failure in catch block
    });

    // Try to connect with a timeout
    try {
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout")), 2000)
        )
      ]);
      
      redisAvailable = true;
      console.log("Redis connected successfully");
    } catch (connectErr) {
      // Connection failed - clean up silently
      client.removeAllListeners("error");
      try {
        if (client.isOpen) {
          await client.quit().catch(() => {});
        }
      } catch (cleanupErr) {
        // Ignore cleanup errors
      }
      client = null;
      redisAvailable = false;
      // Only log if we didn't already suppress the error
      if (!errorSuppressed) {
        console.log("Redis not available - running without cache");
      }
    }
  } catch (err) {
    // Failed to import redis or other setup error
    client = null;
    redisAvailable = false;
    if (!errorSuppressed) {
      console.log("Redis not available - running without cache");
    }
  } finally {
    // Restore original console.error
    console.error = originalError;
  }
};

export const disconnectRedis = async () => {
  if (client && redisAvailable) {
    try {
      client.removeAllListeners("error");
      if (client.isOpen) {
        await client.quit();
      }
    } catch (err) {
      // Ignore disconnect errors
    }
    client = null;
    redisAvailable = false;
  }
};

