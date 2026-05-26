import type { StorybookConfig } from "@storybook/react-vite";
import * as path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: path.resolve(process.cwd(), "tsconfig.json"),
      shouldExtractLiteralValuesFromEnum: true,
      compilerOptions: {
        allowJs: true,
        checkJs: false,
        jsx: 1,
      },
      include: ["../src/**/*"],

      propFilter: (prop: any) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
};

export default config;
