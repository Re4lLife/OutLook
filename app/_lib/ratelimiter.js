import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./Redis";


export const emailLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "40 s"),
  analytics: true,
  prefix: "@limit/email",
});

export const ipLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "40 s"),
  analytics: true,
  prefix: "@limit/ip",
});