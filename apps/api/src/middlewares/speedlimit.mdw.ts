import slowDown from 'express-slow-down';



export const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
   delayAfter: 50, // Start slowing down after 50 requests
   delayMs: () =>1000 // 1 second delay per request after threshold
   
  });
  