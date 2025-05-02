import { SafeParseReturnType } from "zod";

export function isSafeParseSuccess<Output, Input>(result: SafeParseReturnType<Output, Input>) {
  return result.success === true;
}

export function isSafeParseError<Output, Input>(result: SafeParseReturnType<Output, Input>) {
  return result.success === false;
}
