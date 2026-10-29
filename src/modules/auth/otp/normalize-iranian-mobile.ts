const LOCAL_IRANIAN_MOBILE = /^09\d{9}$/;
const COUNTRY_CODE_IRANIAN_MOBILE = /^989\d{9}$/;
const CANONICAL_IRANIAN_MOBILE = /^\+989\d{9}$/;

export class InvalidIranianMobileNumberError extends Error {
  constructor() {
    super("Invalid Iranian mobile number.");
    this.name = "InvalidIranianMobileNumberError";
  }
}

// Only the three supported spellings are accepted. Stripping characters or
// inventing a prefix would store a number the customer did not enter.
export function normalizeIranianMobile(phoneNumber: string): string {
  if (typeof phoneNumber !== "string") {
    throw new InvalidIranianMobileNumberError();
  }

  if (LOCAL_IRANIAN_MOBILE.test(phoneNumber)) {
    return `+98${phoneNumber.slice(1)}`;
  }

  if (COUNTRY_CODE_IRANIAN_MOBILE.test(phoneNumber)) {
    return `+${phoneNumber}`;
  }

  if (CANONICAL_IRANIAN_MOBILE.test(phoneNumber)) {
    return phoneNumber;
  }

  throw new InvalidIranianMobileNumberError();
}
