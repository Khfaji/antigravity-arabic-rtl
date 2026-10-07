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
    '/* Lexical Chat Input paragraphs: support independent auto direction per line */',
    'div[data-lexical-editor="true"] p,',
    'div[contenteditable="true"] p {',
    '  text-align: start !important;',
    '  unicode-bidi: normal !important;',
    '}',
    'div[data-lexical-editor="true"] p[dir="rtl"],',
    'div[contenteditable="true"] p[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    'div[data-lexical-editor="true"] p[dir="ltr"],',
    'div[contenteditable="true"] p[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '}',

    '/* Code blocks and Monaco editor must ALWAYS stay LTR */',
    'pre, code, .code-block, .monaco-editor, [class*="shiki"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '  unicode-bidi: embed !important;',
    '}',

    '/* Individual Block Elements in AI responses & Chat */',
    'p[dir="rtl"], li[dir="rtl"], h1[dir="rtl"], h2[dir="rtl"], h3[dir="rtl"], h4[dir="rtl"], blockquote[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    'p[dir="ltr"], li[dir="ltr"], h1[dir="ltr"], h2[dir="ltr"], h3[dir="ltr"], h4[dir="ltr"], blockquote[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '}',

    '/* Mixed-language multi-line text (User sent message, queued message, chat steps) */',
    '.whitespace-pre-wrap {',
    '  unicode-bidi: plaintext !important;',
    '  text-align: start !important;',
    '}',

    '/* User card container alignment to right when message contains Arabic */',
    '.user-card-rtl {',
    '  margin-left: auto !important;',
    '  margin-right: 0 !important;',
    '  align-self: flex-end !important;',
    '}'
  ].join('\\n');

  // 2. Smart BiDi Input Handler: manages EACH PARAGRAPH INDEPENDENTLY!
  function updateEditorParagraphs(editor) {
    if (!editor) return;
    // Don't force dir on the editor root - allow each child <p> to have its own direction!
    editor.removeAttribute('dir');
    editor.style.direction = '';
    editor.style.textAlign = '';

    const paragraphs = editor.querySelectorAll('p');
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const text = p.innerText || p.textContent || '';
      if (/[\\u0600-\\u06FF]/.test(text)) {
        p.setAttribute('dir', 'rtl');
      } else if (text.trim().length > 0) {
        p.setAttribute('dir', 'ltr');
      } else {
        // Empty paragraph: default to auto so it flows with the next typed character
        p.setAttribute('dir', 'auto');
      }
    }
  }

  window.__smart_bidi_input_handler = function(e) {
    const target = e.target;
    if (!target) return;
    const editor = target.closest ? target.closest('[data-lexical-editor="true"], div[contenteditable="true"]') : null;
    if (editor) {
      updateEditorParagraphs(editor);
    } else if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const text = target.value || '';
      if (/[\\u0600-\\u06FF]/.test(text)) {
        target.setAttribute('dir', 'rtl');
        target.style.setProperty('direction', 'rtl', 'important');
        target.style.setProperty('text-align', 'right', 'important');
      } else if (text.trim().length > 0) {
        target.setAttribute('dir', 'ltr');
        target.style.setProperty('direction', 'ltr', 'important');
        target.style.setProperty('text-align', 'left', 'important');
      } else {
        target.removeAttribute('dir');
        target.style.direction = '';
        target.style.textAlign = '';
      }
    }
  };
  document.removeEventListener('input', window.__smart_bidi_input_handler, true);
  document.removeEventListener('keyup', window.__smart_bidi_input_handler, true);
  document.addEventListener('input', window.__smart_bidi_input_handler, true);
  document.addEventListener('keyup', window.__smart_bidi_input_handler, true);

  // 3. Scan & align all blocks, user messages, and queued bubbles
  function fixAllArabic(root) {
    try {
      const targetRoot = (root && root.body) ? root.body : ((root && root.nodeType === 1) ? root : document.body);
      if (!targetRoot) return;

      // Ensure active input editor paragraphs are clean
      const editors = targetRoot.querySelectorAll ? targetRoot.querySelectorAll('[data-lexical-editor="true"]') : [];
      for (let i = 0; i < editors.length; i++) {
        updateEditorParagraphs(editors[i]);
      }

      // Format individual block elements (paragraphs, list items, headings)
      const blockElements = targetRoot.querySelectorAll 
        ? targetRoot.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th')
        : [];
      
      for (let i = 0; i < blockElements.length; i++) {
        const el = blockElements[i];
        if (el.closest('pre, code, .code-block, .monaco-editor, [data-lexical-editor="true"]')) continue;
        const text = el.innerText || el.textContent || '';
        if (/[\\u0600-\\u06FF]/.test(text)) {
          el.setAttribute('dir', 'rtl');
        } else if (/[A-Za-z]/.test(text)) {
          el.setAttribute('dir', 'ltr');
        }
      }

      // Multi-line pre-wrap messages (user messages, chat steps)
      const preWraps = targetRoot.querySelectorAll ? targetRoot.querySelectorAll('.whitespace-pre-wrap') : [];
      for (let i = 0; i < preWraps.length; i++) {
        const el = preWraps[i];
        if (el.closest('pre, code, .code-block, .monaco-editor, [data-lexical-editor="true"]')) continue;
        
        // Use unicode-bidi: plaintext on pre-wrap containers
        el.style.setProperty('unicode-bidi', 'plaintext', 'important');
        el.style.setProperty('text-align', 'start', 'important');
        el.removeAttribute('dir');
        el.style.direction = '';

        const text = el.innerText || el.textContent || '';
        if (/[\\u0600-\\u06FF]/.test(text)) {
          const userStep = el.closest('[data-testid="user-input-step"], .group\\\\/user-input-step');
          if (userStep) {
            const cardBorder = userStep.querySelector('[class*="bg-card-border"]');
            if (cardBorder) cardBorder.classList.add('user-card-rtl');
          }
        }
      }

      // Queued message bubbles
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
