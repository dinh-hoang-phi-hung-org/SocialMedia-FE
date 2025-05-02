const ErrorMessages = new Map<string, string>();
ErrorMessages.set(
  "validation.login.credential_wrong",
  "Incorrect username or password. Please check your credentials and try again.",
);
ErrorMessages.set("validation.login.user_inactive", "User was disabled");
ErrorMessages.set("token.access.expired", "Access token has expired");
ErrorMessages.set("token.refresh.expired", "Refresh token has expired");
ErrorMessages.set("token.invalid", "Invalid token. Please provide a valid token to proceed.");
export { ErrorMessages };
