import rateLimit from "express-rate-limit";

const rateLimiter = (totalRequests, perMin) => {
  return rateLimit({
    windowMs: perMin * 60 * 1000,
    max: totalRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests, please try again later.",
  });
};

const globalRateLimiter = (totalRequests, perMin) => {
  return rateLimit({
    windowMs: perMin * 60 * 1000,
    max: totalRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests, please try again later.",
  });
};

export default globalRateLimiter;
export { rateLimiter };
