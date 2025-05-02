type RegExpType = {
  readonly USERNAME: RegExp;
  readonly EMAIL: RegExp;
  readonly PHONE_NUMBER: RegExp;
  readonly PASSWORD: RegExp;
};

export const REGEXP: RegExpType = {
  USERNAME: /^[a-zA-Z0-9_-]*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_NUMBER: /^\+?[0-9]{10,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,32}$/,
};
