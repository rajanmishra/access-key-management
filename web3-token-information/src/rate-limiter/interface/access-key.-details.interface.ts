import { RateLimitUnit } from '../../schemas/rate-limit-unit.enum';
export interface AccessKeyDetail {
  expirationTime: string;
  userId: string;
  accessKey: string;
  rateLimit: number;
  rateLimitUnit: RateLimitUnit;
  isActive: string;
}
