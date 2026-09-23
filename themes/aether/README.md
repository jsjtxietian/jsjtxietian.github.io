# Aether

A quiet, reading-first Hexo theme for this blog.

## Visual language

- **Light, not decorative:** cool neutral surfaces, thin dividers and restrained depth.
- **Technology as detail:** mono metadata, precise rules and a restrained blue signal provide the technical character.
- **Reading first:** a 740px reading column, generous line height and minimal article chrome.
- **One system:** semantic design tokens keep every page visually consistent.

## Where to change things

- Site copy, navigation, friends and footer links: `_config.yml`
- Color, type, spacing and component tokens: `source/css/aether.css` under `:root`
- Self-hosted Latin reading typeface: `source/fonts/`
- Page structure: `layout/`
- Search, theme, TOC, copy and scroll behavior: `source/js/aether.js`

The theme has no dependency on the old `oranges` theme or its stylesheets.

## Article loading

- `scripts/loading.js` removes the footnote plugin's remote stylesheet; footnote pages use `source/css/footnotes.css` instead.
- MathJax loads asynchronously only when rendered article text contains math delimiters. Set `mathjax: true` or `mathjax: false` in an article's front matter to override detection.
- Article images use asynchronous decoding. The first image loads eagerly and subsequent images load lazily. Local image dimensions are included at build time to reserve their space.
- Place a same-sized `.webp` beside a PNG or JPEG to serve it through a `<picture>` element with the original image as fallback. Original Markdown image links remain valid. Existing hand-written `<picture>` elements are preserved.
- After changing render filters, run `npm run clean` followed by `npm run build` to refresh cached article HTML.
