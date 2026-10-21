'use strict';

const { stripHTML, unescapeHTML } = require('hexo-util');

// Plain-text summary for post lists and meta descriptions. Prefers front-matter
// `description`, then the `<!-- more -->` excerpt, then the opening prose.
hexo.extend.helper.register('post_summary', function(post, length = 120) {
  if (post.description) return post.description;
  const html = (post.excerpt || post.content || '')
    .replace(/<(pre|figure|table|sup|h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const text = unescapeHTML(stripHTML(html)).replace(/\s+/g, ' ').trim();
  const chars = [...text];
  return chars.length > length ? chars.slice(0, length).join('').trimEnd() + '…' : text;
});
