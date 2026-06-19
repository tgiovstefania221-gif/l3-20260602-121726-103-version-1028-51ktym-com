(function () {
    function attachPlayer() {
        var video = document.querySelector('.movie-player');
        var button = document.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var hlsSource = video.getAttribute('data-hls');
        var mp4Source = video.getAttribute('data-mp4');
        var hlsAttached = false;

        function attachHls() {
            if (hlsAttached || !hlsSource) {
                return;
            }

            if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(hlsSource);
                hls.attachMedia(video);
                hlsAttached = true;
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsSource;
                hlsAttached = true;
                return;
            }

            if (mp4Source && !video.currentSrc) {
                video.src = mp4Source;
            }
        }

        function playVideo() {
            attachHls();
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (mp4Source) {
                        video.src = mp4Source;
                        video.play().catch(function () {});
                    }
                });
            }
        }

        button.addEventListener('click', function () {
            button.classList.add('hidden');
            playVideo();
        });

        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });

        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('hidden');
            }
        });

        video.addEventListener('ended', function () {
            button.classList.remove('hidden');
        });

        window.addEventListener('hls-ready', attachHls);
        attachHls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachPlayer);
    } else {
        attachPlayer();
    }
})();
