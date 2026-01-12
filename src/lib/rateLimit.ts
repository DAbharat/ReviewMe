import {Ratelimit} from "@upstash/ratelimit"
import { redis } from "./redis";


export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(50, "1 m"),
});