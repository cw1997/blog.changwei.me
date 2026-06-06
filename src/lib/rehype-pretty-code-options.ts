import type { Options } from "rehype-pretty-code";

export const rehypePrettyCodeOptions: Options = {
  keepBackground: false,
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  defaultLang: {
    block: "text",
    inline: "text",
  },
};
