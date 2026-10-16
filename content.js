// Copyright © 2026-2030 anshaer.com. All rights reserved.

const PRESET_PATTERNS = {
  cyrillic: '[\\p{Script=Cyrillic}]',
  math: '[\\u{1D400}-\\u{1D7FF}]',
  nonascii: '[^\\x00-\\x7F]'
};

let currentSettings = {
  enabled: false,
  modes: {}
};

let observer = null;

function init() {
  chrome.storage.sync.get({
    enabled: false,
    modes: {}
  }, (items) => {
    applyConfig(items);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      chrome.storage.sync.get({
        enabled: false,
        modes: {}
      }, (items) => {
        applyConfig(items);
      });
    }
  });
}

function applyConfig(items) {
  stopObserver();
  removeHighlights();

  currentSettings = items;

  if (currentSettings.enabled) {
    highlightAllModes(document.body);
    startObserver();
  }
}

function removeHighlights(rootNode = document.body) {
  const highlights = rootNode.querySelectorAll('.highlight-char');
  highlights.forEach(span => {
    const parent = span.parentNode;
    if (!parent) return;
    const textNode = document.createTextNode(span.textContent);
    parent.replaceChild(textNode, span);
    parent.normalize();
  });
}

function highlightAllModes(rootNode) {
  if (!currentSettings.enabled) return;

  const activeRules = [];
  const modes = currentSettings.modes || {};

  Object.keys(PRESET_PATTERNS).forEach(key => {
    if (modes[key]?.enabled) {
      activeRules.push({ pattern: PRESET_PATTERNS[key], bg: modes[key].bg, text: modes[key].text });
    }
  });

  if (modes.custom?.enabled && modes.custom.pattern) {
    activeRules.push({ pattern: modes.custom.pattern, bg: modes.custom.bg, text: modes.custom.text });
  }

  if (activeRules.length === 0) return;

  activeRules.forEach(rule => {
    highlightSingleRule(rootNode, rule);
  });
}

function highlightSingleRule(rootNode, rule) {
  let regex;
  try {
    regex = new RegExp(rule.pattern, 'gu');
  } catch (e) {
    console.error('[異樣字元高亮] 不合法的 Regex:', rule.pattern, e);
    return;
  }

  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'textarea', 'input', 'noscript'].includes(tag) || parent.classList.contains('highlight-char')) {
          return NodeFilter.FILTER_REJECT;
        }

        regex.lastIndex = 0;
        return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  if (observer) observer.disconnect();

  textNodes.forEach(node => {
    const parent = node.parentNode;
    if (!parent) return;

    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    regex.lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }

      const span = document.createElement('span');
      span.className = 'highlight-char';
      span.style.backgroundColor = rule.bg;
      span.style.color = rule.text;
      span.style.padding = '0 2px';
      span.style.borderRadius = '2px';
      span.style.fontWeight = 'bold';
      span.style.display = 'inline';
      span.title = `異字元: ${match[0]} (U+${match[0].codePointAt(0).toString(16).toUpperCase()})`;
      span.textContent = match[0];

      fragment.appendChild(span);
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    parent.replaceChild(fragment, node);
  });

  if (currentSettings.enabled && observer) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    let hasNewElements = false;
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains('highlight-char')) {
          hasNewElements = true;
        }
      });
    });

    if (hasNewElements) {
      highlightAllModes(document.body);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

init();
