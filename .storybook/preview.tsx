import type { Preview, StoryContext } from "@storybook/react";
import { applyTheme, loadTheme } from "@canonical/react-components";
import "../src/sass/styles.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: loadTheme(),
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Light" },
          { value: "dark", icon: "circle", title: "Dark" },
          { value: "system", icon: "mirror", title: "System" },
        ],
      },
    },
  },

  decorators: [
    (Story, context: StoryContext) => {
      const selectedTheme = context.globals.theme;
      applyTheme(selectedTheme);
      return Story();
    },
  ],
};

export default preview;
