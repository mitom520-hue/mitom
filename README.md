# 育華國小 三年甲班 教學網站

靜態網站，不需要安裝任何程式或資料庫，直接開啟 `index.html` 即可瀏覽。

```
個人網頁/
├── index.html              主頁（所有文字內容都在這裡）
└── assets/
    ├── css/
    │   ├── style.css        網站樣式
    │   └── fontawesome.css  免費圖示（Font Awesome Free 6.5.2）
    ├── js/
    │   ├── main.js          QR Code、選單、動畫等互動功能
    │   └── qrcode.js        QR Code 產生器（MIT 授權）
    └── webfonts/            圖示字型（離線可用）
```

---

## 一、QR Code（450 × 450）

* 主視覺右側與「聯絡我們」區塊各有一組 QR Code，**固定以 450 × 450 px 顯示**。
* QR Code 由 `assets/js/main.js` 即時產生（純前端、不需連網）。

### 更改 QR Code 指向的網址

開啟 `assets/js/main.js`，在最上方找到：

```js
var CONFIG = {
  siteUrl: '',              // ← 在這裡填入班級網站網址
  qrSize: 450,              // QR Code 顯示尺寸（px）
  errorCorrection: 'M',     // 糾錯等級 L / M / Q / H
  schoolYear: '115 學年度上學期',
  schoolDay: '08/31',
  grade: '三年甲班'
};
```

* `siteUrl` **留空** → 自動帶入「目前瀏覽器上的網址」（部署到哪裡就指向哪裡，最省事）。
* `siteUrl` **填入網址** → 例如 `'https://www.yu-hua.edu.tw/3a/'`，QR Code 就固定指向該網址。
* `qrSize` 預設 `450`，即 450 × 450 px。

頁面上另有「下載 QR Code」按鈕，可直接下載 **450 × 450 的 PNG** 檔（適合印成海報貼在教室）。

---

## 二、修改內容

| 想改的東西 | 位置 |
| --- | --- |
| 標題 / 公告 / 作業 / 活動 / 榮譽榜 / 聯絡資訊 | `index.html` |
| 課表（每節科目） | `index.html` 的 `<table class="timetable">` |
| 「上週」課表的異動 | `main.js` 的 `SCHEDULE_PREV` |
| 配色、字型、版面、圓角、陰影 | `assets/css/style.css`（最上方 `:root` 變數） |
| 圖示 | `index.html` 中 `<i class="fa-solid fa-xxx"></i>`，名稱可查 <https://fontawesome.com/icons> |

### 常用配色（改 `style.css` 最上方的 `:root` 即可整站換色）

```css
--brand:#2563eb;   /* 主色（按鈕、標題強調） */
--accent:#f59e0b;  /* 輔色（QR 卡片、活動節點） */
--green:#10b981;   /* 成功色 */
--radius:16px;     /* 圓角 */
```

### 換圖示

```html
<i class="fa-solid fa-house"></i>     <!-- 房子 -->
<i class="fa-solid fa-chalkboard-user"></i> <!-- 老師 -->
<i class="fa-solid fa-school"></i>    <!-- 學校 -->
```

---

## 三、免費資源與授權

* **Font Awesome Free 6.5.2** — 圖示：CC BY 4.0（圖示）/ SIL OFL 1.1（字型）/ MIT（程式碼）
* **qrcode-generator 1.4.4**（Kazuhiko Arase）— MIT License
* **Noto Sans TC** — SIL Open Font License（Google Fonts）

---

## 四、發布方式

1. 把整個資料夾上傳到網站主機（或 GitHub Pages / Netlify / Cloudflare Pages）。
2. 建議網址固定為 `index.html` 或根目錄，QR Code 才不會失效。
3. 若使用了固定的 `siteUrl`，請記得在改版或換網址時同步更新。

> 若要離線使用，把 `index.html` 的 Google Fonts 連結移除也沒問題，
> 系統會自動改用微軟正黑體 / 蘋方，版面依然正常。
