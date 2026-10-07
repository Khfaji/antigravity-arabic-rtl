const INJECT_CODE = `
(function() {
  // 1. Global RTL Stylesheet
  let style = document.getElementById('antigravity-global-rtl');
  if (!style) {
    style = document.createElement('style');
    style.id = 'antigravity-global-rtl';
    document.head.appendChild(style);
  }
  style.textContent = [
    '/* Editor styling - NO unicode-bidi: plaintext to prevent space cursor jump */',
    'div[contenteditable="true"][dir="rtl"], textarea[dir="rtl"], input[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '  unicode-bidi: normal !important;',
    '}',
    'div[contenteditable="true"][dir="ltr"], textarea[dir="ltr"], input[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '  unicode-bidi: normal !important;',
    '}',
    '/* General RTL text elements */',
    '[dir="rtl"]:not(div[contenteditable="true"]) {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    '.whitespace-pre-wrap[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    '/* User message bubble and Queued message layout */',
    '.user-msg-rtl {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    '.user-card-rtl {',
    '  margin-left: auto !important;',
    '  margin-right: 0 !important;',
    '  align-self: flex-end !important;',
    '}'
  ].join('\\n');

  // 2. Smart BiDi Input Handler
  window.__smart_bidi_input_handler = function(e) {
    const target = e.target;
    if (!target) return;
    if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const text = target.innerText || target.value || target.textContent || '';
      if (/[\\u0600-\\u06FF]/.test(text)) {
        target.setAttribute('dir', 'rtl');
        target.style.setProperty('direction', 'rtl', 'important');
        target.style.setProperty('text-align', 'right', 'important');
        target.style.setProperty('unicode-bidi', 'normal', 'important');
      } else if (text.trim().length > 0) {
        target.setAttribute('dir', 'ltr');
        target.style.setProperty('direction', 'ltr', 'important');
        target.style.setProperty('text-align', 'left', 'important');
        target.style.setProperty('unicode-bidi', 'normal', 'important');
      } else {
        target.removeAttribute('dir');
        target.style.direction = '';
        target.style.textAlign = '';
        target.style.unicodeBidi = '';
      }
    }
  };
  document.removeEventListener('input', window.__smart_bidi_input_handler, true);
  document.removeEventListener('keyup', window.__smart_bidi_input_handler, true);
  document.addEventListener('input', window.__smart_bidi_input_handler, true);
  document.addEventListener('keyup', window.__smart_bidi_input_handler, true);

  // 3. Scan & align all Arabic messages and queued messages
  function fixAllArabic(root) {
    try {
      const targetRoot = (root && root.body) ? root.body : ((root && root.nodeType === 1) ? root : document.body);
      if (!targetRoot) return;

      const walker = document.createTreeWalker(targetRoot, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (/[\\u0600-\\u06FF]/.test(node.nodeValue)) {
          const el = node.parentElement;
          if (el && !el.closest('pre, code')) {
            el.setAttribute('dir', 'rtl');
            el.style.direction = 'rtl';
            el.style.textAlign = 'right';

            // User messages
            const userMsg = el.closest('.whitespace-pre-wrap, [data-testid="user-input-step"], .group\\\\/user-input-step');
            if (userMsg) {
              userMsg.setAttribute('dir', 'rtl');
              userMsg.classList.add('user-msg-rtl');
              const cardBorder = userMsg.querySelector ? userMsg.querySelector('[class*="bg-card-border"]') : null;
              if (cardBorder) {
                cardBorder.classList.add('user-card-rtl');
              }
            }

            // Queued messages
            const queuedCard = el.closest('.flex.flex-col.gap-2.w-full.mb-2 > div, [class*="queued"]');
            if (queuedCard) {
              queuedCard.setAttribute('dir', 'rtl');
              queuedCard.style.direction = 'rtl';
              queuedCard.style.textAlign = 'right';
            }
          }
        }
      }
    } catch (e) {}
  }

  fixAllArabic(document);

  // 4. Persistent Mutation Observer
  if (window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer.disconnect();
  }
  window.__antigravity_rtl_observer = new MutationObserver(function(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const added = mutations[i].addedNodes;
      for (let j = 0; j < added.length; j++) {
        if (added[j].nodeType === 1) fixAllArabic(added[j]);
      }
    }
  });
  window.__antigravity_rtl_observer.observe(document.body, { childList: true, subtree: true });
  return 'SUCCESS';
})();
`;

module.exports = { INJECT_CODE };
