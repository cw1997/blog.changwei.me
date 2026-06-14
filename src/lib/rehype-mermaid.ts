import type { Root, Element, Text } from "hast";

interface Replacement {
  parent: Element | Root;
  index: number;
  node: Element;
}

export function rehypeMermaid() {
  return function (tree: Root): void {
    const replacements: Replacement[] = [];

    function walk(node: Element | Root, parent: Element | Root, index: number): void {
      if (
        node.type === "element" &&
        node.tagName === "pre" &&
        node.children?.[0]?.type === "element"
      ) {
        const codeNode = node.children[0] as Element;
        if (
          codeNode.tagName === "code" &&
          Array.isArray(codeNode.properties?.className) &&
          (codeNode.properties.className as string[]).includes("language-mermaid")
        ) {
          const textNode = codeNode.children?.[0];
          const mermaidCode = textNode?.type === "text" ? (textNode as Text).value : "";
          replacements.push({
            parent,
            index,
            node: {
              type: "element",
              tagName: "div",
              properties: { className: ["mermaid"] },
              children: [{ type: "text", value: mermaidCode } as Text],
            } as Element,
          });
        }
      }
      if ("children" in node && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.type === "element") {
            walk(child as Element, node, i);
          }
        }
      }
    }

    if ("children" in tree && Array.isArray(tree.children)) {
      for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        if (child.type === "element") {
          walk(child as Element, tree, i);
        }
      }
    }

    for (const { parent, index, node } of replacements) {
      parent.children[index] = node;
    }
  };
}
