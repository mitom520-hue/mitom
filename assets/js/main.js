/* ==========================================================================
   育華國小 三年甲班 教學網站 — main.js
   --------------------------------------------------------------------------
   【老師修改指引】
   1. QR Code 內容：修改下方 CONFIG.siteUrl（留空 = 自動帶入目前頁面網址）
   2. QR Code 大小：修改 CONFIG.qrSize（預設 450 = 450 × 450 px）
   3. 課表「上週」變更：修改 SCHEDULE_PREV
   4. 學年度 / 開學日：修改 CONFIG
   ========================================================================== */
(function () {
  'use strict';

  /* ── 設定區 ─────────────────────────────────────────────────────── */
  var CONFIG = {
    /* QR Code 指向的網址。
       ★ 請改成你的班級網站網址，例如：'https://www.yu-hua.edu.tw/3a/'
       ★ 若留空 '', 系統會自動使用「目前瀏覽器上的網址」產生 QR Code。 */
    siteUrl: '',

    qrSize: 450,                 // QR Code 顯示尺寸（px），預設 450 × 450
    errorCorrection: 'M',        // 糾錯等級：L / M / Q / H
    schoolYear: '115 學年度上學期',
    schoolDay: '08/31',
    grade: '三年甲班'
  };

  /* 「上週」課表的異動（只寫和本週不同的地方）
     格式：{ day: 星期(0=一 ... 4=五), period: 節次(1~8), subject: 科目, icon: 圖示, cls: 樣式 } */
  var SCHEDULE_PREV = [
    { day: 2, period: 3, subject: '自然', icon: 'fa-flask', cls: 'sub--sci' },
    { day: 2, period: 7, subject: '社團', icon: 'fa-futbol', cls: 'sub--club' },
    { day: 3, period: 5, subject: '健康', icon: 'fa-heart-pulse', cls: 'sub--health' },
    { day: 4, period: 4, subject: '社會', icon: 'fa-earth-asia', cls: 'sub--soc' }
  ];

  /* ── 小工具 ─────────────────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

  function showToast(msg, ms) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-show'); }, ms || 2200);
  }

  /* ── 1. QR Code（450 × 450）───────────────────────────────────── */
  function currentPayload() {
    if (CONFIG.siteUrl && CONFIG.siteUrl.trim()) return CONFIG.siteUrl.trim();
    var loc = window.location.href.split('#')[0];
    if (/^https?:/i.test(loc)) return loc;      /* 以網頁方式開啟 → 用目前網址 */
    return '育華國小 三年甲班 教學網站';          /* 本機檔案 → 顯示文字 QR */
  }

  function buildQr(text) {
    /* 支援中文（UTF-8）編碼 */
    if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    }
    var qr = qrcode(0, CONFIG.errorCorrection);   /* 0 = 自動判斷版本 */
    qr.addData(text, 'Byte');
    qr.make();
    return qr;
  }

  function renderQr() {
    var text = currentPayload();
    var qr;

    try {
      qr = buildQr(text);
    } catch (err) {
      console.error('[QR] 產生失敗，改用預設內容：', err);
      qr = buildQr(CONFIG.grade + ' 教學網站');
    }

    var svg = qr.createSvgTag({
      cellSize: 10,
      margin: 40,                 /* 靜音區（四周留白） */
      scalable: true,
      alt: '育華國小三年甲班 QR Code',
      title: '育華國小三年甲班'
    });

    /* 固定輸出尺寸 = 450 × 450 */
    svg = svg.replace('<svg ', '<svg width="' + CONFIG.qrSize + '" height="' + CONFIG.qrSize + '" ');

    $$('.qr-frame').forEach(function (frame) {
      frame.innerHTML = svg;
      frame.setAttribute('aria-busy', 'false');
      frame.setAttribute('role', 'img');
      frame.setAttribute('aria-label', '育華國小三年甲班 QR Code，' + CONFIG.qrSize + '乘' + CONFIG.qrSize + '像素');
    });

    window.__qr = qr;
    window.__qrText = text;
  }

  /* 下載 450 × 450 PNG */
  function downloadQr() {
    if (!window.__qr) return;
    var size = CONFIG.qrSize;
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);
      try {
        var a = document.createElement('a');
        a.download = '育華國小三年甲班-QRCode-' + size + 'x' + size + '.png';
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('QR Code 已下載（' + size + ' × ' + size + ' px）');
      } catch (e) {
        showToast('下載失敗，請改用右鍵另存圖片');
      }
    };
    img.src = window.__qr.createDataURL(10, 40);
  }

  /* 複製網址 */
  function copyUrl() {
    var text = window.__qrText || currentPayload();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已複製網址：' + text); }
      catch (e) { showToast('複製失敗，請手動複製：' + text); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('已複製網址：' + text);
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ── 2. 導覽列（行動版選單）───────────────────────────────────── */
  function initNav() {
    var toggle = $('#navToggle');
    var menu = $('#navMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });

    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });

    var nav = $('#nav');
    var toTop = $('#toTop');
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (nav) nav.classList.toggle('is-stuck', y > 8);
      if (toTop) toTop.classList.toggle('is-show', y > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ── 3. 選單高亮（捲動監控）───────────────────────────────────── */
  function initScrollSpy() {
    var links = $$('.nav__link[href^="#"]');
    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (!sec) return;
      map[id] = link;
      sections.push(sec);
    });

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        if (map[id]) map[id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ── 4. 進場動畫 ──────────────────────────────────────────────── */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (i) { io.observe(i); });
  }

  /* ── 5. 數字動畫 ──────────────────────────────────────────────── */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var dur = 1200, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ── 6. 課表：本週 / 上週 ─────────────────────────────────────── */
  function initSchedule() {
    var table = $('.timetable');
    if (!table) return;
    var tbody = table.querySelector('tbody');
    var baseHtml = tbody.innerHTML;           /* 靜態 HTML = 本週內容 */
    var btns = $$('.seg__btn');

    function buildCell(day, period, subject, icon, cls) {
      return '<td><span class="sub ' + cls + '"><i class="fa-solid ' + icon + '"></i>' +
             subject + '</span></td>';
    }

    function applyPrev() {
      tbody.innerHTML = baseHtml;
      SCHEDULE_PREV.forEach(function (ch) {
        var row = tbody.rows[ch.period - 1];
        if (!row) return;
        var cell = row.cells[ch.day + 1];      /* 第 0 欄為「節次」欄 */
        if (cell) cell.innerHTML = buildCell(ch.day, ch.period, ch.subject, ch.icon, ch.cls);
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        if (btn.dataset.week === 'prev') {
          applyPrev();
          showToast('已切換為「上週」課表');
        } else {
          tbody.innerHTML = baseHtml;
          showToast('已切換為「本週」課表');
        }
      });
    });
  }

  /* ── 7. 日期 / 學年度 ─────────────────────────────────────────── */
  function initDates() {
    var now = new Date();

    var tw = $('#todayText');
    if (tw) tw.textContent = WEEK_CN[now.getDay()];

    var td = $('#todayDate');
    if (td) {
      var m = now.getMonth() + 1, d = now.getDate();
      td.textContent = m + '月' + d + '日';
    }

    var yr = $('#year');
    if (yr) yr.textContent = now.getFullYear();

    var hw = $('#hwDate');
    if (hw) {
      var m2 = now.getMonth() + 1, d2 = now.getDate();
      hw.textContent = (m2 < 10 ? '0' + m2 : m2) + '/' + (d2 < 10 ? '0' + d2 : d2);
    }

    var sy = $('#schoolYear');
    if (sy) sy.textContent = CONFIG.schoolYear;

    var sd = $('#schoolDay');
    if (sd) sd.textContent = CONFIG.schoolDay;
  }

  /* ── 8. 啟動 ───────────────────────────────────────────────────── */
  function init() {
    initDates();
    renderQr();
    initNav();
    initScrollSpy();
    initReveal();
    initCounters();
    initSchedule();

    var dl = $('#qrDownload');
    if (dl) dl.addEventListener('click', downloadQr);

    var cp = $('#qrCopy');
    if (cp) cp.addEventListener('click', copyUrl);

    if (!CONFIG.siteUrl.trim()) {
      console.info('[育華國小三年甲班] 若要固定 QR Code 內容，請於 assets/js/main.js 的 CONFIG.siteUrl 填入班級網址。');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
