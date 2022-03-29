const fs = require("fs-extra");
const { markdown } = require("./markdown");

async function buildMarkdown() {
  const content = await fs.readFile("./README.md", "utf8");
  const markdownHTML = await markdown.render(content);
  return `<div class="documentation-wrapper">${markdownHTML}</div>`;
}

async function buildHTML(isStatic) {
  const htmlFile = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Demo</title>
      ${isStatic ? ` <link rel="stylesheet" href="./default.css" />` : ``}
      <link rel="stylesheet" href="./styles.css" />
    </head>
    <body>
      <div id="root"></div>
      ${isStatic ? await buildMarkdown() : ``}
      <script src="./script.js"></script>
    </body>
  </html>`;

  return htmlFile;
}

exports.buildHTML = buildHTML;
