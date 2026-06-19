(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  startHero();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('.filter-input').forEach(function (input) {
    var targetId = input.getAttribute('data-filter-target');
    var target = targetId ? document.getElementById(targetId) : null;

    if (!target) {
      return;
    }

    var items = Array.prototype.slice.call(target.querySelectorAll('.movie-card, .rank-row'));

    input.addEventListener('input', function () {
      var query = normalize(input.value);
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-year'),
          item.textContent
        ].join(' '));
        item.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    });
  });

  function attachSource(video, source, shell) {
    if (!source || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      shell._hls = hls;
      video.setAttribute('data-ready', '1');
      return;
    }

    video.src = source;
    video.setAttribute('data-ready', '1');
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    var source = shell.getAttribute('data-video');

    if (!video || !button) {
      return;
    }

    function playVideo() {
      attachSource(video, source, shell);
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
})();
