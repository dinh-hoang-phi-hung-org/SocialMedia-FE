import { REGEXP } from "@/shared/constants/regex";
import { ValidatorProps, ValidatorResult } from "@/shared/types/common-type/shared-types";

const commonValidators = {
  email: (props: ValidatorProps): ValidatorResult => {
    if (!props.value || props.value.trim() === "") {
      if (props.isUpdate) return { resultType: "success", errorMessage: null };
      return { resultType: "danger", errorMessage: "common:auth.email-required" };
    }
    if (!REGEXP.EMAIL.test(props.value)) {
      return { resultType: "danger", errorMessage: "common:auth.email-invalid" };
    }
    return { resultType: "success", errorMessage: null };
  },

  password: (props: ValidatorProps): ValidatorResult => {
    if (!props.value || props.value.trim() === "") {
      if (props.isUpdate) return { resultType: "success", errorMessage: null };
      return { resultType: "danger", errorMessage: "common:auth.password-required" };
    }

    if (!REGEXP.PASSWORD.test(props.value)) {
      return {
        resultType: "danger",
        errorMessage: "common:auth.password-invalid",
      };
    }
    return { resultType: "success", errorMessage: null };
  },

  phoneNumber: (props: ValidatorProps): ValidatorResult => {
    if (!props.value || props.value === "") {
      return { resultType: "success", errorMessage: null };
    }
    if (props.value.length < 10 || props.value.length > 15) {
      return { resultType: "danger", errorMessage: "common:validation.phone-number.length" };
    }
    if (!REGEXP.PHONE_NUMBER.test(props.value)) {
      return { resultType: "danger", errorMessage: "common:validation.phone-number.invalid" };
    }
    return { resultType: "success", errorMessage: null };
  },

  name: (props: ValidatorProps): ValidatorResult => {
    if (!props.value || props.value === "") {
      return {
        resultType: "danger",
        errorMessage: `${props.prefix ?? ""} common:validation.required`,
      };
    }
    if (props.value.length < 1 || props.value.length > 50) {
      return {
        resultType: "danger",
        errorMessage: `${props.prefix ?? ""} common:validation.length`,
      };
    }
    return { resultType: "success", errorMessage: null };
  },
};

export default commonValidators;
