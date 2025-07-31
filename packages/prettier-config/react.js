import { config as baseConfig } from "./base.js";

/** @type {import('prettier').Options} */
export const config = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), "prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cva", "cn"]
};
