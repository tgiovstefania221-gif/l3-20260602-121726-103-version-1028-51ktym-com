(function () {
  var input = document.getElementById('site-search');
  var select = document.getElementById('category-filter');
  var clear = document.getElementById('clear-search');
  var results = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  var data = window.__MOVIE_SEARCH_DATA__ || [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>评分 ' + escapeHtml(movie.rating) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function getQueryParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render() {
    var keyword = (input.value || '').trim().toLowerCase();
    var category = select.value;
    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.categoryName,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      var keywordOk = keyword === '' || haystack.indexOf(keyword) !== -1;
      var categoryOk = category === '' || movie.category === category;
      return keywordOk && categoryOk;
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('\n');
    count.textContent = '共找到 ' + matched.length + ' 条匹配结果，最多显示 120 条。';
  }

  document.addEventListener('DOMContentLoaded', function () {
    input.value = getQueryParam();
    input.addEventListener('input', render);
    select.addEventListener('change', render);
    clear.addEventListener('click', function () {
      input.value = '';
      select.value = '';
      render();
    });
    render();
  });
})();
