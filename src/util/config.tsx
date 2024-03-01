import { LxcConfigOptionCategories, ConfigField } from "types/config";

export const toConfigFields = (
  categories: LxcConfigOptionCategories,
): ConfigField[] => {
  const result: ConfigField[] = [];

  for (const [categoryKey, categoryValue] of Object.entries(categories)) {
    for (const configOption of categoryValue.keys) {
      for (const [key, value] of Object.entries(configOption)) {
        const configField = {
          ...value,
          category: categoryKey,
          default: value.defaultdesc?.startsWith("`")
            ? value.defaultdesc.split("`")[1]
            : "",
          key,
        };
        result.push(configField);
      }
    }
  }

  return result;
};

export const configDescriptionToHtml = (
  input: string,
  docBaseLink: string,
  objectsInvTxt?: string[],
): string => {
  // special characters
  let result = input
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>");

  // replace admonition markup
  result = result
    .replaceAll("```", "")
    .replaceAll("{important}", "<b>Important</b>");

  // documentation links
  if (objectsInvTxt) {
    // tags like {ref}`instance-options-qemu` can be in the input string
    const linkTags = input.match(/{(config|ref|config:option)}`[a-z-:._]+`/g);
    linkTags?.map((tag) => {
      const token = tag
        .substring(tag.indexOf("`") + 1, tag.lastIndexOf("`"))
        ?.split(":")
        .pop();
      if (!token) {
        return;
      }
      // find line with token wrapped in spaces to avoid matching partial tokens
      const line = objectsInvTxt.find((item) => item.includes(` ${token} `));
      if (!line) {
        return;
      }
      const docPath = line.split(": ")[1];
      const linkText = token.replaceAll("-", " ");
      const link = `<a href="${docBaseLink}/${docPath}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;

      result = result.replaceAll(tag, link);
    });
  }

  // code blocks
  let count = 0;
  const maxCodeblockReplacementCount = 100; // avoid infinite loop
  while (result.includes("`") && count++ < maxCodeblockReplacementCount) {
    result = result.replace("`", "<code>").replace("`", "</code>");
  }

  return result;
};
