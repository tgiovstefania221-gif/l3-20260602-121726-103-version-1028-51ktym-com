(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  document.querySelectorAll('.search-redirect').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var list = panel.parentElement.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var input = panel.querySelector('[data-filter-input]');
    var genre = panel.querySelector('[data-filter-genre]');
    var year = panel.querySelector('[data-filter-year]');
    var queryName = panel.getAttribute('data-query-from-url');

    if (queryName && input) {
      var params = new URLSearchParams(window.location.search);
      var value = params.get(queryName);
      if (value) {
        input.value = value;
      }
    }

    function applyFilters() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var g = genre ? genre.value.trim().toLowerCase() : '';
      var y = year ? year.value.trim() : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchQuery = !q || text.indexOf(q) !== -1;
        var matchGenre = !g || text.indexOf(g) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        card.classList.toggle('is-hidden', !(matchQuery && matchGenre && matchYear));
      });
    }

    [input, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
})();
