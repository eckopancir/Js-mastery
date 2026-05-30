document.addEventListener('DOMContentLoaded', () => {
  const pointsDisplay = document.getElementById('pointsDisplay');
  const openOptions = document.getElementById('openOptions');
  const statusText = document.getElementById('statusText');
  const shopItems = document.getElementById('shopItems');

  // Загрузка текущих баллов
  chrome.storage.local.get(['points', 'isEnabled'], (data) => {
    pointsDisplay.textContent = (data.points || 0).toFixed(2);
    if (data.isEnabled === false) {
      statusText.textContent = 'Отслеживание выключено';
      statusText.style.color = 'red';
    } else {
      statusText.textContent = 'Отслеживание активно';
      statusText.style.color = 'green';
    }
    loadShopItems(data.points || 0);
  });

  // Магазин
  function loadShopItems(currentPoints) {
    if (!shopItems) return;
    shopItems.innerHTML = '';

    const items = [
      {
        id: 'kino',
        icon: '🎬',
        name: 'КИНО',
        desc: 'Укажи длительность',
        needsDuration: true,
        defaultTime: 60
      },
      {
        id: 'games',
        icon: '🎮',
        name: 'ИГРЫ',
        desc: 'Укажи время игры',
        needsDuration: true,
        defaultTime: 50
      },
      {
        id: 'dayoff',
        icon: '🏖️',
        name: 'Весь день выходного',
        desc: 'Целый день отдыха',
        cost: 1000,
        needsDuration: false
      },
      {
        id: 'food',
        icon: '🍕',
        name: 'Вкусно покушать',
        desc: 'Полакомиться',
        cost: 100,
        needsDuration: false
      }
    ];

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shop-item';
      const displayCost = item.cost || item.defaultTime;
      div.innerHTML = `
        <span class="icon">${item.icon}</span>
        <div class="info">
          <div class="name">${item.name}</div>
          <div class="desc">${item.desc}</div>
          ${item.needsDuration ? `
            <div style="margin-top:4px; display:flex; gap:4px; align-items:center;">
              <input type="number" class="time-input" id="input-${item.id}" value="${item.defaultTime}" min="1" max="300" placeholder="мин">
              <button class="set-time" data-id="${item.id}" style="padding:2px 6px;font-size:9px; background:#2196F3;">OK</button>
            </div>
          ` : ''}
        </div>
        <button 
          class="buy-btn" 
          data-item='${JSON.stringify(item)}'
          ${currentPoints < displayCost ? 'disabled' : ''}
        >
          ${displayCost}
        </button>
      `;
      shopItems.appendChild(div);
    });

    // Обработчики для установки времени (КИНО и ИГРЫ)
    document.querySelectorAll('.set-time').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.id;
        const input = document.getElementById(`input-${itemId}`);
        const newTime = parseInt(input.value, 10);
        if (newTime > 0 && newTime <= 300) {
          const item = items.find(i => i.id === itemId);
          if (item) {
            // Обновляем кнопку покупки
            const shopItem = btn.closest('.shop-item');
            const buyBtn = shopItem.querySelector('.buy-btn');
            item.currentTime = newTime;
            buyBtn.setAttribute('data-item', JSON.stringify(item));
            buyBtn.textContent = newTime; // Показываем только цифры
            // Проверяем баллы
            chrome.storage.local.get(['points'], (data) => {
              const points = data.points || 0;
              buyBtn.disabled = points < newTime;
            });
          }
        }
      });
    });

    // Обработчики покупки
    document.querySelectorAll('.buy-btn:not(.set-time)').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = JSON.parse(btn.dataset.item);
        const cost = item.cost || item.currentTime || item.defaultTime || 60;
        
        if (!confirm(`Купить "${item.name}" за ${cost} баллов?`)) return;
        
        chrome.storage.local.get(['points'], (data) => {
          const currentPoints = data.points || 0;
          if (currentPoints < cost) {
            alert('Недостаточно баллов!');
            return;
          }
          
          const newPoints = currentPoints - cost;
          chrome.storage.local.set({ points: newPoints }, () => {
            pointsDisplay.textContent = newPoints.toFixed(2);
            alert(`✅ Куплено "${item.name}" за ${cost} баллов!`);
            // Обновляем состояние кнопок
            document.querySelectorAll('.buy-btn:not(.set-time)').forEach(b => {
              const itemData = JSON.parse(b.dataset.item);
              const itemCost = itemData.cost || itemData.currentTime || itemData.defaultTime || 60;
              b.disabled = newPoints < itemCost;
            });
          });
        });
      });
    });
  }

  // Открыть настройки
  openOptions.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
