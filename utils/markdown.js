const fs = require("fs");
const markdown = require("markdown-it");
const shiki = require("shiki");

async function buildMarkdown() {
  const markdownHTML = await shiki
    .getHighlighter({
      theme: "material-darker",
    })
    .then((highlighter) => {
      const md = markdown({
        html: true,
        highlight: (code, lang) => {
          return highlighter.codeToHtml(code, { lang });
        },
      });

      return md.render(fs.readFileSync("./README.md", "utf-8"));
    });

  return `<div class="documentation-wrapper">${markdownHTML}</div>`;
}

exports.buildMarkdown = buildMarkdown;
