module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "jsx-a11y", "@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended", 
  ],
  rules: {
    "prettier/prettier": ["error"],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off", 
    "@typescript-eslint/no-explicit-any": "off",
  },
  settings: {
    react: { version: "detect" },
  },
};
