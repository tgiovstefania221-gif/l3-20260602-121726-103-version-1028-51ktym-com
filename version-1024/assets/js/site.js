(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
        if (!cardList) {
            return;
        }

        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
            var matchCategory = !category || normalize(card.getAttribute('data-category')) === category;
            var visible = matchQuery && matchYear && matchCategory;

            card.hidden = !visible;

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    [searchInput, yearFilter, categoryFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            if (categoryFilter) {
                categoryFilter.value = '';
            }
            applyFilter();
        });
    }
})();
