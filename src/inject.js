const INJECT_CODE = `
(function() {
  // 1. Global BiDi Stylesheet
  let style = document.getElementById('antigravity-global-rtl');
  if (!style) {
    style = document.createElement('style');
    style.id = 'antigravity-global-rtl';
    document.head.appendChild(style);
  }
  style.textContent = [
    '/* Lexical Chat Input: keep unicode-bidi normal to prevent space cursor jump */',
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
    '/* Code blocks must ALWAYS stay LTR */',
    'pre, code, .code-block, .monaco-editor, [class*="shiki"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '  unicode-bidi: embed !important;',
    '}',
    '/* Paragraphs and list items: per-paragraph direction */',
    'p[dir="rtl"], li[dir="rtl"], h1[dir="rtl"], h2[dir="rtl"], h3[dir="rtl"], h4[dir="rtl"], blockquote[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    'p[dir="ltr"], li[dir="ltr"], h1[dir="ltr"], h2[dir="ltr"], h3[dir="ltr"], h4[dir="ltr"], blockquote[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '}',
    '/* Multi-line messages with mixed language (Arabic line & English line) */',
    '.whitespace-pre-wrap {',
    '  unicode-bidi: plaintext !important;',
    '  text-align: start !important;',
    '}',
    '/* User message cards alignment */',
    '.user-card-rtl {',
    '  margin-left: auto !important;',
    '  margin-right: 0 !important;',
    '  align-self: flex-end !important;',
    '}'
  ].join('\\n');

  // 2. Smart BiDi Input Handler for Chat input
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

  // 3. Granular Paragraph & Line BiDi Styler
  function fixAllArabic(root) {
    try {
      const targetRoot = (root && root.body) ? root.body : ((root && root.nodeType === 1) ? root : document.body);
      if (!targetRoot) return;

      // Style paragraphs, headings, list items, and table cells individually
      const blockElements = targetRoot.querySelectorAll 
        ? targetRoot.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th')
        : [];
      
      for (let i = 0; i < blockElements.length; i++) {
        const el = blockElements[i];
        if (el.closest('pre, code, .code-block, .monaco-editor')) continue;
        const text = el.innerText || el.textContent || '';
        // If block has Arabic, set dir="rtl", else if it has Latin, set dir="ltr"
        if (/[\\u0600-\\u06FF]/.test(text)) {
          el.setAttribute('dir', 'rtl');
        } else if (/[A-Za-z]/.test(text)) {
          el.setAttribute('dir', 'ltr');
        }
      }

      // Check pre-wrap containers (user input steps, prompt text)
      const preWraps = targetRoot.querySelectorAll ? targetRoot.querySelectorAll('.whitespace-pre-wrap') : [];
      for (let i = 0; i < preWraps.length; i++) {
        const el = preWraps[i];
        if (el.closest('pre, code, .code-block, .monaco-editor')) continue;
        // Always enable plaintext on pre-wrap so line 1 Arabic goes right and line 2 English goes left!
        el.style.setProperty('unicode-bidi', 'plaintext', 'important');
        el.style.setProperty('text-align', 'start', 'important');
        
        // Remove forced direction: rtl on the entire container so it doesn't force English lines to the right
        el.removeAttribute('dir');
        el.style.direction = '';

        // If it contains Arabic, align user card to right
        const text = el.innerText || el.textContent || '';
        if (/[\\u0600-\\u06FF]/.test(text)) {
          const userStep = el.closest('[data-testid="user-input-step"], .group\\\\/user-input-step');
          if (userStep) {
            const cardBorder = userStep.querySelector('[class*="bg-card-border"]');
            if (cardBorder) cardBorder.classList.add('user-card-rtl');
          }
        }
      }

      // Queued messages
      const queuedElements = targetRoot.querySelectorAll 
        ? targetRoot.querySelectorAll('.flex.flex-col.gap-2.w-full.mb-2 > div, [class*="queued"]')
        : [];
      for (let i = 0; i < queuedElements.length; i++) {
        const q = queuedElements[i];
        q.style.setProperty('unicode-bidi', 'plaintext', 'important');
        q.style.setProperty('text-align', 'start', 'important');
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
