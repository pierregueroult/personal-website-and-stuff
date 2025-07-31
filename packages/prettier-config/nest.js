import { config as baseConfig } from "./base.js";

/** @type {import('prettier').Options} */
export const config = {
  ...baseConfig,
  importOrderParserPlugins: [
    "typescript",
    "classProperties",
    "decorators-legacy",
  ],
  importOrder: ["^@nestjs/(.*)$", "^[a-zA-Z]", "^@", "^[./]"],
};
