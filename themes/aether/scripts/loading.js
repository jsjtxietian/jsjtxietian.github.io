'use strict';

const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const { escapeHTML, stripHTML, unescapeHTML } = require('hexo-util');

// Inspect rendered text so dollar signs in code blocks do not load MathJax.
hexo.extend.helper.register('needs_math', function(page) {
  if (page.mathjax === false) return false;
  if (page.mathjax === true) return true;
  const text = stripHTML((page.content || '').replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));
  return /\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|(^|[^\\$])\$(?!\s|\$)[^$\n]+?\$/.test(text);
});

hexo.extend.filter.register('after_post_render', function(data) {
  // hexo-reference injects this render-blocking CDN stylesheet into every post.
  // The theme supplies its own local tooltip styles on pages with footnotes.
  data.content = data.content.replace(/<link\b[^>]*\bhref=["']https:\/\/cdn\.jsdelivr\.net\/hint\.css\/2\.4\.1\/hint\.min\.css["'][^>]*>/gi, '');

  const origin = new URL(hexo.config.url);
  const sourceRoot = path.resolve(hexo.source_dir);
  const rootPrefix = hexo.config.root || '/';
  let imageIndex = 0;
  data.content = data.content.replace(/<picture\b[^>]*>[\s\S]*?<\/picture>|<img\b[^>]*>/gi, (tag) => {
    // Preserve hand-authored responsive pictures.
    if (/^<picture/i.test(tag)) { imageIndex += 1; return tag; }
    const first = imageIndex++ === 0;
    const add = (name, value) => {
      if (!new RegExp('\\s' + name + '\\s*=', 'i').test(tag)) {
        tag = tag.replace(/\s*\/?>$/, ` ${name}="${escapeHTML(String(value))}">`);
      }
    };
    add('loading', first ? 'eager' : 'lazy');
    add('decoding', 'async');
    const src = tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
    if (!src) return tag;

    try {
      const url = new URL(unescapeHTML(src[2]), new URL(data.path || '/', origin));
      if (url.origin !== origin.origin || !url.pathname.startsWith(rootPrefix)) return tag;
      const relative = decodeURIComponent(url.pathname.slice(rootPrefix.length));
      const file = path.resolve(sourceRoot, relative);
      if (!file.startsWith(sourceRoot + path.sep) || !fs.existsSync(file)) return tag;
      const dimensions = sizeOf(file);
      if (!/\s(?:width|height)\s*=/i.test(tag)) {
        add('width', dimensions.width);
        add('height', dimensions.height);
      }
      // Normalize old /../Assets/... URLs without changing Markdown source paths.
      tag = tag.replace(/(\ssrc\s*=\s*)(["']).*?\2/i, (_, prefix) =>
        `${prefix}"${escapeHTML(url.pathname + url.search + url.hash)}"`);

      const webpFile = file.replace(/\.(?:png|jpe?g)$/i, '.webp');
      if (webpFile !== file && !url.search && fs.existsSync(webpFile) && !/\ssrcset\s*=/i.test(tag)) {
        const webpDimensions = sizeOf(webpFile);
        if (webpDimensions.width === dimensions.width && webpDimensions.height === dimensions.height) {
          const webpURL = url.pathname.replace(/\.(?:png|jpe?g)$/i, '.webp');
          return `<picture><source type="image/webp" srcset="${escapeHTML(webpURL)}">${tag}</picture>`;
        }
      }
    } catch (_) {
      // External, missing or unsupported images keep their original source.
    }
    return tag;
  });
  return data;
}, 20);
