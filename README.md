# 🛡️ 異樣字元與網址檢測器 v1.1 (Chrome Highlighter)

一個基於 **Chrome Manifest V3** 開發的擴充功能，專門用於偵測與標示網頁中的混淆字元、釣魚同形字（Homoglyphs，如用西里爾字母假冒英文）、特殊 Unicode 符號，並提供即時網址 / 連結貼上分析功能。

* **🌐 GitHub Pages 網頁展示版**：[https://anshaer.github.io/chrome_highlighter/](https://anshaer.github.io/chrome_highlighter/)
* **🧪 線上測試頁面**：[https://anshaer.github.io/chrome_highlighter/test.html](https://anshaer.github.io/chrome_highlighter/test.html)
* **📦 擴充功能一鍵下載 (ZIP)**：[點此直接下載 chrome_highlighter.zip](./chrome_highlighter.zip)
* **當前版本**：`v1.1`

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📦 快速下載與解壓縮

如果你不熟悉 GitHub 操作，可以直接點擊下方連結下載預先打包好的擴充功能壓縮檔：

👉 **[點此直接下載 chrome_highlighter.zip (v1.1)](./chrome_highlighter.zip)**

下載後請先將 `chrome_highlighter.zip` **解壓縮至電腦中的任意資料夾**。

---

## 🧩 Chrome 瀏覽器安裝擴充功能步驟

請按照以下步驟將擴充功能載入至 Chrome 瀏覽器：

1. **開啟擴充功能管理頁面**：
   在 Chrome 網址列輸入 `chrome://extensions/` 並按下 Enter（或點擊右上角「三點選單」➔ **擴充功能** ➔ **管理擴充功能**）。
2. **開啟開發者模式**：
   切換頁面右上角 **「開發者模式」（Developer mode）** 的開關至開啟狀態。
3. **載入擴充功能**：
   點擊左上角出現的 **「載入未打包擴充功能」（Load unpacked）** 按鈕。
4. **選取資料夾**：
   選擇剛解壓縮出來、包含 `manifest.json` 的 `chrome_highlighter` 資料夾，即可完成安裝！
5. **開啟本地檔案權限（選填，測試 `test.html` 用）**：
   若要在本地電腦開啟 `test.html` 進行測試，請在擴充功能卡片點選 **「詳細資料」（Details）**，將 **「允許存取檔案網址」（Allow access to file URLs）** 開關開啟。

---

## ✨ 主要功能

* **🔍 網址 / 連結貼上即時檢測**：複製任何文字或圖片連結貼上，即可自動解析是否含有混淆字元，還原真實 Punycode 網域，並列出每個字元的 Unicode 碼點。
* **🌐 異樣字元自動高亮**：
  * **西里爾字母 (Cyrillic)**：防範偽造英文字母（如 `рaypal.com` 中的 `р`）。
  * **特殊數學符號 / 花體字** (Math Unicode)
  * **非 ASCII 字元**（全形字與特殊標點）
  * **自訂 Regular Expression**
* **🎨 模式獨立配色**：每個檢測模式皆可自訂「高亮背景色」與「文字顏色」。
* **⏸️ 預設停止與一鍵開關**：純中文介面，開啟網頁時預設靜態不干擾，點擊「開始掃描」才即時作用。
* **🔗 連結防護**：使用 `TreeWalker` 純文字節點替換技術，高亮同時完全不破壞文字超連結 (`<a>`) 與圖片超連結 (`<a><img />`) 的功能與排版。
* **🧪 測試頁支援**：可直接開啟 [線上測試頁面](https://anshaer.github.io/chrome_highlighter/test.html) 或本地 `test.html` 驗證各類異字元與連結變色效果。

---

## 📂 專案檔案結構

```text
chrome_highlighter/
├── manifest.json          # 擴充功能核心設定檔 (v1.1)
├── popup.html             # 純中文 UI 介面（含版權宣告）
├── popup.js               # 檢測演算法與設定儲存邏輯
├── content.js             # 網頁 DOM 注入與高亮渲染腳本
├── index.html              # GitHub Pages 網頁版首頁
├── test.html               # 測試用網頁範例（包含各類異字元與連結）
├── chrome_highlighter.zip # 預先打包之擴充功能壓縮檔（免 Git 一鍵下載）
└── README.md              # 專案說明文件
