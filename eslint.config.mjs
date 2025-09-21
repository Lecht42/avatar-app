import js from "@eslint/js";
import ts from "typescript-eslint";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    ignores: [".next/*", "node_modules/*"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  }
);
