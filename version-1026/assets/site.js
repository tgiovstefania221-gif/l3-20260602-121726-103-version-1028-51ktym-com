(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    play();
  }

  function setupCatalog() {
    var catalog = document.querySelector("[data-catalog]");
    if (!catalog) {
      return;
    }
    var searchInput = catalog.querySelector("[data-catalog-search]");
    var sortSelect = catalog.querySelector("[data-sort-select]");
    var buttons = Array.prototype.slice.call(catalog.querySelectorAll("[data-filter-category]"));
    var grid = catalog.querySelector("[data-card-grid]");
    var resultCount = catalog.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
    var currentCategory = "all";

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-category"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year")
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = (searchInput && searchInput.value || "").trim().toLowerCase();
      var visible = [];
      cards.forEach(function (card) {
        var matchesText = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchesCategory = currentCategory === "all" || card.getAttribute("data-category") === currentCategory;
        var show = matchesText && matchesCategory;
        card.classList.toggle("is-hidden-card", !show);
        if (show) {
          visible.push(card);
        }
      });
      if (sortSelect) {
        var mode = sortSelect.value;
        visible.sort(function (a, b) {
          if (mode === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (mode === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return 0;
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (resultCount) {
        resultCount.textContent = String(visible.length);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentCategory = button.getAttribute("data-filter-category");
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", apply);
    }
    apply();
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-score">' + movie.rating.toFixed(1) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var resultRoot = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!resultRoot || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var results = window.SITE_MOVIES.filter(function (movie) {
      return [
        movie.title,
        movie.category,
        movie.genre,
        movie.year,
        movie.region,
        movie.oneLine,
        movie.tags
      ].join(" ").toLowerCase().indexOf(lower) !== -1;
    });
    if (title) {
      title.textContent = "搜索“" + query + "”找到 " + results.length + " 部影片";
    }
    if (!results.length) {
      resultRoot.innerHTML = '<div class="story-card"><h2>未找到相关内容</h2><p>请更换关键词继续搜索。</p></div>';
      return;
    }
    resultRoot.innerHTML = results.slice(0, 120).map(renderSearchCard).join("");
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movieVideo");
    var button = document.querySelector("[data-player-start]");
    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = sourceUrl;
    }

    attach();

    if (button) {
      button.addEventListener("click", function () {
        button.classList.add("is-hidden");
        video.play().catch(function () {
          video.controls = true;
        });
      });
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupCatalog();
    setupSearchPage();
  });
})();
