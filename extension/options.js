let trackedSites = [];

function loadSettings() {
  chrome.storage.local.get(['trackedSites', 'points'], function(data) {
    trackedSites = data.trackedSites || [];
    document.getElementById('currentPoints').textContent = (data.points || 0).toFixed(2);
    renderSites();
  });
}

function renderSites() {
  var sitesList = document.getElementById('sitesList');
  sitesList.innerHTML = '';
  if (trackedSites.length === 0) {
    sitesList.innerHTML = '<p>Нет добавленных сайтов.</p>';
    return;
  }

  trackedSites.forEach(function(site, index) {
    var div = document.createElement('div');
    div.className = 'site-item';
    var isShorts = site.pathFilter === '/shorts/';
    div.innerHTML = `
      <input type="text" class="site-domain" value="${site.domain}" placeholder="youtube.com" style="flex:2">
      <input type="text" class="site-path" value="${site.pathFilter || ''}" placeholder="Фильтр пути (опц.)" style="flex:1">
      <input type="number" class="site-cost" value="${site.costPerMinute || 1}" min="0.1" step="0.1" placeholder="Цена/мин" style="width:80px">
      <label>
        <input type="checkbox" class="site-enabled" ${site.enabled !== false ? 'checked' : ''}>
        Вкл
      </label>
      <button class="btn-remove" data-index="${index}">Удалить</button>
      ${isShorts ? '<div class="shorts-hint">Это правило для YouTube Shorts (путь содержит /shorts/)</div>' : ''}
    `;
    sitesList.appendChild(div);
  });

  var removeButtons = document.querySelectorAll('.btn-remove');
  removeButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var idx = parseInt(e.target.dataset.index, 10);
      trackedSites.splice(idx, 1);
      renderSites();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('addSiteBtn').addEventListener('click', function() {
    trackedSites.push({ domain: '', costPerMinute: 1, enabled: true, pathFilter: '' });
    renderSites();
  });

  document.getElementById('saveBtn').addEventListener('click', function() {
    var newSites = [];
    var items = document.querySelectorAll('.site-item');

    items.forEach(function(item) {
      var domain = item.querySelector('.site-domain').value.trim();
      var pathFilter = item.querySelector('.site-path').value.trim();
      var cost = parseFloat(item.querySelector('.site-cost').value);
      var enabled = item.querySelector('.site-enabled').checked;

      if (domain) {
        newSites.push({
          domain: domain,
          pathFilter: pathFilter || null,
          costPerMinute: isNaN(cost) ? 1 : cost,
          enabled: enabled
        });
      }
    });

    trackedSites = newSites;

    chrome.storage.local.set({
      trackedSites: trackedSites
    }, function() {
      document.getElementById('statusMsg').textContent = 'Настройки сохранены!';
      setTimeout(function() { document.getElementById('statusMsg').textContent = ''; }, 2000);
    });
  });

  loadSettings();
});
