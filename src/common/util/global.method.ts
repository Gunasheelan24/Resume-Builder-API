import * as crypto from 'crypto';

export const generateOtpHandler = () => {
  const generateOtp = crypto.randomInt(100000, 900000).toString();
  return generateOtp;
};
