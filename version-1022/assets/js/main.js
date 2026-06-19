(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var searchScopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));

    searchScopes.forEach(function (scope) {
        var searchInput = scope.querySelector('[data-card-search]');
        var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-card-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var emptyState = scope.querySelector('[data-empty-state]');

        if (!searchInput && filters.length === 0) {
            return;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
        }

        function updateCards() {
            var query = searchInput ? normalize(searchInput.value) : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matched = true;
                var text = cardText(card);

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                filters.forEach(function (filter) {
                    var field = filter.getAttribute('data-card-filter');
                    var value = normalize(filter.value);
                    var cardValue = normalize(card.getAttribute('data-' + field));

                    if (!value) {
                        return;
                    }

                    if (field === 'genre') {
                        if (cardValue.indexOf(value) === -1) {
                            matched = false;
                        }
                    } else if (cardValue !== value) {
                        matched = false;
                    }
                });

                card.hidden = !matched;

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', updateCards);
        }

        filters.forEach(function (filter) {
            filter.addEventListener('change', updateCards);
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var videoUrl = player.getAttribute('data-video-url');
        var initialized = false;
        var hlsInstance = null;

        function bindSource() {
            if (initialized || !videoUrl || !video) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            initialized = true;
        }

        function startPlayback() {
            bindSource();

            if (overlay) {
                overlay.classList.add('hidden');
            }

            if (video) {
                var playResult = video.play();

                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('hidden');
                        }
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }

            if (event.target === overlay || overlay && overlay.contains(event.target)) {
                return;
            }
        });

        if (video) {
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 && overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
