/* ============================================================
   Bookshelf — script.js
   Данные каталога (по макетам ЛР2), экраны, поиск, закладки,
   прогресс чтения.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Данные каталога ---------- */
  var BOOKS = [
    { id: 1,  title: "Мастер и Маргарита",         author: "М. Булгаков",   authorFull: "Михаил Булгаков",
      genre: "Классика", rating: 4.9, rec: true, np: true, progress: 62,
      tags: ["Классика", "Мистика"],
      initial: "Ми", color: "blue",   chap: "глава XII", time: "~2 ч", timeLong: "~2 часа", pages: 384, year: 2025, age: "12+",
      desc: "Роман «Мастер и Маргарита» — одна из вершин мировой литературы ХХ века. Таинственный профессор Воланд со свитой оказывается в Москве 1930-х и переворачивает привычный порядок вещей. Параллельно разворачивается история Мастера и его возлюбленной Маргариты." },
    { id: 2,  title: "Тихий Дон",                 author: "М. Шолохов",             genre: "Роман",      rating: 4.8, rec: true,  progress: 0,
      initial: "ТД", color: "teal",   chap: "", time: "", timeLong: "", pages: 928, year: 2023, age: "16+", np: true },
    { id: 3,  title: "1984",                       author: "Дж. Оруэлл",             genre: "Антиутопия", rating: 4.9, rec: true,  progress: 0,
      initial: "1984", color: "slate", chap: "", time: "", timeLong: "", pages: 328, year: 2021, age: "16+", np: true },
    { id: 4,  title: "Анна Каренина",              author: "Л. Толстой",             genre: "Роман",      rating: 4.7, rec: true,  progress: 0,
      initial: "АК", color: "rose",   chap: "", time: "", timeLong: "", pages: 864, year: 2022, age: "12+", np: true },
    { id: 5,  title: "Алгоритмы на Java",          author: "Р. Седжвик",             genre: "Учебная",    rating: 4.6, rec: true, np: true, progress: 0,
      initial: "Ал", color: "violet", chap: "", time: "", timeLong: "", pages: 848, year: 2024, age: "16+" },
    { id: 6,  title: "Маленький принц",            author: "А. де Сент-Экзюпери",    genre: "Роман",      rating: 4.8, rec: true, np: true, progress: 0,
      initial: "Мп", color: "amber",  chap: "", time: "", timeLong: "", pages: 96,  year: 2020, age: "0+" },
    { id: 7,  title: "Дизайн-системы",             author: "А. Калара",              genre: "Учебная",    rating: 4.6,   progress: 0,
      initial: "Д",  color: "sky",    chap: "", time: "", timeLong: "", pages: 320, year: 2025, age: "12+" },
    { id: 8,  title: "Преступление и наказание",   author: "Ф. Достоевский",         genre: "Классика",   rating: 4.7,   progress: 0,
      initial: "Пи", color: "violet", chap: "", time: "", timeLong: "", pages: 672, year: 2021, age: "16+" },
    { id: 9,  title: "Сто лет одиночества",        author: "Г. Гарсиа Маркес",       genre: "Роман",      rating: 4.8,   progress: 0,
      initial: "Сл", color: "amber",  chap: "", time: "", timeLong: "", pages: 416, year: 2022, age: "16+" },
    { id: 10, title: "Думай медленно... решай быстро", author: "Д. Канеман",         genre: "Нон-фикшн",  rating: 4.5,   progress: 0,
      initial: "Дм", color: "teal",   chap: "", time: "", timeLong: "", pages: 656, year: 2024, age: "16+" },
    { id: 11, title: "Дюна",                       author: "Ф. Герберт",             genre: "Фэнтези",    rating: 4.7, progress: 0,
      initial: "Д",  color: "rose",   chap: "", time: "", timeLong: "", pages: 704, year: 2023, age: "16+" }
  ];

  var READING_ID = 1;
  var SIMILAR_IDS = [2, 3, 4];

  var favorites = [2, 3, 4, 7, 9, 11];
  var currentGenre = "all";
  var query = "";
  var lastScreen = "auth";

  /* ---------- Общие помощники ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(id) { return BOOKS.filter(function (b) { return b.id === id; })[0]; }

  function stars(r) {
    var full = Math.round(r);
    return "&#9733;".repeat(full) + "&#9734;".repeat(5 - full);
  }

  function coverInner(book, sub) {
    return (
      '<span class="cover__initial">' + (book.initial || book.title.charAt(0)) + "</span>" +
      '<span class="cover__title">' + book.title + "</span>" +
      '<span class="cover__author">' + (sub === "genre" ? book.genre : book.author) + "</span>"
    );
  }

  /* grid — true: карточка сетки (автор • рейтинг); false: карточка ленты (автор + жанр) */
  function cardHTML(book, grid, ext) {
    return (
      '<article class="book-card' + (grid ? " book-card--grid" : "") +
        (ext ? " book-card--ext" : "") + '" data-open="' + book.id + '" tabindex="0" aria-label="' + book.title + '">' +
        '<div class="cover cover--' + book.color + '">' + coverInner(book, grid ? "author" : "genre") + "</div>" +
        '<p class="book-card__title">' + book.title + "</p>" +
        (grid
          ? '<p class="book-card__meta">' + book.author + " &bull; <span class='meta-r'>" + book.rating.toFixed(1) + "</span></p>"
          : '<p class="book-card__author">' + book.author + '</p><p class="book-card__genre">' + book.genre + "</p>") +
      "</article>"
    );
  }

  /* ---------- Каталог ---------- */
  function renderSimilar() {
    $("#similarTrack").innerHTML = SIMILAR_IDS.map(function (id) {
      return cardHTML(byId(id), false, false);
    }).join("");
  }

  function matchesGenre(b) {
    return currentGenre === "all" || b.genre === currentGenre;
  }

function matchesQuery(b) {
    var q = query.trim().toLowerCase();
    return !q ||
      b.title.toLowerCase().indexOf(q) >= 0 ||
      b.author.toLowerCase().indexOf(q) >= 0 ||
      b.genre.toLowerCase().indexOf(q) >= 0;
  }

  function filtered() {
    return BOOKS.filter(function (b) {
      var okGenre = matchesGenre(b);
      var okQuery = matchesQuery(b);
      return okGenre && okQuery && b.np;
    });
  }

  function renderRecommended() {
    var rec = BOOKS.filter(function (b) {
      return b.rec && matchesGenre(b) && matchesQuery(b);
    });
    $("#recommended").innerHTML = rec.map(function (b) {
      return cardHTML(b, false, !!b.ext);
    }).join("");
    var visible = rec.length > 0;
    $(".sect--rec").hidden = !visible;
    $("#recommended").hidden = !visible;
  }

  function renderCatalog() {
    var list = filtered();
    $("#catalogGrid").innerHTML = list.map(function (b) {
      return cardHTML(b, true, false);
    }).join("");
    $("#emptyState").hidden = list.length > 0;
  }

  /* ---------- Закладки ---------- */
  function favBooks() {
    return BOOKS.filter(function (b) { return favorites.indexOf(b.id) >= 0; });
  }

  function renderFavorites() {
    var list = favBooks();
    $("#favGrid").innerHTML = list.map(function (b) { return cardHTML(b, true, false); }).join("");
    $("#favEmpty").hidden = list.length > 0;
    var strip = $("#favStripDesk");
    if (strip) strip.innerHTML = list.map(function (b) { return cardHTML(b, true, false); }).join("");
  }

  function toggleFavorite(id) {
    var i = favorites.indexOf(id);
    if (i >= 0) { favorites.splice(i, 1); } else { favorites.push(id); }
    renderFavorites();
    var btn = $("#favBtn");
    if (btn) {
      var inFav = favorites.indexOf(id) >= 0;
      btn.classList.toggle("is-fav", inFav);
      btn.querySelector("span span").textContent = inFav ? "В закладках" : "Добавить в закладки";
    }
  }

  /* ---------- «Продолжайте читать» и карточка «Читаю сейчас» ---------- */
  function renderNow() {
    var b = byId(READING_ID);
    if (!b) return;
    var read = Math.round(b.pages * b.progress / 100);

    var cover = $(".reading .cover");
    if (cover) {
      cover.className = "cover cover--" + b.color + " cover--sm";
      cover.innerHTML = coverInner(b);
    }
    $("#nowCard").innerHTML =
      '<span class="cover cover--' + b.color + ' cover--sm">' + coverInner(b) + "</span>" +
      '<div class="now__body">' +
        "<b>Читаю сейчас</b>" +
        '<div class="now__title">' + b.title + ' <span class="now__pct">' + b.progress + "%</span></div>" +
        '<div class="progress"><span class="progress__fill" style="width:' + b.progress + '%"></span></div>' +
        '<div class="now__meta">' + read + " из " + b.pages + " &bull; " + (b.timeLong || "~2 ч") + "</div>" +
      "</div>";
    $("#nowCard").setAttribute("data-open", b.id);

    var desk = $("#nowCardDesk");
    if (desk) {
      desk.innerHTML =
        '<div class="sect now__sect"><h2 class="sect__title">Читаю сейчас</h2></div>' +
        '<div class="now__row">' +
          '<div class="now--book">' + cardHTML(b, true, false) + "</div>" +
          '<div class="now__body">' +
            '<div class="now__title">' + b.title + "</div>" +
            '<div class="now__sub">' + (b.authorFull || b.author) + "</div>" +
            '<div class="now__meta"><span class="now__pct">' + b.progress + '%</span> &bull; до конца ещё 2 часа 10 мин</div>' +
          "</div>" +
          '<button class="btn btn--primary now__btn" type="button" data-open="' + b.id + '">Читать</button>' +
        "</div>";
    }
  }

  /* ---------- Карточка книги ---------- */
  function openBook(id) {
    var b = byId(id);
    if (!b) return;
    var read = b.progress > 0 ? Math.round(b.pages * b.progress / 100) : 0;
    var inFav = favorites.indexOf(b.id) >= 0;
    showScreen("book");

    var progressBlock = b.progress > 0
      ? '<div class="book__progress">' +
          '<div class="book__progress-head"><span>Прогресс чтения</span><span class="pct">' + b.progress + "%</span></div>" +
          '<div class="progress"><span class="progress__fill" style="width:' + b.progress + '%"></span></div>' +
          '<div class="book__progress-meta">' +
            '<span class="pm-m">Прочитано ' + read + " из " + b.pages + " &bull; " + b.chap + " &bull; " + (b.timeLong || "~2 ч") + "</span>" +
            '<span class="pm-d">Прочитано ' + read + " из " + b.pages + " страниц &bull; " + b.chap + "</span>" +
          "</div>" +
        "</div>"
      : '<div class="book__progress"><div class="book__progress-head"><span>Книга ещё не открыта</span></div>' +
        "<div class=\"book__progress-meta\">Начните чтение — прогресс будет сохраняться автоматически</div></div>";

    var tags = (b.tags && b.tags.length ? b.tags : [b.genre]).map(function (t) {
      return '<span class="book__chip">' + t + "</span>";
    }).join("");

    var sim = document.querySelector(".similar");
    if (sim) sim.remove();

    $("#bookView").innerHTML =
      '<div class="book-card--top">' + cardHTML(b, false, false) + "</div>" +
      '<div class="book__view">' +
        '<div class="book__aside">' +
          '<div class="cover book__cover cover--' + b.color + '">' + coverInner(b) + "</div>" +
        "</div>" +
        '<div class="book__body">' +
          '<nav class="book__crumbs" aria-label="Хлебные крошки">' +
            '<a class="crumb" href="#" data-screen="catalog">Каталог</a>' +
            '&nbsp;/&nbsp;<span>' + (b.tags && b.tags.length ? b.tags[0] : b.genre) + "</span>" +
            '&nbsp;/&nbsp;<span class="crumb-here">' + b.title + "</span></nav>" +
          "<h2 class='book__title'>" + b.title + "</h2>" +
          '<p class="book__author">' + (b.authorFull || b.author) + "</p>" +
          '<div class="book__meta">' +
            '<div class="book__rating"><span class="stars">' + stars(b.rating) + "</span><b>" + b.rating.toFixed(1) + "</b></div>" +
            '<div class="book__chip-row">' + tags + "</div>" +
          "</div>" +
          '<div class="book__facts">' +
            '<div class="fact"><b>' + b.pages + "</b><span>страницы</span></div>" +
            '<div class="fact"><b>' + b.year + "</b><span>издание</span></div>" +
            '<div class="fact"><b>' + b.age + "</b><span>возраст</span></div>" +
          "</div>" +
          '<div class="book__about"><h3>О книге</h3><p>' + (b.desc || ("«" + b.title + "» — произведение в жанре «" + b.genre + "» от автора " + (b.authorFull || b.author) + ". Захватывающее чтение для ценителей жанра.")) + ' <span class="book__more">Читать ещё&nbsp;&rarr;</span></p></div>' +
          progressBlock +
        "</div>" +
        '<div class="book__actions">' +
          '<button class="btn btn--primary" type="button">' +
            '<span class="b-m">Читать дальше</span><span class="b-d">Читать онлайн</span>' +
          "</button>" +
          '<button class="btn btn--fav' + (inFav ? " is-fav" : "") + '" id="favBtn" type="button">' +
            '<span><span>' + (inFav ? "В закладках" : "Добавить в закладки") + "</span></span></button>" +
        "</div>" +
      "</div>";
    if (sim) $("#bookView").appendChild(sim);
    $("#favBtn").addEventListener("click", function () { toggleFavorite(b.id); });
    window.scrollTo(0, 0);
  }

  /* ---------- Навигация между экранами ---------- */
  var SCREENS = ["auth", "catalog", "book", "favorites", "profile"];

  function showScreen(name) {
    var show = name === "search" ? "catalog" : name;
    SCREENS.forEach(function (s) {
      var el = $("#screen-" + s);
      if (el) el.hidden = s !== show;
    });
    document.body.classList.remove("screen-auth", "screen-catalog", "screen-book", "screen-favorites", "screen-profile");
    document.body.classList.add("screen-" + show);

    $$(".tab").forEach(function (t) {
      t.classList.toggle("tab--active", t.getAttribute("data-screen") === name);
    });
    var sideMap = { catalog: "home", book: "home", search: "search", favorites: "favorites", profile: "profile", library: "library", you: "you" };
    $$(".side").forEach(function (s) {
      s.classList.toggle("side--active", s.getAttribute("data-side") === (sideMap[name] || ""));
    });

    lastScreen = name === "search" ? "catalog" : name;
    window.scrollTo(0, 0);
    if (name === "search") {
      var input = $("#searchInput");
      if (input) input.focus();
    }
  }

  /* ---------- События ---------- */
  document.addEventListener("click", function (e) {
    var nav = e.target.closest("[data-screen]");
    if (nav) {
      var name = nav.getAttribute("data-screen");
      if (name === "profile") renderNow();
      showScreen(name);
      e.preventDefault();
    }
    var book = e.target.closest("[data-open]");
    if (book) {
      openBook(parseInt(book.getAttribute("data-open"), 10));
      e.preventDefault();
      return;
    }
  });

  $("#genreChips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach(function (c) { c.classList.remove("chip--active"); });
    chip.classList.add("chip--active");
    currentGenre = chip.getAttribute("data-genre");
    renderCatalog();
    renderRecommended();
  });

  function onSearch() {
    query = this.value;
    renderCatalog();
    renderRecommended();
  }
  $("#searchInput").addEventListener("input", onSearch);
  $("#deskSearch").addEventListener("input", onSearch);

  $("#logoutBtn").addEventListener("click", function () {
    favorites = [2, 3, 4, 7, 9, 11];
    renderFavorites();
    showScreen("catalog");
  });
  $("#backBtn").addEventListener("click", function () {
    showScreen(lastScreen === "book" ? "catalog" : lastScreen);
  });

  /* ---------- Инициализация ---------- */
  var params = new URLSearchParams(location.search);
  var startScreen = params.get("screen");
  var startId = parseInt(params.get("id"), 10);

  renderRecommended();
  renderSimilar();
  renderCatalog();
  renderFavorites();
  renderNow();
  $("#statRead").textContent = 42;
  $("#statNow").textContent = 3;
  $("#statFav").textContent = 17;

  if (startScreen === "book" && startId) {
    openBook(startId);
  } else if (["catalog", "favorites", "profile", "search"].indexOf(startScreen) >= 0) {
    if (startScreen === "profile") renderNow();
    showScreen(startScreen);
  } else {
    showScreen("catalog");
  }
})();