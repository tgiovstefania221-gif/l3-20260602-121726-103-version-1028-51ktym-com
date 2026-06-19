(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHomeSearch() {
        var form = document.querySelector('[data-home-search]');
        if (!form) {
            return;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var search = panel.querySelector('[data-filter-search]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var empty = panel.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');
            if (initial && search) {
                search.value = initial;
            }
            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var typeValue = type ? type.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region')
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (typeValue && (card.getAttribute('data-type') || '').indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }
            [search, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    window.createMoviePlayer = function (videoId, mediaUrl) {
        var video = typeof videoId === 'string' ? document.getElementById(videoId) : videoId;
        if (!video || !mediaUrl) {
            return;
        }
        var frame = video.closest('.player-frame') || document;
        var overlay = frame.querySelector('.player-overlay');
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }
        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!attached) {
                start();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHomeSearch();
        setupHero();
        setupFilters();
    });
})();
