import { sanitizeHTML } from "./html-element";

describe("sanitizeHTML method", () => {
  it("allows http protocols.", () => {
    const html = `<a href="http://wikipedia.org/Honey">Honey</a>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe('<a href="http://wikipedia.org/Honey">Honey</a>');
  });

  it("allows b and removes strong.", () => {
    const html = `The <strong>color</strong> of <b>honey</b>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe("The color of <b>honey</b>");
  });

  it("allows i and removes em.", () => {
    const html = `The <em>color</em> of <i>honey</i>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe("The color of <i>honey</i>");
  });

  it("cleans disallowed tags and retains allowed", () => {
    const html = `<header><blockquote><b>Honey</b><cite>-Pooh</cite></blockquote</header>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe("<b>Honey</b>-Pooh");
  });

  it("cleans script", () => {
    const html = `<script>somethingDirty();</script>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe("");
  });

  it("cleans ftp protocols.", () => {
    const html = `<a href="ftp://0.0.0.0/foo">Bar</a>`;
    const clean = sanitizeHTML(html);
    expect(clean).toBe("<a>Bar</a>");
  });
});
