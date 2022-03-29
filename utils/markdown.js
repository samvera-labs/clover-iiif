const hljs = require("highlight.js");
const MarkdownIt = require("markdown-it");

const markdown = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return (
      '<pre><code class="hljs">' +
      markdown.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
});

exports.markdown = markdown;
