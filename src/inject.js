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

    // Model Quota Circular Widget & Details Popover
    try {
      updateModelQuotaWidget();
    } catch (e) {}
  }

  // --- Model Quota Widget Implementation ---
  let cachedUserStatus = null;
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
      const res = await fetch('/exa.language_server_pb.LanguageServerService/GetUserStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-codeium-csrf-token': csrf
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        cachedUserStatus = data;
        lastFetchTime = Date.now();
        renderModelQuotaWidget();
      }
    } catch (err) {
    } finally {
      isFetchingStatus = false;
    }
  }

  function getActiveModelAndQuota() {
    if (!cachedUserStatus) return null;
    const configs = cachedUserStatus.userStatus?.cascadeModelConfigData?.clientModelConfigs || [];
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

    return {
      activeModel,
      allConfigs: configs,
      triggerLabel: triggerRaw.trim()
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
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0) {
        return 'يتجدد بعد ' + hours + ' س و ' + mins + ' د';
      }
      return 'يتجدد بعد ' + mins + ' د';
    } catch (e) {
      return '';
    }
  }

  function renderModelQuotaWidget() {
    try {
      const micBtn = document.querySelector('button[aria-label="Record voice memo"]');
      if (!micBtn || !micBtn.parentElement) return;

      const info = getActiveModelAndQuota();
      let widget = document.getElementById('antigravity-model-quota-widget');

      if (!widget) {
        widget = document.createElement('div');
        widget.id = 'antigravity-model-quota-widget';
        widget.style.cssText = 'position:relative;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;margin-right:2px;z-index:40;';
        
        // Hover popover trigger
        let hideTimeout = null;
        widget.addEventListener('mouseenter', () => {
          if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
          showQuotaPopover();
        });
        widget.addEventListener('mouseleave', () => {
          hideTimeout = setTimeout(() => {
            hideQuotaPopover();
          }, 250);
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

      const circumference = 59.7;
      const strokeDash = (circumference * (pct / 100)).toFixed(1);

      widget.innerHTML = \`
        <div style="position:relative;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background-color 0.15s ease;" class="hover:bg-secondary" title="\${displayLabel} (\${pct}% متبقي) - انقر للتحديث">
          <svg width="24" height="24" viewBox="0 0 24 24" style="transform:rotate(-90deg);">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.18"/>
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="\${strokeColor}" stroke-width="2.2" stroke-linecap="round"
                    stroke-dasharray="\${strokeDash} \${circumference}" style="transition:stroke-dasharray 0.4s ease, stroke 0.4s ease;"/>
          </svg>
          <span style="position:absolute;font-size:8.5px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;color:currentColor;letter-spacing:-0.5px;">\${pct}%</span>
        </div>
      \`;

      // Update open popover content if visible
      const popover = document.getElementById('antigravity-quota-popover');
      if (popover && popover.style.display !== 'none') {
        fillPopoverContent(popover);
      }
    } catch (e) {}
  }

  function showQuotaPopover() {
    let popover = document.getElementById('antigravity-quota-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'antigravity-quota-popover';
      popover.setAttribute('dir', 'rtl');
      popover.style.cssText = [
        'position: fixed',
        'bottom: 85px',
        'right: 20px',
        'width: 320px',
        'max-width: calc(100vw - 40px)',
        'max-height: 480px',
        'background: var(--card, #1e1e2e)',
        'color: var(--foreground, #cdd6f4)',
        'border: 1px solid var(--border, rgba(255,255,255,0.12))',
        'border-radius: 12px',
        'box-shadow: 0 12px 36px rgba(0,0,0,0.45)',
        'padding: 12px',
        'font-family: system-ui, -apple-system, sans-serif',
        'font-size: 12px',
        'z-index: 99999',
        'display: flex',
        'flex-direction: column',
        'gap: 10px',
        'backdrop-filter: blur(16px)',
        'overflow: hidden'
      ].join(';');

      popover.addEventListener('mouseenter', () => {
        popover.setAttribute('data-hovered', 'true');
      });
      popover.addEventListener('mouseleave', () => {
        popover.removeAttribute('data-hovered');
        setTimeout(() => {
          if (!popover.getAttribute('data-hovered')) {
            popover.style.display = 'none';
          }
        }, 200);
      });

      document.body.appendChild(popover);
    }

    // Align popover relative to widget
    const widget = document.getElementById('antigravity-model-quota-widget');
    if (widget) {
      const rect = widget.getBoundingClientRect();
      popover.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
      // Align near widget horizontally
      const rightCoord = Math.max(16, window.innerWidth - rect.right - 20);
      popover.style.right = rightCoord + 'px';
    }

    fillPopoverContent(popover);
    popover.style.display = 'flex';
  }

  function hideQuotaPopover() {
    const popover = document.getElementById('antigravity-quota-popover');
    if (popover && !popover.getAttribute('data-hovered')) {
      popover.style.display = 'none';
    }
  }

  function fillPopoverContent(popover) {
    const info = getActiveModelAndQuota();
    if (!info) {
      popover.innerHTML = '<div style="padding:10px;text-align:center;">جاري جلب بيانات الاستخدام والمودلات...</div>';
      return;
    }

    const { activeModel, allConfigs } = info;
    const activeLabel = activeModel ? activeModel.label : info.triggerLabel;
    const activeFraction = activeModel?.quotaInfo?.remainingFraction ?? 1;
    const activePct = Math.round(activeFraction * 100);
    const activeReset = formatTimeRemaining(activeModel?.quotaInfo?.resetTime);

    let activeColor = activePct > 60 ? '#10b981' : (activePct > 25 ? '#f59e0b' : '#ef4444');

    let html = \`
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border, rgba(255,255,255,0.08));padding-bottom:8px;">
        <div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;">
          <span>⚡ حصة النماذج (Model Quotas)</span>
        </div>
        <button id="antigravity-refresh-quota-btn" style="background:transparent;border:none;cursor:pointer;color:currentColor;opacity:0.75;display:flex;align-items:center;padding:4px;border-radius:4px;font-size:11px;gap:4px;" title="تحديث الحصة الآن">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          <span>تحديث</span>
        </button>
      </div>

      <!-- Active Model Card -->
      <div style="background:var(--secondary, rgba(255,255,255,0.06));border-radius:8px;padding:9px;border:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:11px;opacity:0.7;margin-bottom:2px;">المودل المحدد حالياً:</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-weight:700;font-size:12.5px;color:var(--foreground, currentColor);">\${activeLabel}</span>
          <span style="font-weight:700;color:\${activeColor};">\${activePct}%</span>
        </div>
        <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin-bottom:4px;">
          <div style="width:\${activePct}%;height:100%;background:\${activeColor};border-radius:3px;transition:width 0.3s ease;"></div>
        </div>
        \${activeReset ? \`<div style="font-size:10.5px;opacity:0.65;display:flex;align-items:center;gap:4px;">⏱️ \${activeReset}</div>\` : ''}
      </div>

      <!-- Other Models List -->
      <div style="font-size:11px;font-weight:700;opacity:0.8;margin-top:2px;">بقية المودلات المتاحة:</div>
      <div style="display:flex;flex-direction:column;gap:5px;overflow-y:auto;max-height:220px;padding-left:2px;padding-right:2px;">
    \`;

    // Render other models
    const others = allConfigs.filter(c => c !== activeModel);
    others.forEach(m => {
      const f = m.quotaInfo?.remainingFraction ?? 1;
      const p = Math.round(f * 100);
      const col = p > 60 ? '#10b981' : (p > 25 ? '#f59e0b' : '#ef4444');
      const reset = formatTimeRemaining(m.quotaInfo?.resetTime);

      html += \`
        <div style="display:flex;flex-direction:column;gap:2px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11.5px;font-weight:500;">\${m.label}</span>
            <span style="font-weight:700;font-size:11px;color:\${col};">\${p}%</span>
          </div>
          <div style="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;">
            <div style="width:\${p}%;height:100%;background:\${col};border-radius:2px;"></div>
          </div>
          \${reset ? \`<div style="font-size:9.5px;opacity:0.55;">\${reset}</div>\` : ''}
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

  // 4. Persistent Mutation Observer
  if (window.__antigravity_rtl_observer) {
    window.__antigravity_rtl_observer.disconnect();
  }
  window.__antigravity_rtl_observer = new MutationObserver(function() {
    fixAllArabic();
  });
  window.__antigravity_rtl_observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    characterData: true 
  });

  // 5. Fast Periodic Backup Timer (guarantees continuous application)
  if (window.__antigravity_rtl_interval) {
    clearInterval(window.__antigravity_rtl_interval);
  }
  window.__antigravity_rtl_interval = setInterval(fixAllArabic, 300);

  return 'SUCCESS';
})();
`;

module.exports = { INJECT_CODE };
