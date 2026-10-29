export class SmsSendError extends Error {
  readonly providerStatus: number | null;

  readonly failure: "network" | "http" | "response";

  constructor(
    failure: "network" | "http" | "response",
    providerStatus: number | null = null,
  ) {
    super("SMS provider failed to send the OTP.");
    this.name = "SmsSendError";
    this.failure = failure;
    this.providerStatus = providerStatus;
  }
}

export type SendOtpParams = {
  /** Canonical `+989XXXXXXXXX` phone. */
  phone: string;
  /** Plaintext OTP. Callers and providers must not log or persist it. */
  code: string;
};

export type SmsProvider = {
  sendOtp(params: SendOtpParams): Promise<void>;
};
