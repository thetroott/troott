import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import redisHandler from "../middlewares/redis.mdw";



/**
 * @name getCacheData
 * @description Middleware to respond with cache if available
 */
export const getCacheData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const cacheKey = req.originalUrl.split("?")[0] ?? "";
    const cached = await redisHandler.fetchData(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      const isArray = Array.isArray(parsed);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const start = (page - 1) * limit;
      const end = start + limit;

      const paginated = isArray ? parsed.slice(start, end) : parsed;

      return res.status(200).json({
        error: false,
        message: "Data from cache",
        status: 200,
        records: isArray ? parsed.length : 1,
        page: isArray ? page : undefined,
        limit: isArray ? limit : undefined,
        data: paginated,
      });
    }

    return next();
  }
);


/**
 * Middleware to delete cache for current and base route
 */
export const deleteCache = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {

    await redisHandler.deleteData(req.originalUrl);
    await redisHandler.deleteData(req.baseUrl);

    return next();

  }
);

/**
 * Delete a single cache entry by key
 */
export const delCacheData = async (cacheKey: string): Promise<void> => {

  const existing = await redisHandler.exists(cacheKey);
  if (existing) {
    await redisHandler.deleteData(cacheKey);
  }

};

/**
 * Delete and then set new cache for a route
 */
export const delSetCacheData = async (cacheKey: string, data: any): Promise<void> => {

  // Import config at the top of the file
  await redisHandler.keepData(
    { key: cacheKey, value: data },
    Number(process.env.CACHE_TTL) // TTL in seconds
  );
  
};