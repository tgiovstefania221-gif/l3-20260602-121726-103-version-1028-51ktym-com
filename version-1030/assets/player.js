(function () {
  function loadScript(src, done) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener('load', done, { once: true });
      if (window.Hls) {
        done();
      }
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = done;
    document.head.appendChild(script);
  }

  function attachSource(video, src, onReady) {
    if (!src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      onReady();
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      } else {
        video.src = src;
        onReady();
      }
    });
  }

  function setupPlayer(card) {
    var video = card.querySelector('video[data-src]');
    var button = card.querySelector('.player-start');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      var src = video.getAttribute('data-src');
      card.classList.add('is-playing');

      attachSource(video, src, function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            card.classList.remove('is-playing');
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
  });
})();
