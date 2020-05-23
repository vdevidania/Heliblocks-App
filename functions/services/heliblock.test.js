const Heliblock = require("./heliblock");
const basePreviewStyles = require("./basePreviewStyles");

describe("Heliblock initial value", () => {
  const initialValue = {
    alignment: "normal",
    author: "u2lSmXX6qzVRJMwTFhT4UEX2oUu2",
    description: "",
    createdAt: new Date(),
    publised: true,
    lastUpdate: new Date(),
    screenshot: "preview.jpg",
    tags: [],
    template: null,
    theme: "twentynineteen",
    title: "title",
    html: `
      <h1>Hello</h1>
      <p>World!</p>
      <script>alert("hello!")</script>
    `,
    css: `
    body {
      background: red;
    }</style><script></script>`
  };
  let heliblock;

  beforeEach(() => {
    heliblock = new Heliblock(initialValue);
  });
  test("should get preview", () => {
    const expected = `<style>${basePreviewStyles}${initialValue.css}</style>${initialValue.html}`;
    expect(heliblock.getPreview()).toBe(expected);
  });
  test("should set author in public heliblock", () => {
    const sharedProps = {
      title: expect.any(String),
      description: expect.any(String),
      tags: expect.any(Array),
      lastUpdate: expect.any(Date),
      createdAt: expect.any(Date),
      screenshot: expect.any(String),
      source: expect.objectContaining({
        html: expect.any(String),
        css: expect.any(String)
      })
    };
    const withoutAuthorExpected = expect.objectContaining({
      ...sharedProps,
      author: expect.objectContaining({
        displayName: expect.stringContaining("Unknown"),
        photoURL: expect.any(String)
      })
    });
    expect(heliblock.getPublic()).toEqual(withoutAuthorExpected);
    const author = {
      displayName: "Author Name",
      photoURL: ""
    };

    heliblock.setAuthor(author);
    const withAuthorExpected = expect.objectContaining({
      ...sharedProps,
      author: expect.objectContaining({
        displayName: expect.stringContaining(author.displayName),
        photoURL: expect.any(String)
      })
    });
    expect(heliblock.getPublic()).toEqual(withAuthorExpected);
  });

  test("should minify & sanitize the source", () => {
    const { source } = heliblock.getPublic();

    expect(source.html).toBe("<h1>Hello</h1><p>World!</p>");
    expect(source.css).toBe("body { background: red; }");
  });
});
