export interface AuthStep {
  otpSent: boolean;
  otpVerified: boolean;
}

export interface AccessTokens {
  authToken: string | null;
  refreshToken: string | null;
}

export interface Signin {
  username: string;
  otp: string;
}

export interface RequestLoginOtp {
  username: string;
}

export interface ValidataEmailOTP {
  email: string;
  otp: string;
}

export interface Signup {
  username: string;
  email: string;
  cin: string;
  companyName: string;
  designation: string;
  mobileNumber: string;
  isAgree: boolean;
}
