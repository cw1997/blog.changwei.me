import type { Root, Element } from "hast";

export function rehypeCodeBlockEnhancer() {
  return function (tree: Root): void {
    const figures: Element[] = [];

    function walk(node: Element | Root): void {
      if (
        node.type === "element" &&
        node.tagName === "figure" &&
        node.properties?.dataRehypePrettyCodeFigure !== undefined
      ) {
        figures.push(node);
      }
      if ("children" in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          if (child.type === "element") {
            walk(child);
          }
        }
      }
    }

    walk(tree);

    for (const figure of figures) {
      const lang = findLang(figure);
      if (lang) {
        figure.properties = { ...figure.properties, dataCodeLang: lang };
      }
    }
  };
}

function findLang(node: Element): string | undefined {
  if (node.tagName === "code") {
    const lang = node.properties?.dataLanguage;
    return typeof lang === "string" && lang ? lang : undefined;
  }
  if (!node.children) return undefined;
  for (const child of node.children) {
    if (child.type === "element") {
      const found = findLang(child);
      if (found) return found;
    }
  }
  return undefined;
}
