// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.app.json",
          "./tsconfig.node.json",
          "./tsconfig.electron.json",
          "./tsconfig.configs.json",
          "./vitest.config.ts",
        ],
        sourceType: "module",
      },
    },
    plugins: {
      tsPlugin,
    },
    extends: [eslintConfigPrettier],
  },
  {
    ignores: ["dist/", "build/"],
  },
);
