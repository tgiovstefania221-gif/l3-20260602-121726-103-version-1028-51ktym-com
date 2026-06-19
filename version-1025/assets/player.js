(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.big-play');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var attached = false;

    function attachSource() {
      if (attached || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }

      attached = true;
    }

    function playVideo() {
      attachSource();
      shell.classList.add('is-active');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-active');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-active');
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
