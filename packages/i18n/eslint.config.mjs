import { config as nestjsConfig } from '@repo/eslint-config/nest-js';

/** @type {import("eslint").Linter.Config} */
export default [{ ignores: ['eslint.config.mjs', 'prettier.config.mjs'] }, ...nestjsConfig];
