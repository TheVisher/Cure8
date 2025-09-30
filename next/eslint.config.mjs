import { createRequire } from "module";

const require = createRequire(import.meta.url);

const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const nextPlugin = require("@next/eslint-plugin-next");

const typescriptRecommended = typescriptPlugin.configs.recommended ?? { rules: {} };
const reactRecommended = reactPlugin.configs.recommended ?? { rules: {} };
const reactHooksRecommended = reactHooksPlugin.configs.recommended ?? { rules: {} };
const nextCoreWebVitals = nextPlugin.configs["core-web-vitals"] ?? { rules: {} };

const sharedIgnores = [
  "node_modules/**",
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
];

export default [
  {
    files: ["**/*.{ts,tsx}"],
    ignores: sharedIgnores,
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...typescriptRecommended.rules,
      ...reactRecommended.rules,
      ...reactHooksRecommended.rules,
      ...nextCoreWebVitals.rules,
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    ignores: sharedIgnores,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactRecommended.rules,
      ...reactHooksRecommended.rules,
      ...nextCoreWebVitals.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: sharedIgnores,
  },
];
