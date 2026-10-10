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
    /* Lexical Chat Input: paragraphs support independent auto direction per line */
    'div[data-lexical-editor="true"] p,',
    'div[contenteditable="true"] p {',
    '  text-align: start !important;',
    '  unicode-bidi: normal !important;',
    '}',
    'div[data-lexical-editor="true"] p[dir="rtl"],',
    'div[contenteditable="true"] p[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '  unicode-bidi: normal !important;',
    '}',
    'div[data-lexical-editor="true"] p[dir="ltr"],',
    'div[contenteditable="true"] p[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '  unicode-bidi: normal !important;',
    '}',
    'div[data-lexical-editor="true"][dir="rtl"],',
    'div[contenteditable="true"][dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    'div[data-lexical-editor="true"][dir="ltr"],',
    'div[contenteditable="true"][dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '}',

    /* Code blocks and Monaco editor must ALWAYS stay LTR */
    'pre, code, .code-block, .monaco-editor, [class*="shiki"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '  unicode-bidi: embed !important;',
    '}',

    /* Individual Block Elements in AI responses & Chat */
    'p[dir="rtl"], li[dir="rtl"], h1[dir="rtl"], h2[dir="rtl"], h3[dir="rtl"], h4[dir="rtl"], blockquote[dir="rtl"] {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '}',
    'p[dir="ltr"], li[dir="ltr"], h1[dir="ltr"], h2[dir="ltr"], h3[dir="ltr"], h4[dir="ltr"], blockquote[dir="ltr"] {',
    '  direction: ltr !important;',
    '  text-align: left !important;',
    '}',

    /* User sent messages and chat steps: true independent line-by-line BiDi */
    '.whitespace-pre-wrap {',
    '  direction: ltr !important;',
    '  text-align: start !important;',
    '  unicode-bidi: plaintext !important;',
    '}',

    /* Queued message RTL row styling */
    '.antigravity-queued-row-rtl {',
    '  direction: rtl !important;',
    '}',
    '.antigravity-queued-row-rtl .line-clamp-2 {',
    '  direction: rtl !important;',
    '  text-align: right !important;',
    '  width: 100% !important;',
    '}',
    '.antigravity-queued-row-rtl .flex-1 {',
    '  direction: rtl !important;',
    '}',

    /* Decorators for RTL queued row */
    '.antigravity-queued-row-rtl [data-testid="queued-decorators"] {',
    '  direction: rtl !important;',
    '  flex-direction: row-reverse !important;',
    '}',

    /* Flip the send arrow icon horizontally in RTL */
    '.antigravity-queued-row-rtl [data-testid="queued-decorators"] button[aria-label*="Send now"] svg {',
    '  transform: scaleX(-1) !important;',
    '}',

    /* Decorators for LTR (English) queued row: Delete - Edit - Send */
    '.antigravity-queued-row-ltr {',
    '  direction: ltr !important;',
    '}',
    '.antigravity-queued-row-ltr [data-testid="queued-decorators"] {',
    '  direction: ltr !important;',
    '  flex-direction: row-reverse !important;',
    '}'
  ].join('\\n');

  // Helper: check if text predominantly has Arabic vs Latin
  function getPredominantDir(text) {
    if (!text || !text.trim()) return 'auto';
    const arabicCount = (text.match(/[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/g) || []).length;
    const latinCount = (text.match(/[A-Za-z]/g) || []).length;
    if (arabicCount === 0 && latinCount === 0) return 'auto';
    return arabicCount >= latinCount ? 'rtl' : 'ltr';
  }

  // 2. Input Handler: applies predominant direction per paragraph and on editor
  function updateEditorParagraphs(editor) {
    if (!editor) return;
    const paragraphs = editor.querySelectorAll('p');
    let totalArabic = 0;
    let totalLatin = 0;

    if (paragraphs.length > 0) {
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const text = p.innerText || p.textContent || '';
        const aCount = (text.match(/[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/g) || []).length;
        const lCount = (text.match(/[A-Za-z]/g) || []).length;
        totalArabic += aCount;
        totalLatin += lCount;

        if (aCount === 0 && lCount === 0) {
          p.setAttribute('dir', 'auto');
        } else {
          p.setAttribute('dir', aCount >= lCount ? 'rtl' : 'ltr');
        }
      }
    } else {
      const text = editor.innerText || editor.textContent || '';
      totalArabic = (text.match(/[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/g) || []).length;
      totalLatin = (text.match(/[A-Za-z]/g) || []).length;
    }

    if (totalArabic === 0 && totalLatin === 0) {
      editor.removeAttribute('dir');
    } else {
      editor.setAttribute('dir', totalArabic >= totalLatin ? 'rtl' : 'ltr');
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
      const dir = getPredominantDir(text);
      target.setAttribute('dir', dir);
      if (dir === 'rtl') {
        target.style.setProperty('direction', 'rtl', 'important');
        target.style.setProperty('text-align', 'right', 'important');
      } else if (dir === 'ltr') {
        target.style.setProperty('direction', 'ltr', 'important');
        target.style.setProperty('text-align', 'left', 'important');
      } else {
        target.removeAttribute('dir');
        target.style.direction = '';
        target.style.textAlign = '';
      }
    }
  };

  // Helper to extract LexicalEditor instance from DOM element
  function getLexicalEditor(el) {
    if (!el) return null;
    const keys = Object.keys(el);
    const reactKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
    let curr = el[reactKey];
    while (curr) {
      if (curr.memoizedProps && curr.memoizedProps.editor) return curr.memoizedProps.editor;
      if (curr.memoizedProps && curr.memoizedProps.value && curr.memoizedProps.value._editor) return curr.memoizedProps.value._editor;
      curr = curr.return;
    }
    return null;
  }

  // Smart List auto-increment for Lexical Editor on Shift+Enter (or Enter in multi-line)
  window.__antigravity_smart_list_handler = function(e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    const target = e.target;
    if (!target) return;
    const editorEl = target.closest ? target.closest('[data-lexical-editor="true"]') : null;
    if (!editorEl) return;

    // Trigger on Shift+Enter (new line)
    if (!e.shiftKey) return;

    const lex = getLexicalEditor(editorEl);
    if (!lex) return;

    let handled = false;
    try {
      lex.update(() => {
        const root = lex._editorState._nodeMap.get('root');
        if (!root) return;
        const children = root.getChildren ? root.getChildren() : [];
        if (children.length === 0) return;

        // Get the active paragraph (by DOM selection or last child)
        const domSelection = window.getSelection();
        let targetP = null;
        if (domSelection && domSelection.anchorNode) {
          const pEl = domSelection.anchorNode.nodeType === 1 
            ? domSelection.anchorNode.closest('p') 
            : domSelection.anchorNode.parentElement ? domSelection.anchorNode.parentElement.closest('p') : null;
          if (pEl && editorEl.contains(pEl)) {
            const allPs = Array.from(editorEl.querySelectorAll('p'));
            const index = allPs.indexOf(pEl);
            if (index >= 0 && index < children.length) {
              targetP = children[index];
            }
          }
        }
        if (!targetP) targetP = children[children.length - 1];

        const text = targetP.getTextContent ? targetP.getTextContent() : '';
        
        // Flexible regex for numbers (Western 0-9 & Arabic-Indic ٠-٩ with . or - or ))
        const numMatch = text.match(/^([\\s\\u200c\\u200d\\u200e\\u200f]*)([0-9\\u0660-\\u0669]+)([\\.\\-\\)])\\s*(.*)$/);
        const bulletMatch = text.match(/^([\\s\\u200c\\u200d\\u200e\\u200f]*)([-*•])\\s*(.*)$/);

        const ParagraphClass = lex._nodes.get('paragraph').klass;
        const TextClass = lex._nodes.get('text').klass;

        if (numMatch) {
          const indent = numMatch[1];
          const rawNum = numMatch[2];
          const sep = numMatch[3];
          const rest = numMatch[4].trim();

          // If current list item is empty (e.g. user pressed Shift+Enter on "2. "), exit list
          if (rest === '') {
            targetP.clear();
            handled = true;
            return;
          }

          // Check if it's Arabic-Indic digits
          const isArabicDigits = /^[\u0660-\u0669]+$/.test(rawNum);
          const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
          let nextNumStr = '';
          
          if (isArabicDigits) {
            const val = parseInt(rawNum.replace(/[\u0660-\u0669]/g, d => arabicDigits.indexOf(d)), 10) + 1;
            nextNumStr = String(val).replace(/[0-9]/g, d => arabicDigits[parseInt(d, 10)]);
          } else {
            nextNumStr = String(parseInt(rawNum, 10) + 1);
          }

          const nextP = new ParagraphClass();
          const nextT = new TextClass(indent + nextNumStr + sep + ' ');
          nextP.append(nextT);
          targetP.insertAfter(nextP);
          nextT.select();
          handled = true;
          return;
        }

        if (bulletMatch) {
          const indent = bulletMatch[1];
          const rest = bulletMatch[3].trim();

          // If current bullet is empty, exit list
          if (rest === '') {
            targetP.clear();
            handled = true;
            return;
          }

          function normalizeBulletP(pNode) {
            if (!pNode) return;
            const pText = pNode.getTextContent ? pNode.getTextContent() : '';
            const m = pText.match(/^([\\s\\u200c\\u200d\\u200e\\u200f]*)([-*])\\s*(.*)$/);
            if (!m) return;
            const pCh = pNode.getChildren ? pNode.getChildren() : [];
            let done = false;
            for (let i = 0; i < pCh.length; i++) {
              const nd = pCh[i];
              if (nd && nd.getTextContent && nd.spliceText) {
                const ct = nd.getTextContent();
                const idx = ct.indexOf(m[2]);
                if (idx !== -1) {
                  nd.spliceText(idx, 1, '•');
                  done = true;
                  break;
                }
              }
            }
            if (!done && pCh.length > 0 && pCh[0].setTextContent) {
              pCh[0].setTextContent(m[1] + '• ' + m[3]);
              for (let i = 1; i < pCh.length; i++) {
                if (pCh[i].remove) pCh[i].remove();
              }
            }
          }

          // Normalize current target paragraph
          normalizeBulletP(targetP);

          // Also scan and normalize any preceding paragraph that has - or *
          for (let i = 0; i < children.length; i++) {
            normalizeBulletP(children[i]);
          }

          const nextP = new ParagraphClass();
          const nextT = new TextClass(indent + '• ');
          nextP.append(nextT);
          targetP.insertAfter(nextP);
          nextT.select();
          handled = true;
          return;
        }
      });
    } catch (err) {}

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };

  document.removeEventListener('keydown', window.__antigravity_smart_list_handler, true);
  document.addEventListener('keydown', window.__antigravity_smart_list_handler, true);

  // 3. Scan & align all blocks, user messages, and queued bubbles
  function fixAllArabic() {
    try {
      // Keep active input editor aligned based on predominant characters
      const editors = document.querySelectorAll('[data-lexical-editor="true"]');
      for (let i = 0; i < editors.length; i++) {
        updateEditorParagraphs(editors[i]);
      }

      // Format individual block elements (paragraphs, list items, headings)
      const blockElements = document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th');
      for (let i = 0; i < blockElements.length; i++) {
        const el = blockElements[i];
        if (el.closest('pre, code, .code-block, .monaco-editor, [data-lexical-editor="true"]')) continue;
        const text = el.innerText || el.textContent || '';
        const dir = getPredominantDir(text);
        if (dir === 'rtl' || dir === 'ltr') {
          el.setAttribute('dir', dir);
        }
      }

      // Multi-line pre-wrap messages (user messages, chat steps)
      const preWraps = document.querySelectorAll('.whitespace-pre-wrap');
      for (let i = 0; i < preWraps.length; i++) {
        const el = preWraps[i];
        if (el.closest('pre, code, .code-block, .monaco-editor, [data-lexical-editor="true"]')) continue;
        el.style.setProperty('direction', 'ltr', 'important');
        el.style.setProperty('text-align', 'start', 'important');
        el.style.setProperty('unicode-bidi', 'plaintext', 'important');
        el.removeAttribute('dir');
      }

      // Queued message items inside [data-testid="queued-messages-card"]
      const queuedCards = document.querySelectorAll('[data-testid="queued-messages-card"]');
      for (let i = 0; i < queuedCards.length; i++) {
        const card = queuedCards[i];
        const rows = card.querySelectorAll('.line-clamp-2');
        for (let j = 0; j < rows.length; j++) {
          const rowSpan = rows[j];
          const text = rowSpan.textContent || '';
          const dir = getPredominantDir(text);
          const flexTextContainer = rowSpan.parentElement;
          const fullRow = flexTextContainer ? flexTextContainer.parentElement : null;

          if (dir === 'rtl') {
            if (fullRow) {
              fullRow.classList.add('antigravity-queued-row-rtl');
              fullRow.classList.remove('antigravity-queued-row-ltr');
              fullRow.style.setProperty('direction', 'rtl', 'important');
            }
            if (flexTextContainer) {
              flexTextContainer.style.setProperty('direction', 'rtl', 'important');
            }
            rowSpan.style.setProperty('direction', 'rtl', 'important');
            rowSpan.style.setProperty('text-align', 'right', 'important');
            rowSpan.style.width = '100%';
          } else if (dir === 'ltr') {
            if (fullRow) {
              fullRow.classList.remove('antigravity-queued-row-rtl');
              fullRow.classList.add('antigravity-queued-row-ltr');
              fullRow.style.setProperty('direction', 'ltr', 'important');
            }
            if (flexTextContainer) {
              flexTextContainer.style.setProperty('direction', 'ltr', 'important');
            }
            rowSpan.style.setProperty('direction', 'ltr', 'important');
            rowSpan.style.setProperty('text-align', 'left', 'important');
            rowSpan.style.width = '';
          }
        }
      }
    } catch (e) {}
  }

  // --- Model Quota Widget Implementation ---
  let cachedUserStatus = null;
  let cachedQuotaSummary = null;
  try {
    const rawS = localStorage.getItem('__antigravity_cached_user_status');
    if (rawS) cachedUserStatus = JSON.parse(rawS);
    const rawQ = localStorage.getItem('__antigravity_cached_quota_summary');
    if (rawQ) cachedQuotaSummary = JSON.parse(rawQ);
  } catch (e) {}

  let lastFetchTime = 0;
  let isFetchingStatus = false;

  async function fetchUserStatus() {
    if (isFetchingStatus) return;
    const now = Date.now();
    // Throttle fetches: at most once every 10 seconds unless forced
    if (now - lastFetchTime < 10000 && cachedUserStatus) return;
    
    isFetchingStatus = true;
    try {
      const csrf = window.__APP_CONFIG__?.csrfToken || '';
      const headers = {
        'Content-Type': 'application/json',
        'x-codeium-csrf-token': csrf
      };

      // Fetch both user status and quota summary concurrently
      const [resStatus, resSummary] = await Promise.all([
        fetch('/exa.language_server_pb.LanguageServerService/GetUserStatus', {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        }).catch(() => null),
        fetch('/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary', {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        }).catch(() => null)
      ]);

      if (resStatus && resStatus.ok) {
        cachedUserStatus = await resStatus.json();
        try { localStorage.setItem('__antigravity_cached_user_status', JSON.stringify(cachedUserStatus)); } catch (e) {}
      }
      if (resSummary && resSummary.ok) {
        cachedQuotaSummary = await resSummary.json();
        try { localStorage.setItem('__antigravity_cached_quota_summary', JSON.stringify(cachedQuotaSummary)); } catch (e) {}
      }

      lastFetchTime = Date.now();
      renderModelQuotaWidget();
    } catch (err) {
    } finally {
      isFetchingStatus = false;
    }
  }

  function getActiveModelAndQuota() {
    if (!cachedUserStatus) return null;
    const cascade = cachedUserStatus.userStatus?.cascadeModelConfigData || {};
    const configs = cascade.clientModelConfigs || [];
    const sorts = cascade.clientModelSorts || [];
    const trigger = document.querySelector('[data-testid="model-selector-trigger"]');
    const triggerRaw = trigger?.textContent || '';
    const triggerClean = triggerRaw.toLowerCase().replace(/[^a-z0-9]/g, '');

    let activeModel = configs.find(c => {
      const cleanLabel = c.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanLabel === triggerClean || triggerClean.includes(cleanLabel) || cleanLabel.includes(triggerClean);
    });

    if (!activeModel && configs.length > 0) {
      activeModel = configs[0];
    }

    // Determine the official sort order of model labels
    let officialSortLabels = [];
    if (sorts.length > 0 && sorts[0].groups && sorts[0].groups.length > 0) {
      officialSortLabels = sorts[0].groups[0].modelLabels || [];
    }

    // Extract weekly quota details from cachedQuotaSummary
    let geminiWeeklyBucket = null;
    let thirdPartyWeeklyBucket = null;
    const groups = cachedQuotaSummary?.response?.groups || [];
    for (const g of groups) {
      const gName = (g.displayName || '').toLowerCase();
      const buckets = g.buckets || [];
      const weekly = buckets.find(b => b.window === 'weekly' || (b.bucketId && b.bucketId.includes('weekly')));
      if (gName.includes('gemini') && weekly) {
        geminiWeeklyBucket = weekly;
      } else if ((gName.includes('claude') || gName.includes('gpt') || gName.includes('3p')) && weekly) {
        thirdPartyWeeklyBucket = weekly;
      }
    }

    return {
      activeModel,
      allConfigs: configs,
      officialSortLabels,
      triggerLabel: triggerRaw.trim(),
      geminiWeeklyBucket,
      thirdPartyWeeklyBucket
    };
  }

  function formatTimeRemaining(isoDateStr) {
    if (!isoDateStr) return '';
    try {
      const resetTime = new Date(isoDateStr).getTime();
      const now = Date.now();
      const diffMs = resetTime - now;
      if (diffMs <= 0) return 'جاهز للتجديد الآن';
      const diffMins = Math.floor(diffMs / 60000);
      const days = Math.floor(diffMins / 1440);
      const hours = Math.floor((diffMins % 1440) / 60);
      const mins = diffMins % 60;

      if (days > 0) {
        return days + ' يوم و ' + hours + ' س';
      }
      if (hours > 0) {
        return hours + ' س و ' + mins + ' د';
      }
      return mins + ' د';
    } catch (e) {
      return '';
    }
  }

  function renderModelQuotaWidget() {
    try {
      const micBtn = document.querySelector('button[aria-label="Record voice memo"]');
      if (!micBtn || !micBtn.parentElement) return;

      const info = getActiveModelAndQuota();
      // Don't render a dummy widget before userStatus or activeModel is known
      if (!info || !info.activeModel) return;

      let widget = document.getElementById('antigravity-model-quota-widget');

      if (!widget) {
        widget = document.createElement('div');
        widget.id = 'antigravity-model-quota-widget';
        widget.style.cssText = 'position:relative;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;margin-right:2px;z-index:40;';
        
        // Hover popover trigger
        widget.addEventListener('mouseenter', () => {
          showQuotaPopover();
        });
        widget.addEventListener('mouseleave', () => {
          scheduleHideQuotaPopover();
        });

        // Click to refresh immediately
        widget.addEventListener('click', (e) => {
          e.stopPropagation();
          lastFetchTime = 0; // force refresh
          fetchUserStatus();
        });
      }

      if (micBtn.parentElement !== widget.parentElement || widget.nextElementSibling !== micBtn) {
        micBtn.parentElement.insertBefore(widget, micBtn);
      }

      // Calculate percentage and color
      let pct = 100;
      let strokeColor = '#10b981'; // green
      let displayLabel = 'المودل';

      if (info && info.activeModel) {
        displayLabel = info.activeModel.label;
        const fraction = info.activeModel.quotaInfo?.remainingFraction;
        if (typeof fraction === 'number') {
          pct = Math.round(fraction * 100);
        }
      }

      if (pct > 60) {
        strokeColor = '#10b981'; // Green
      } else if (pct > 25) {
        strokeColor = '#f59e0b'; // Amber / Orange
      } else {
        strokeColor = '#ef4444'; // Red
      }

      const circumference = 69.1; // 2 * PI * 11
      const strokeDash = (circumference * (pct / 100)).toFixed(1);

      const stateKey = displayLabel + '_' + pct;
      if (widget.getAttribute('data-state-key') !== stateKey) {
        widget.setAttribute('data-state-key', stateKey);
        widget.innerHTML = \`
          <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background-color 0.15s ease;" class="hover:bg-secondary" title="\${displayLabel} (\${pct}% متبقي) - انقر للتحديث">
            <svg width="28" height="28" viewBox="0 0 28 28" style="transform:rotate(-90deg);">
              <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2.5 2.5" opacity="0.25"/>
              <circle cx="14" cy="14" r="11" fill="none" stroke="\${strokeColor}" stroke-width="1.8"
                      stroke-dasharray="\${strokeDash} \${circumference}" style="stroke-dasharray: 2.5 2; transition:stroke-dasharray 0.4s ease, stroke 0.4s ease;" stroke-linecap="round"/>
              <circle cx="14" cy="14" r="11" fill="none" stroke="\${strokeColor}" stroke-width="1.8" stroke-dasharray="\${strokeDash} \${circumference}" opacity="0.4" style="transition:stroke-dasharray 0.4s ease, stroke 0.4s ease;"/>
            </svg>
            <span style="position:absolute;font-size:11px;font-weight:500;font-family:system-ui,-apple-system,sans-serif;color:currentColor;letter-spacing:0;">\${pct}</span>
          </div>
        \`;
      }

      // Update open popover content if visible
      const popover = document.getElementById('antigravity-quota-popover');
      if (popover && popover.style.display !== 'none') {
        fillPopoverContent(popover);
      }
    } catch (e) {}
  }

  let popoverHideTimer = null;

  function showQuotaPopover() {
    if (popoverHideTimer) {
      clearTimeout(popoverHideTimer);
      popoverHideTimer = null;
    }

    let popover = document.getElementById('antigravity-quota-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'antigravity-quota-popover';
      popover.setAttribute('dir', 'rtl');
      popover.style.cssText = [
        'position: fixed',
        'bottom: 85px',
        'right: 20px',
        'width: 360px',
        'max-width: calc(100vw - 40px)',
        'max-height: 540px',
        'background: var(--card, #1e1e2e)',
        'color: var(--foreground, #cdd6f4)',
        'border: 1px solid var(--border, rgba(255,255,255,0.14))',
        'border-radius: 14px',
        'box-shadow: 0 16px 40px rgba(0,0,0,0.5)',
        'padding: 14px',
        'font-family: system-ui, -apple-system, sans-serif',
        'font-size: 13.5px',
        'z-index: 99999',
        'display: flex',
        'flex-direction: column',
        'gap: 12px',
        'backdrop-filter: blur(20px)',
        'overflow: hidden',
        'pointer-events: auto'
      ].join(';');

      popover.addEventListener('mouseenter', () => {
        if (popoverHideTimer) {
          clearTimeout(popoverHideTimer);
          popoverHideTimer = null;
        }
      });
      popover.addEventListener('mouseleave', () => {
        scheduleHideQuotaPopover();
      });

      document.body.appendChild(popover);
    }

    // Align popover relative to widget
    const widget = document.getElementById('antigravity-model-quota-widget');
    if (widget) {
      const rect = widget.getBoundingClientRect();
      popover.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
      // Align near widget horizontally
      const rightCoord = Math.max(16, window.innerWidth - rect.right - 20);
      popover.style.right = rightCoord + 'px';
    }

    fillPopoverContent(popover);
    popover.style.display = 'flex';
  }

  function scheduleHideQuotaPopover() {
    if (popoverHideTimer) clearTimeout(popoverHideTimer);
    popoverHideTimer = setTimeout(() => {
      const popover = document.getElementById('antigravity-quota-popover');
      if (popover) {
        popover.style.display = 'none';
      }
      popoverHideTimer = null;
    }, 350);
  }

  function cleanModelLabel(raw) {
    if (!raw) return '';
    return raw
      .replace(/\\s*\\((High|Medium|Low)\\)/gi, '')
      .replace(/\\s*\\(\\s*\\)/g, '')
      .trim();
  }

  function fillPopoverContent(popover) {
    const info = getActiveModelAndQuota();
    if (!info) {
      popover.innerHTML = '<div style="padding:14px;text-align:center;font-size:13.5px;">جاري جلب بيانات الاستخدام والمودلات...</div>';
      return;
    }

    const { activeModel, allConfigs, officialSortLabels, geminiWeeklyBucket, thirdPartyWeeklyBucket } = info;
    const activeLabelClean = cleanModelLabel(activeModel ? activeModel.label : info.triggerLabel);
    const activeFraction = activeModel?.quotaInfo?.remainingFraction ?? 1;
    const activePct = Math.round(activeFraction * 100);
    const activeReset = formatTimeRemaining(activeModel?.quotaInfo?.resetTime);

    // Identify if active model belongs to Gemini or 3P
    const isGemini = /gemini/i.test(activeLabelClean);
    const activeWeekly = isGemini ? geminiWeeklyBucket : thirdPartyWeeklyBucket;
    const activeWeeklyPct = activeWeekly ? Math.round((activeWeekly.remainingFraction ?? 1) * 100) : null;
    const activeWeeklyReset = activeWeekly ? formatTimeRemaining(activeWeekly.resetTime) : null;

    let activeColor = activePct > 60 ? '#10b981' : (activePct > 25 ? '#f59e0b' : '#ef4444');

    let html = \`
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border, rgba(255,255,255,0.1));padding-bottom:10px;">
        <div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:14.5px;">
          <span style="font-size:16px;">⚡</span>
          <span>حصة النماذج (Model Quotas)</span>
        </div>
        <button id="antigravity-refresh-quota-btn" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);cursor:pointer;color:currentColor;display:flex;align-items:center;padding:5px 9px;border-radius:6px;font-size:12px;font-weight:600;gap:6px;" title="تحديث الحصة الآن">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          <span>تحديث</span>
        </button>
      </div>

      <!-- Active Model Card -->
      <div style="background:var(--secondary, rgba(255,255,255,0.08));border-radius:10px;padding:12px;border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:12px;opacity:0.75;margin-bottom:4px;font-weight:500;">النموذج المحدد حالياً:</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-weight:700;font-size:14px;color:var(--foreground, currentColor);">\${activeLabelClean}</span>
          <span style="font-weight:800;font-size:14px;color:\${activeColor};">\${activePct}%</span>
        </div>
        <div style="width:100%;height:7px;background:rgba(255,255,255,0.12);border-radius:4px;overflow:hidden;margin-bottom:8px;">
          <div style="width:\${activePct}%;height:100%;background:\${activeColor};border-radius:4px;transition:width 0.3s ease;"></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;font-size:12px;opacity:0.85;">
          \${activeReset ? \`<div style="display:flex;align-items:center;justify-content:space-between;"><span>⏱️ تجديد 5 ساعات:</span><span style="font-weight:700;">\${activeReset}</span></div>\` : ''}
          \${activeWeeklyReset ? \`<div style="display:flex;align-items:center;justify-content:space-between;color:#38bdf8;"><span>📅 التجديد الأسبوعي (\${activeWeeklyPct}%):</span><span style="font-weight:700;">\${activeWeeklyReset}</span></div>\` : ''}
        </div>
      </div>

      <!-- Other Models List (Grouped without Speed Redundancy) -->
      <div style="font-size:12.5px;font-weight:700;opacity:0.85;margin-top:2px;">بقية المودلات:</div>
      <div style="display:flex;flex-direction:column;gap:7px;overflow-y:auto;max-height:230px;padding-left:2px;padding-right:2px;">
    \`;

    // Filter and group models: eliminate repetitive speed duplicates for Gemini
    const seenBaseNames = new Set();
    // Exclude active base name so current model isn't duplicated below
    seenBaseNames.add(activeLabelClean.toLowerCase());

    const groupedConfigs = [];

    // Order according to official sort labels base names
    const orderedBaseNames = [];
    officialSortLabels.forEach(raw => {
      const base = cleanModelLabel(raw);
      if (!orderedBaseNames.includes(base)) {
        orderedBaseNames.push(base);
      }
    });

    allConfigs.forEach(c => {
      if (!c || !c.label) return;
      const base = cleanModelLabel(c.label);
      const baseKey = base.toLowerCase();
      if (seenBaseNames.has(baseKey)) return;

      seenBaseNames.add(baseKey);
      groupedConfigs.push({
        baseLabel: base,
        rawConfig: c
      });
    });

    // Sort by official list base names
    groupedConfigs.sort((a, b) => {
      let idxA = orderedBaseNames.indexOf(a.baseLabel);
      let idxB = orderedBaseNames.indexOf(b.baseLabel);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });

    groupedConfigs.forEach(item => {
      const m = item.rawConfig;
      const f = m.quotaInfo?.remainingFraction ?? 1;
      const p = Math.round(f * 100);
      const col = p > 60 ? '#10b981' : (p > 25 ? '#f59e0b' : '#ef4444');
      const reset = formatTimeRemaining(m.quotaInfo?.resetTime);

      const mIsGemini = /gemini/i.test(item.baseLabel);
      const mWeekly = mIsGemini ? geminiWeeklyBucket : thirdPartyWeeklyBucket;
      const mWeeklyReset = mWeekly ? formatTimeRemaining(mWeekly.resetTime) : null;

      html += \`
        <div style="display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:600;">\${item.baseLabel}</span>
            <span style="font-weight:800;font-size:12.5px;color:\${col};">\${p}%</span>
          </div>
          <div style="width:100%;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
            <div style="width:\${p}%;height:100%;background:\${col};border-radius:3px;"></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;opacity:0.75;margin-top:2px;">
            \${reset ? \`<span>⏱️ 5س: \${reset}</span>\` : '<span></span>'}
            \${mWeeklyReset ? \`<span style="color:#38bdf8;font-weight:600;">📅 أسبوعي: \${mWeeklyReset}</span>\` : ''}
          </div>
        </div>
      \`;
    });

    html += \`
      </div>
    \`;

    popover.innerHTML = html;

    const refreshBtn = popover.querySelector('#antigravity-refresh-quota-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        refreshBtn.innerHTML = '<span>جاري التحديث...</span>';
        lastFetchTime = 0;
        fetchUserStatus();
      });
    }
  }

  function updateModelQuotaWidget() {
    // Check if mic button exists and if we should fetch data
    const micBtn = document.querySelector('button[aria-label="Record voice memo"]');
    if (!micBtn) return;

    if (!cachedUserStatus) {
      fetchUserStatus();
    } else {
      // Background poll every 30s
      if (Date.now() - lastFetchTime > 30000) {
        fetchUserStatus();
      }
    }

    renderModelQuotaWidget();
  }

  // Initial fix
  fixAllArabic();

  // 4. Persistent Mutation Observer (RTL only)
  if (window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer.disconnect();
  }
  window.__antigravity_rtl_observer = new MutationObserver(function(mutations) {
    // Ignore mutations caused by our own quota widget/popover to avoid loops
    let onlyWidget = true;
    for (let i = 0; i < mutations.length; i++) {
      const target = mutations[i].target;
      if (!target || !target.closest || (!target.closest('#antigravity-model-quota-widget') && !target.closest('#antigravity-quota-popover'))) {
        onlyWidget = false;
        break;
      }
    }
    if (!onlyWidget) {
      fixAllArabic();
    }
  });
  window.__antigravity_rtl_observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    characterData: true 
  });

  // 5. Fast Periodic Backup Timer for RTL
  if (window.__antigravity_rtl_interval) {
    clearInterval(window.__antigravity_rtl_interval);
  }
  window.__antigravity_rtl_interval = setInterval(fixAllArabic, 600);

  // 6. Completely Independent Quota Polling Timer (Calm: every 15s, does not trigger RTL loop)
  if (window.__antigravity_quota_interval) {
    clearInterval(window.__antigravity_quota_interval);
  }
  window.__antigravity_quota_interval = setInterval(() => {
    try { updateModelQuotaWidget(); } catch (e) {}
  }, 15000);
  // Initial quota widget render
  setTimeout(() => {
    try { updateModelQuotaWidget(); } catch (e) {}
  }, 500);

  return 'SUCCESS';
})();
`;

module.exports = { INJECT_CODE };
