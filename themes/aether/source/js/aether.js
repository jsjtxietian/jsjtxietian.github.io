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

  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const syncThemeLabel = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle?.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  syncThemeLabel();
  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('aether-theme', root.dataset.theme); } catch (_) {}
    syncThemeLabel();
  });
  // Follow OS changes until the reader picks a theme explicitly.
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', (event) => {
    let saved = null;
    try { saved = localStorage.getItem('aether-theme'); } catch (_) {}
    if (saved) return;
    root.dataset.theme = event.matches ? 'dark' : 'light';
    syncThemeLabel();
  });

  // Return to the list the reader came from (e.g. a filtered archive) instead of always going home.
  const backLink = document.querySelector('.article-back');
  if (backLink && document.referrer) {
    try {
      const from = new URL(document.referrer);
      if (from.origin === location.origin && from.pathname !== location.pathname) {
        backLink.href = from.href;
        if (from.pathname.startsWith('/archives')) backLink.textContent = '← Back to archive';
      }
    } catch (_) {}
  }

  const archivePage = document.querySelector('.archive-page');
  if (archivePage) {
    const selectedTag = new URLSearchParams(window.location.search).get('tag');
    const encodedTag = selectedTag ? encodeURIComponent(selectedTag) : '';
    const rows = [...archivePage.querySelectorAll('.archive-row')];
    let visibleCount = 0;

    rows.forEach((row) => {
      const visible = !encodedTag || row.dataset.tags.split(',').includes(encodedTag);
      row.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    archivePage.querySelectorAll('.archive-year').forEach((year) => {
      year.hidden = !year.querySelector('.archive-row:not([hidden])');
    });
    archivePage.querySelectorAll('[data-archive-tag]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.archiveTag === encodedTag);
    });

    const summary = archivePage.querySelector('[data-archive-summary]');
    if (summary && selectedTag) summary.textContent = `${visibleCount} 篇关于 #${selectedTag} 的文章。`;
    const empty = archivePage.querySelector('.archive-empty');
    if (empty) empty.hidden = visibleCount !== 0;
  }

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
  const searchTrigger = document.querySelector('.search-trigger');
  let searchIndex = null;
  let selectedIndex = -1;
  let lastFocus = null;

  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    const shortcut = searchTrigger?.querySelector('kbd');
    if (shortcut) shortcut.textContent = '⌘K';
  }

  const escapeHTML = (value) => value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Split raw text on the search terms so escaping never cuts through an entity.
  const highlight = (text, pattern) => text.split(pattern)
    .map((part, index) => index % 2 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part))
    .join('');

  const isOpen = () => dialog?.classList.contains('is-open');

  const openSearch = async () => {
    if (!dialog || isOpen()) return;
    lastFocus = document.activeElement;
    closeMenu();
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
      // The reader may have typed while the index was loading.
      if (searchInput?.value) renderSearch(searchInput.value);
    } catch (_) {
      searchIndex = [];
      searchResults.innerHTML = '<div class="search-empty">Search index could not be loaded.</div>';
    }
  };

  const closeSearch = () => {
    if (!isOpen()) return;
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    body.classList.remove('has-dialog');
    (lastFocus || searchTrigger)?.focus?.();
  };

  const selectResult = (index) => {
    const items = [...searchResults.querySelectorAll('.search-result')];
    if (!items.length) return;
    selectedIndex = (index + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle('is-selected', i === selectedIndex));
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  };

  const renderSearch = (query) => {
    if (!searchResults || !searchIndex) return;
    selectedIndex = -1;
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      searchResults.innerHTML = '<div class="search-empty">Type to search across all posts.</div>';
      return;
    }
    const matches = searchIndex.filter((item) => {
      const haystack = `${item.title} ${item.content}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-empty">No matching posts. Try another phrase.</div>';
      return;
    }
    const titleHits = (item) => terms.filter((term) => item.title.toLowerCase().includes(term)).length;
    // Stable sort keeps the index's date order within the same title relevance.
    matches.sort((a, b) => titleHits(b) - titleHits(a));
    const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
    searchResults.innerHTML = matches.slice(0, 12).map((item) => {
      const lower = item.content.toLowerCase();
      const first = terms.reduce((best, term) => {
        const index = lower.indexOf(term);
        return index >= 0 && (best < 0 || index < best) ? index : best;
      }, -1);
      const start = Math.max(0, first - 40);
      const excerpt = item.content.slice(start, start + 150);
      return `<a class="search-result" href="${escapeHTML(item.url)}"><strong>${highlight(item.title, pattern)}</strong><p>${start ? '…' : ''}${highlight(excerpt, pattern)}${start + 150 < item.content.length ? '…' : ''}</p></a>`;
    }).join('');
    if (matches.length > 12) {
      searchResults.insertAdjacentHTML('beforeend', `<div class="search-empty">还有 ${matches.length - 12} 篇匹配，试试更具体的关键词。</div>`);
    }
  };

  searchTrigger?.addEventListener('click', openSearch);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeSearch(); });
  searchInput?.addEventListener('input', (event) => renderSearch(event.target.value));
  searchInput?.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectResult(selectedIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      const target = searchResults.querySelectorAll('.search-result')[Math.max(0, selectedIndex)];
      if (target) window.location.href = target.href;
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (isOpen()) closeSearch(); else openSearch();
    }
    if (event.key === 'Escape') {
      closeSearch();
      closeMenu();
    }
    // Keep Tab inside the open dialog.
    if (event.key === 'Tab' && isOpen()) {
      const focusable = [searchInput, ...searchResults.querySelectorAll('.search-result')].filter(Boolean);
      const index = focusable.indexOf(document.activeElement);
      const next = event.shiftKey
        ? (index <= 0 ? focusable.length - 1 : index - 1)
        : (index === -1 || index === focusable.length - 1 ? 0 : index + 1);
      event.preventDefault();
      focusable[next].focus();
    }
  });
})();
