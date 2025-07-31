/** @type {import('prettier').Options} */
export const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "auto",
  overrides: [
    {
      files: "*.{json,yml,yaml}",
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
