// Макет: мобильное меню и подсветка текущего раздела в меню и оглавлении
(function () {
  var menu = document.getElementById("menu");
  var burger = document.querySelector(".burger");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function closeMenu() {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }

  if (menu && burger) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  // Фокус на заголовок блока формы после перехода к нему
  function focusForm() {
    if (location.hash === "#obsudit-nir") {
      var h = document.getElementById("obsudit-nir-h");
      if (h) h.focus({ preventScroll: true });
    }
  }
  window.addEventListener("hashchange", focusForm);
  focusForm();

  function spy(links) {
    var items = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("#") !== 0) return;
      var el = document.getElementById(href.slice(1));
      if (el) items.push({ a: a, el: el });
    });
    if (!items.length) return;
    function update() {
      var y = window.scrollY + 120, cur = null;
      items.forEach(function (it) { if (it.el.offsetTop <= y) cur = it; });
      items.forEach(function (it) { it.a.classList.toggle("on", it === cur); });
      Array.prototype.forEach.call(document.querySelectorAll("#menu .has-sub"), function (h) {
        if (!h.querySelector('.nav-sub a[href^="#"]')) return;
        h.querySelector(".sub-t").classList.toggle("on", !!h.querySelector(".nav-sub a.on"));
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }
  if (menu) spy(Array.prototype.slice.call(menu.querySelectorAll("a:not(.nav-cta)")));
  var toc = document.querySelector(".toc");
  if (toc) spy(Array.prototype.slice.call(toc.querySelectorAll("a")));

  // Всплывающая форма «Обсудить исследование».
  // На главной: если блок «Заявка» не на экране — окно, без прокрутки.
  // Если блок уже на экране — окно не открывается и страница не едет.
  var formBlock = document.getElementById("obsudit-nir");
  function formIsOnScreen() {
    if (!formBlock) return false;
    var r = formBlock.getBoundingClientRect();
    var visibleTop = Math.max(r.top, 88);
    var visibleBottom = Math.min(r.bottom, window.innerHeight);
    return visibleBottom - visibleTop > window.innerHeight * 0.4;
  }
  var h1 = document.querySelector("main h1");
  var source = document.body.getAttribute("data-source") || (h1 ? h1.textContent.trim() : "");
  var modal = document.createElement("div");
  modal.className = "modal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="modal-ov" data-close></div>' +
    '<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="mf-h">' +
      '<button class="modal-x" type="button" aria-label="Закрыть форму" data-close>×</button>' +
      '<div class="mf-form">' +
        '<div class="sec-num">Заявка</div><h2 id="mf-h">Обсудить исследование</h2>' +
        '<p class="sub">Опишите задачу своими словами — мы предложим, как её проверить.</p>' +
        '<form novalidate>' +
          '<input type="hidden" name="source">' +
          '<div class="mf-row2">' +
            '<div class="field"><label for="mf-name">Как к вам обращаться? <span class="req">*</span></label><input class="inp" id="mf-name" placeholder="Имя или как вам удобно" autocomplete="name"><span class="err" hidden>Напишите, как к вам обращаться</span><span class="hint">Фамилия и должность не нужны</span></div>' +
            '<div class="field"><label for="mf-mail">Контактный e-mail <span class="req">*</span></label><input class="inp" id="mf-mail" type="email" placeholder="name@company.ru" autocomplete="email"><span class="err" hidden>Укажите e-mail в формате name@company.ru</span><span class="hint">Для ответа по заявке</span></div>' +
          '</div>' +
          '<div class="field"><label for="mf-text">Какое исследование вам нужно? <span class="req">*</span></label>' +
            '<textarea class="inp" id="mf-text" maxlength="2000" placeholder="Что вы хотите проверить или измерить? На ком или на чём (продукт, устройство, интерфейс, группа испытуемых)? Для чего нужен результат: гипотеза, доказательная база, прототип, решение по продукту? Не указывайте данные пациентов и третьих лиц."></textarea>' +
            '<span class="err" hidden>Опишите задачу хотя бы в двух словах</span><span class="counter">0 / 2 000</span></div>' +
          '<div class="consent">Место под согласие или уведомление об обработке данных — вид и текст по заключению юриста</div>' +
          '<div class="mf-actions"><button class="btn" type="submit">Отправить заявку</button><span class="hint">Ответим на указанный e-mail</span></div>' +
        '</form>' +
      '</div>' +
      '<div class="mf-ok" hidden>' +
        '<span class="mark">✓</span><h2 tabindex="-1">Спасибо, заявка отправлена</h2>' +
        '<div class="num"><small>Номер заявки</small><b class="ph">20261001-017</b></div>' +
        '<p class="ph">Ответим на указанный e-mail в течение [срок — решение руководителя].</p>' +
        '<p>Если вопрос срочный, напишите на e.p.bubnova@samsmu.ru и укажите номер заявки.</p>' +
        '<button class="btn-sec" type="button" data-close>Закрыть</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  modal.querySelector('input[name="source"]').value = source;

  var box = modal.querySelector(".modal-box");
  var form = modal.querySelector("form");
  var formView = modal.querySelector(".mf-form");
  var okView = modal.querySelector(".mf-ok");
  var text = modal.querySelector("#mf-text");
  var counter = modal.querySelector(".counter");
  var lastFocus = null;

  function setErr(inp, bad) {
    inp.classList.toggle("is-error", bad);
    inp.setAttribute("aria-invalid", String(bad));
    inp.parentNode.querySelector(".err").hidden = !bad;
  }
  function bindCounter(area, counter) {
    area.addEventListener("input", function () {
      counter.textContent = area.value.length.toLocaleString("ru-RU") + " / 2 000";
    });
  }
  function openModal() {
    lastFocus = document.activeElement;
    formView.hidden = false;
    okView.hidden = true;
    modal.hidden = false;
    document.documentElement.classList.add("modal-open");
    modal.querySelector("#mf-name").focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.documentElement.classList.remove("modal-open");
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href*="#obsudit-nir"]');
    if (a) {
      e.preventDefault();
      if (formIsOnScreen()) {
        var field = formBlock.querySelector("input, textarea");
        if (field) field.focus({ preventScroll: true });
        return;
      }
      if (menu && menu.classList.contains("open")) closeMenu();
      var t = a.textContent.replace("→", "").trim();
      modal.querySelector("#mf-h").textContent = t && t !== "Обсудить" ? t : "Обсудить исследование";
      openModal();
      return;
    }
    if (!modal.hidden && e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(box.querySelectorAll("button, input, textarea, a[href]"), function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  bindCounter(text, counter);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = modal.querySelector("#mf-name"), mail = modal.querySelector("#mf-mail");
    setErr(name, !name.value.trim());
    setErr(mail, !EMAIL.test(mail.value.trim()));
    setErr(text, text.value.trim().length < 5);
    var bad = form.querySelector(".is-error");
    if (bad) { bad.focus(); return; }
    form.reset();
    counter.textContent = "0 / 2 000";
    formView.hidden = true;
    okView.hidden = false;
    okView.querySelector("h2").focus();
  });

  // Форма на главной: та же проверка и экран «Спасибо», что во всплывающей форме
  var hf = document.getElementById("hf");
  if (hf) {
    var hfOk = document.getElementById("hf-ok");
    var hfText = document.getElementById("hf-text");
    var hfCnt = hf.querySelector(".counter");
    bindCounter(hfText, hfCnt);
    hf.addEventListener("submit", function (e) {
      e.preventDefault();
      var nm = document.getElementById("hf-name"), ml = document.getElementById("hf-mail");
      setErr(nm, !nm.value.trim());
      setErr(ml, !EMAIL.test(ml.value.trim()));
      setErr(hfText, hfText.value.trim().length < 5);
      var bad = hf.querySelector(".is-error");
      if (bad) { bad.focus(); return; }
      hf.reset();
      hfCnt.textContent = "0 / 2 000";
      hf.hidden = true;
      hfOk.hidden = false;
      hfOk.querySelector("h3").focus();
    });
    document.getElementById("hf-again").addEventListener("click", function () {
      hfOk.hidden = true;
      hf.hidden = false;
      document.getElementById("hf-name").focus();
    });
  }

  // Кнопка «Наверх» на длинных страницах с оглавлением (телефон)
  if (toc) {
    var up = document.createElement("a");
    up.className = "to-top";
    up.href = "#";
    up.textContent = "Наверх";
    document.body.appendChild(up);
    up.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    var upCheck = function () { up.classList.toggle("show", window.scrollY > window.innerHeight * 1.5); };
    window.addEventListener("scroll", upCheck, { passive: true });
    upCheck();
  }

  // Плавный переход между страницами макета. Якоря на той же странице не перехватываются.
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduced) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var raw = a.getAttribute("href") || "";
    if (!raw || raw.charAt(0) === "#") return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add("is-leave");
    window.setTimeout(function () { location.href = url.href; }, 280);
  });
})();
