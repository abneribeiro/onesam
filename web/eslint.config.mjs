import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    rules: {
      // Disable React Compiler warnings for known incompatible libraries
      "react-hooks/incompatible-library": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
];

export default eslintConfig;
