(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    var scope = document.querySelector(form.getAttribute('data-filter-form')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var search = form.querySelector('[data-filter-search]');
    var region = form.querySelector('[data-filter-region]');
    var year = form.querySelector('[data-filter-year]');
    var sort = form.querySelector('[data-filter-sort]');
    var grid = scope.querySelector('[data-card-grid]') || scope;

    function getText(card, name) {
      return (card.getAttribute(name) || '').toLowerCase();
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var regionVal = region ? region.value : '全部';
      var yearVal = year ? year.value : '全部';
      var list = cards.slice();

      list.forEach(function (card) {
        var haystack = getText(card, 'data-title') + ' ' + getText(card, 'data-tags') + ' ' + getText(card, 'data-summary');
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (regionVal !== '全部' && card.getAttribute('data-region') !== regionVal) {
          ok = false;
        }
        if (yearVal !== '全部') {
          var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
          if (yearVal === '2025+' && cardYear < 2025) {
            ok = false;
          } else if (yearVal === '2020-2024' && (cardYear < 2020 || cardYear > 2024)) {
            ok = false;
          } else if (yearVal === '2010-2019' && (cardYear < 2010 || cardYear > 2019)) {
            ok = false;
          } else if (yearVal === '2000-2009' && (cardYear < 2000 || cardYear > 2009)) {
            ok = false;
          } else if (yearVal === '1999-' && cardYear > 1999) {
            ok = false;
          }
        }
        card.classList.toggle('hidden-by-filter', !ok);
      });

      if (sort && grid) {
        var visible = list.filter(function (card) {
          return !card.classList.contains('hidden-by-filter');
        });
        visible.sort(function (a, b) {
          if (sort.value === 'year-desc') {
            return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
          }
          if (sort.value === 'heat-desc') {
            return parseInt(b.getAttribute('data-heat') || '0', 10) - parseInt(a.getAttribute('data-heat') || '0', 10);
          }
          return parseInt(a.getAttribute('data-index') || '0', 10) - parseInt(b.getAttribute('data-index') || '0', 10);
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    [search, region, year, sort].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  });

  function initPlayer(box) {
    var video = box.querySelector('video');
    var starter = box.querySelector('.play-starter');
    var src = box.getAttribute('data-video-src');
    var started = false;

    function start() {
      if (started || !video || !src) {
        return;
      }
      started = true;
      if (starter) {
        starter.style.display = 'none';
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }

    if (starter) {
      starter.addEventListener('click', start);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-video-src]')).forEach(initPlayer);
})();
