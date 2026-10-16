// Copyright © 2026-2030 anshaer.com. All rights reserved.
// Version: v1.1

const SCRIPT_DETECTORS = [
  { name: '西里爾字母（偽造英文）', regex: /\p{Script=Cyrillic}/u },
  { name: '特殊數學符號 / 花體字', regex: /[\u{1D400}-\u{1D7FF}]/u },
  { name: '非 ASCII 字元（全形/特殊標點）', regex: /[\uFF00-\uFFEF]/u }
];

const KEYS = ['cyrillic', 'math', 'nonascii'];

const DEFAULT_SETTINGS = {
  enabled: false,
  modes: {
    cyrillic: { enabled: true, bg: '#ff2a5f', text: '#ffffff' },
    math: { enabled: false, bg: '#2563eb', text: '#ffffff' },
    nonascii: { enabled: false, bg: '#10b981', text: '#ffffff' },
    custom: { enabled: false, pattern: '', bg: '#f59e0b', text: '#ffffff' }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const urlInspectorInput = document.getElementById('urlInspectorInput');
  const inspectorResult = document.getElementById('inspectorResult');
  const statusText = document.getElementById('statusText');
  const toggleScanBtn = document.getElementById('toggleScanBtn');
  const saveBtn = document.getElementById('saveBtn');

  let currentEnabled = false;

  urlInspectorInput.addEventListener('input', (e) => {
    inspectText(e.target.value.trim());
  });

  function inspectText(text) {
    if (!text) {
      inspectorResult.innerHTML = '等待貼上內容檢測...';
      return;
    }

    const foundChars = [];
    
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code >= 32 && code <= 126) continue;

      let matchedScript = '非標準 ASCII / 特殊字元';
      for (const detector of SCRIPT_DETECTORS) {
        if (detector.regex.test(char)) {
          matchedScript = detector.name;
          break;
        }
      }

      foundChars.push({
        char,
        hex: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
        script: matchedScript
      });
    }

    if (foundChars.length === 0) {
      inspectorResult.innerHTML = `<span class="badge-safe">✓ 安全</span>：未發現異常 Unicode 字元。`;
    } else {
      let html = `<span class="badge-danger">⚠️ 警告：發現 ${foundChars.length} 個異樣字元！</span><br/>`;
      
      try {
        const urlObj = new URL(text.startsWith('http') ? text : `http://${text}`);
        html += `<strong style="color:#6b7280;">還原真實域名:</strong> ${urlObj.hostname}<br/>`;
      } catch (e) {}

      html += `<strong>可疑字元明細:</strong><br/>`;
      foundChars.forEach(item => {
        html += `• 字元 <b style="color:#ef4444; background:#fecdd3; padding:0 2px;">${item.char}</b> (${item.hex}) - ${item.script}<br/>`;
      });

      inspectorResult.innerHTML = html;
    }
  }

  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    currentEnabled = settings.enabled;
    updateScanUI(currentEnabled);

    const m = settings.modes || DEFAULT_SETTINGS.modes;
    KEYS.forEach(key => setModeUI(key, m[key]));

    document.getElementById('m_custom_enable').checked = m.custom?.enabled || false;
    document.getElementById('m_custom_pattern').value = m.custom?.pattern || '';
    document.getElementById('m_custom_bg').value = m.custom?.bg || '#f59e0b';
    document.getElementById('m_custom_text').value = m.custom?.text || '#ffffff';
  });

  function setModeUI(key, modeObj) {
    if (!modeObj) return;
    const chk = document.getElementById(`m_${key}_enable`);
    const bg = document.getElementById(`m_${key}_bg`);
    const txt = document.getElementById(`m_${key}_text`);
    if (chk) chk.checked = modeObj.enabled;
    if (bg) bg.value = modeObj.bg;
    if (txt) txt.value = modeObj.text;
  }

  function getModeData(key) {
    return {
      enabled: document.getElementById(`m_${key}_enable`).checked,
      bg: document.getElementById(`m_${key}_bg`).value,
      text: document.getElementById(`m_${key}_text`).value
    };
  }

  toggleScanBtn.addEventListener('click', () => {
    currentEnabled = !currentEnabled;
    updateScanUI(currentEnabled);
    saveAllSettings();
  });

  saveBtn.addEventListener('click', () => {
    saveAllSettings();
    saveBtn.textContent = '設定已套用！';
    setTimeout(() => { saveBtn.textContent = '儲存規則設定'; }, 1200);
  });

  function updateScanUI(enabled) {
    if (enabled) {
      statusText.textContent = '網頁自動掃描：掃描中';
      statusText.className = 'status-text status-running';
      toggleScanBtn.textContent = '停止掃描網頁';
      toggleScanBtn.className = 'btn-stop';
    } else {
      statusText.textContent = '網頁自動掃描：已停止';
      statusText.className = 'status-text status-stopped';
      toggleScanBtn.textContent = '開始掃描當前網頁';
      toggleScanBtn.className = 'btn-start';
    }
  }

  function saveAllSettings() {
    const modesData = {};
    KEYS.forEach(key => {
      modesData[key] = getModeData(key);
    });

    modesData.custom = {
      enabled: document.getElementById('m_custom_enable').checked,
      pattern: document.getElementById('m_custom_pattern').value,
      bg: document.getElementById('m_custom_bg').value,
      text: document.getElementById('m_custom_text').value
    };

    const newSettings = {
      enabled: currentEnabled,
      modes: modesData
    };

    chrome.storage.sync.set(newSettings);
  }
});
