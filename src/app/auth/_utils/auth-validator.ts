import { REGEXP } from "@/shared/constants/regex";
import { ValidatorProps } from "@/shared/types/common-type/shared-types";
import { ValidatorResult } from "@/shared/types/common-type/shared-types";
import commonValidators from "@/shared/utils/validation/common-validator";

const authValidators = {
  username: (props: ValidatorProps): ValidatorResult => {
    if (!props.value || props.value === "")
      return { resultType: "danger", errorMessage: "common:auth.username-required" };
    if (props.value.length < 2)
      return { resultType: "danger", errorMessage: "common:auth.username-must-be-at-least-2-characters-long" };
    if (!REGEXP.USERNAME.test(props.value)) {
      return { resultType: "danger", errorMessage: "common:auth.username-invalid" };
    }
    return { resultType: "success", errorMessage: null };
  },

  password: (props: ValidatorProps): ValidatorResult => {
    return commonValidators.password(props);
  },

  confirmPassword: (password: string, confirmPassword: string): ValidatorResult => {
    if (!confirmPassword) return { resultType: "danger", errorMessage: "common:auth.confirm-password-required" };
    if (password !== confirmPassword)
      return { resultType: "danger", errorMessage: "common:auth.passwords-do-not-match" };
    return { resultType: "success", errorMessage: null };
  },
};

export default authValidators;
