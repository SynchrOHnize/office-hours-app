import NodeCache from "node-cache";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Cache expires after 5 minutes

function generateCacheKey(req: Request) {
  const keyData = {
    url: req.originalUrl, // Full URL (including query params)
    params: req.params, // Route parameters
    query: req.query, // Query parameters
    body: req.body, // Request body
  };

  // Serialize and hash the key data to generate a unique cache key
  return crypto.createHash("sha256").update(JSON.stringify(keyData)).digest("hex");
}

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cacheKey = generateCacheKey(req);
  // Check if data exists in the cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for url: ${req.originalUrl}`);
    return res.json(cachedData);
  }
  const originalJson = res.json.bind(res);
  res.json = (data: any): Response<any> => {
    cache.set(cacheKey, data); // Cache the response data
    console.log(`Cache set for url: ${req.originalUrl}`);
    return originalJson(data); // Call the original res.json method
  };

  next(); // Proceed to the next middleware or route handler
};
