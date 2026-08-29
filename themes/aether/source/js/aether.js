(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');
  const progress = document.querySelector('.reading-progress span');

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', closeMenu);

  const updateScrollUI = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 12);
    backToTop?.classList.toggle('is-visible', y > 600);
    if (progress && body.classList.contains('is-post')) {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${available > 0 ? Math.min(100, y / available * 100) : 0}%`;
    }
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const articleBody = document.querySelector('[data-article-body]');
  if (articleBody) {
    const text = articleBody.textContent.trim();
    const latinWords = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
    const cjkChars = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    const minutes = Math.max(1, Math.ceil(latinWords / 220 + cjkChars / 450));
    const readingTime = document.querySelector('[data-reading-time]');
    if (readingTime) readingTime.textContent = `${minutes} min read`;
  }

  document.querySelectorAll('.prose .highlight, .prose > pre').forEach((block) => {
    if (block.querySelector(':scope > .copy-code')) return;
    const source = block.classList.contains('highlight')
      ? block.querySelector('.code pre')
      : block;
    if (!source) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'COPY';
    button.setAttribute('aria-label', 'Copy code');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(source.textContent);
        button.textContent = 'COPIED';
      } catch (_) {
        button.textContent = 'FAILED';
      }
      window.setTimeout(() => { button.textContent = 'COPY'; }, 1500);
    });
    block.prepend(button);
  });

  const tocLinks = [...document.querySelectorAll('.article-toc .toc-link')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const linkById = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    const headings = [...document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => link.classList.remove('is-active'));
        linkById.get(entry.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-18% 0px -72% 0px' });
    headings.forEach((heading) => observer.observe(heading));
  }

  const dialog = document.querySelector('.search-dialog');
  const searchInput = document.querySelector('#site-search-input');
  const searchResults = document.querySelector('.search-results');
  let searchIndex = null;

  const escapeHTML = (value) => value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const openSearch = async () => {
    if (!dialog) return;
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    body.classList.add('has-dialog');
    window.setTimeout(() => searchInput?.focus(), 50);
    if (searchIndex !== null) return;
    try {
      const response = await fetch(dialog.dataset.searchPath);
      if (!response.ok) throw new Error('Search index unavailable');
      const xml = new DOMParser().parseFromString(await response.text(), 'text/xml');
      searchIndex = [...xml.querySelectorAll('entry')].map((entry) => ({
        title: entry.querySelector('title')?.textContent.trim() || 'Untitled',
        content: entry.querySelector('content')?.textContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '',
        url: entry.querySelector('url')?.textContent.trim() || '#'
      }));
    } catch (_) {
      searchIndex = [];
      searchResults.innerHTML = '<div class="search-empty">Search index could not be loaded.</div>';
    }
  };

  const closeSearch = () => {
    if (!dialog) return;
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    body.classList.remove('has-dialog');
  };

  const renderSearch = (query) => {
    if (!searchResults || !searchIndex) return;
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      searchResults.innerHTML = '<div class="search-empty">Type to search across all posts.</div>';
      return;
    }
    const matches = searchIndex.filter((item) => {
      const haystack = `${item.title} ${item.content}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 12);
    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-empty">No matching posts. Try another phrase.</div>';
      return;
    }
    searchResults.innerHTML = matches.map((item) => {
      const lower = item.content.toLowerCase();
      const first = terms.reduce((best, term) => {
        const index = lower.indexOf(term);
        return index >= 0 && (best < 0 || index < best) ? index : best;
      }, -1);
      const start = Math.max(0, first - 40);
      const excerpt = item.content.slice(start, start + 150);
      return `<a class="search-result" href="${escapeHTML(item.url)}"><strong>${escapeHTML(item.title)}</strong><p>${start ? '…' : ''}${escapeHTML(excerpt)}${excerpt.length === 150 ? '…' : ''}</p></a>`;
    }).join('');
  };

  document.querySelector('.search-trigger')?.addEventListener('click', openSearch);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeSearch(); });
  searchInput?.addEventListener('input', (event) => renderSearch(event.target.value));
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape') {
      closeSearch();
      closeMenu();
    }
  });
})();
