import { TextCaseInput } from "../types/common-type/shared-types";

export const changeTextCasesToAnother = ({ input, fromCase, toCase }: TextCaseInput): string => {
  // Convert from source case to kebab-case first
  let result = input;

  if (fromCase == "all") {
    if (!/^[a-z][a-zA-Z]*$/.test(input)) {
      fromCase = "camelCase";
    } else if (!/^[A-Z][a-zA-Z]*$/.test(input)) {
      fromCase = "PascalCase";
    } else if (!/^[a-z][a-z_]*[a-z]$/.test(input)) {
      fromCase = "snake_case";
    } else if (!/^[A-Z][a-z]*( [a-z]+)*$/.test(input)) {
      fromCase = "Sentence Case";
    } else if (!/^[a-z][a-z.]*[a-z]$/.test(input)) {
      fromCase = "dot.case";
    } else if (!/^[A-Z][a-z]*(-[A-Z][a-z]*)*$/.test(input)) {
      fromCase = "Header-Case";
    } else if (!/^[A-Z][A-Z_]*[A-Z]$/.test(input)) {
      fromCase = "CONSTANT_CASE";
    } else if (!/^[a-z][a-z-]*[a-z]$/.test(input)) {
      fromCase = "kebab-case";
    }
  }

  switch (fromCase) {
    case "camelCase":
      if (!/^[a-z][a-zA-Z]*$/.test(input)) return "";
      result = result.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      break;
    case "PascalCase":
      if (!/^[A-Z][a-zA-Z]*$/.test(input)) return "";
      result =
        result.charAt(0).toLowerCase() + result.slice(1).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      break;
    case "snake_case":
      if (!/^[a-z][a-z_]*[a-z]$/.test(input)) return "";
      result = result.toLowerCase().replace(/_/g, "-");
      break;
    case "CONSTANT_CASE":
      if (!/^[A-Z][A-Z_]*[A-Z]$/.test(input)) return "";
      result = result.toLowerCase().replace(/_/g, "-");
      break;
    case "dot.case":
      if (!/^[a-z][a-z.]*[a-z]$/.test(input)) return "";
      result = result.replace(/\./g, "-");
      break;
    case "Header-Case":
      if (!/^[A-Z][a-z]*(-[A-Z][a-z]*)*$/.test(input)) return "";
      result = result
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
      break;
    case "path-case":
      if (!/^[a-z][a-z-]*[a-z]$/.test(input)) return "";
      break;
    case "Sentence Case":
      if (!/^[A-Z][a-z]*( [a-z]+)*$/.test(input)) return "";
      result = result.toLowerCase().replace(/ /g, "-");
      break;
    default:
      return "";
  }

  // Convert from kebab-case to target case
  switch (toCase) {
    case "camelCase":
      result = result.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      break;
    case "PascalCase":
      result = result
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      break;
    case "snake_case":
      result = result.replace(/-/g, "_");
      break;
    case "CONSTANT_CASE":
      result = result.replace(/-/g, "_").toUpperCase();
      break;
    case "dot.case":
      result = result.replace(/-/g, ".");
      break;
    case "Header-Case":
      result = result
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
      break;
    case "path-case":
      // Already in correct format
      break;
    case "Sentence Case":
      result = result
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      break;
    default:
      break;
  }

  return result;
};
