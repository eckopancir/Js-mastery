// Content script (версия 3.0 - 1 балл в минуту)

(function() {
  'use strict';

  const WIDGET_ID = 'game-points-widget';
  const CHART_COLORS = [
    '#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0',
    '#00BCD4', '#FF5722', '#607D8B', '#E91E63', '#3F51B5'
  ];
   let updateInterval = null;
   let preciseInterval = null;
   let isPreciseMode = false;
   let preciseStartBalance = 0;
   let preciseStartTime = 0;
   let isDragging = false;
   let startX = 0;
   let startY = 0;
   let initialLeft = 0;
   let initialTop = 0;

  function getSiteName(hostname) {
    let name = hostname;
    if (name.startsWith('www.')) {
      name = name.substring(4);
    }
    const parts = name.split('.');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (/^[a-z]+$/.test(lastPart) && lastPart.length <= 4) {
        parts.pop();
        return parts.join('.');
      }
    }
    return name;
  }

  function initWidget() {
    // Глобальный обработчик получения XP от сайта
    window.addEventListener('message', function(event) {
      if (event.data.type !== 'SEND_XP_TO_EXTENSION' || event.data.source !== 'js-mastery-site') {
        return;
      }
      if (!chrome || !chrome.runtime || !chrome.runtime.id) return;
      var xpFromSite = event.data.xp;
      if (!xpFromSite || xpFromSite <= 0) return;
      console.log('[Extension] Получено ' + xpFromSite + ' XP от сайта');
      try {
        chrome.storage.local.get(['points'], function(data) {
          if (chrome.runtime.lastError) {
            console.error('[Extension] Ошибка чтения:', chrome.runtime.lastError);
            return;
          }
          var newPoints = (data.points || 0) + xpFromSite;
          chrome.storage.local.set({ points: newPoints }, function() {
            if (chrome.runtime.lastError) {
              console.error('[Extension] Ошибка записи:', chrome.runtime.lastError);
              return;
            }
            try {
              if (typeof updateBalance === 'function') updateBalance();
              window.postMessage({
                type: 'XP_RECEIVED_BY_EXTENSION',
                success: true,
                points: newPoints
              }, '*');
              console.log('[Extension] Баллы обновлены: ' + newPoints);
            } catch(e) {
              console.error('[Extension] Ошибка в колбэке:', e);
            }
          });
        });
      } catch(e) {
        console.error('[Extension] Критическая ошибка:', e);
      }
    });

    if (document.getElementById(WIDGET_ID)) return;

    const style = document.createElement('style');
    style.textContent = `
       #${WIDGET_ID} {
         position: fixed !important;
         width: 160px !important;
         background: rgba(40, 44, 52, 0.95) !important;
         color: white !important;
         border-radius: 8px !important;
         padding: 8px !important;
         font-family: 'Segoe UI', Arial, sans-serif !important;
         font-size: 11px !important;
         box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
         z-index: 2147483647 !important;
         cursor: default !important;
         user-select: none !important;
         transition: width 0.3s, padding 0.3s !important;
       }
       #${WIDGET_ID}.expanded {
         width: 240px !important;
       }
       #${WIDGET_ID} .top-row {
         display: flex !important;
         align-items: center !important;
         justify-content: space-between !important;
         margin-bottom: 6px !important;
         cursor: move !important;
       }
       #${WIDGET_ID} .site {
         flex: 1 !important;
         overflow: hidden !important;
         text-overflow: ellipsis !important;
         white-space: nowrap !important;
         font-weight: bold !important;
         font-size: 12px !important;
       }
       #${WIDGET_ID} .points {
         font-weight: bold !important;
         font-size: 14px !important;
         margin-right: 5px !important;
         color: #4CAF50 !important;
       }
       #${WIDGET_ID} .controls {
         display: flex !important;
         gap: 6px !important;
       }
       #${WIDGET_ID} .controls span {
         cursor: pointer !important;
         opacity: 0.7 !important;
         font-size: 12px !important;
         padding: 0 2px !important;
       }
       #${WIDGET_ID} .controls span:hover { opacity: 1 !important; }
       
       /* Анимация */
       #${WIDGET_ID} .animation {
         position: absolute !important;
         top: -12px !important;
         right: 5px !important;
         font-size: 12px !important;
         font-weight: bold !important;
         color: #ffeb3b !important;
         opacity: 0 !important;
         transition: all 0.5s ease !important;
         pointer-events: none !important;
       }
       #${WIDGET_ID} .animation.show {
         opacity: 1 !important;
         transform: translateY(-8px) !important;
       }
       #${WIDGET_ID}.hidden { display: none !important; }
       
       /* История трат */
       #${WIDGET_ID} .history-panel {
         max-height: 0 !important;
         overflow: hidden !important;
         transition: max-height 0.3s ease !important;
         margin-top: 8px !important;
         border-top: 1px solid rgba(255,255,255,0.1) !important;
         padding-top: 0 !important;
       }
       #${WIDGET_ID} .history-panel.open {
         max-height: 350px !important;
         padding-top: 8px !important;
         overflow: visible !important;
       }
       #${WIDGET_ID} .history-header {
         font-size: 10px !important;
         opacity: 0.7 !important;
         margin-bottom: 5px !important;
         text-transform: uppercase;
       }
       #${WIDGET_ID} .history-list {
         max-height: 120px !important;
         overflow-y: auto !important;
         margin-bottom: 8px !important;
       }
       #${WIDGET_ID} .history-item {
         display: flex !important;
         justify-content: space-between !important;
         align-items: center !important;
         font-size: 10px !important;
         padding: 3px 0 !important;
         border-bottom: 1px solid rgba(255,255,255,0.05) !important;
       }
       #${WIDGET_ID} .history-item .color-dot {
         width: 8px !important;
         height: 8px !important;
         border-radius: 50% !important;
         margin-right: 5px !important;
         flex-shrink: 0 !important;
       }
       #${WIDGET_ID} .history-item .site-name {
         flex: 1 !important;
         overflow: hidden !important;
         text-overflow: ellipsis !important;
         white-space: nowrap !important;
       }
       #${WIDGET_ID} .history-item.current {
         color: #4CAF50 !important;
         font-weight: bold !important;
       }
       #${WIDGET_ID} .history-total {
         font-size: 11px !important;
         font-weight: bold !important;
         border-top: 1px solid rgba(255,255,255,0.1) !important;
         padding-top: 5px !important;
         text-align: right !important;
         margin-bottom: 5px !important;
       }
       #${WIDGET_ID} #gpwChart {
         display: block !important;
         margin: 5px auto 0 !important;
         max-width: 100% !important;
       }
     `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    // Скрываем по умолчанию, пока не проверим storage
    widget.classList.add('hidden');
    widget.innerHTML = `
      <div class="top-row" id="gpwHeader">
        <span class="site" id="gpwSite">${getSiteName(window.location.hostname)}</span>
        <div class="controls">
          <span id="gpwHistoryBtn" title="История трат">📊</span>
          <span class="points" id="gpwPoints">0</span>
          <span id="gpwClose" title="Скрыть">×</span>
        </div>
      </div>
      <div class="history-panel" id="gpwHistory">
        <div class="history-header">ИСТОРИЯ ТРАТ ЗА СЕГОДНЯ:</div>
        <div class="history-list" id="gpwHistoryList"></div>
        <div class="history-total" id="gpwHistoryTotal"></div>
        <canvas id="gpwChart" width="180" height="180"></canvas>
      </div>
      <div class="animation" id="gpwAnimation"></div>
    `;

    document.body.appendChild(widget);

     if (isExtensionContextValid()) {
       chrome.storage.local.get(['widgetPosition'], function(data) {
         if (!isExtensionContextValid()) return;
         if (data.widgetPosition) {
           widget.style.left = data.widgetPosition.left + 'px';
           widget.style.top = data.widgetPosition.top + 'px';
           widget.style.right = 'auto';
           widget.style.bottom = 'auto';
         } else {
           widget.style.right = '20px';
           widget.style.bottom = '20px';
           widget.style.left = 'auto';
           widget.style.top = 'auto';
         }
         // Всегда показываем виджет при загрузке страницы
         widget.classList.remove('hidden');
       });
     } else {
       widget.classList.remove('hidden');
     }

    // Drag & Drop
    const header = document.getElementById('gpwHeader');
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    function startDrag(e) {
      if (['gpwHistoryBtn', 'gpwClose', 'gpwPoints'].includes(e.target.id)) return;
      isDragging = true;
      const rect = widget.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
      widget.style.left = rect.left + 'px';
      widget.style.top = rect.top + 'px';
      widget.style.opacity = '0.7';
      e.preventDefault();
    }

    function doDrag(e) {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      let newX = initialLeft + deltaX;
      let newY = initialTop + deltaY;
       const maxX = window.innerWidth - widget.offsetWidth;
       const maxY = window.innerHeight - widget.offsetHeight;
       newX = Math.max(0, Math.min(newX, maxX));
       newY = Math.max(0, Math.min(newY, maxY));
      widget.style.left = newX + 'px';
      widget.style.top = newY + 'px';
    }

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      widget.style.opacity = '1';
      const rect = widget.getBoundingClientRect();
      chrome.storage.local.set({ widgetPosition: { left: rect.left, top: rect.top } });
    }

    // History toggle
    document.getElementById('gpwHistoryBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      var history = document.getElementById('gpwHistory');
      var isHistoryOpen = history.classList.contains('open');
      
      if (!isHistoryOpen) {
        widget.classList.add('expanded');
        history.classList.add('open');
        loadHistoryData();
      } else {
        history.classList.remove('open');
        widget.classList.remove('expanded');
      }
    });

    // Close (состояние не сохраняем, виджет появится снова после перезагрузки)
    document.getElementById('gpwClose').addEventListener('click', function(e) {
      e.stopPropagation();
      widget.classList.add('hidden');
    });

    // Переключение точного режима по клику на баллы
    document.getElementById('gpwPoints').addEventListener('click', (e) => {
      e.stopPropagation();
      isPreciseMode = !isPreciseMode;
      if (isPreciseMode) {
        chrome.storage.local.get(['points'], (data) => {
          preciseStartBalance = data.points || 0;
          preciseStartTime = Date.now();
          updatePreciseBalance();
          preciseInterval = setInterval(updatePreciseBalance, 1000);
        });
      } else {
        if (preciseInterval) {
          clearInterval(preciseInterval);
          preciseInterval = null;
        }
        updateBalance();
      }
    });

    // Fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        widget.dataset.fullscreenHidden = 'true';
        widget.classList.add('hidden');
      } else {
        if (widget.dataset.fullscreenHidden === 'true') {
          delete widget.dataset.fullscreenHidden;
          widget.classList.remove('hidden');
        }
      }
    });

    // Messages from background
    chrome.runtime.onMessage.addListener(function(message) {
      if (message.type === 'DEDUCTION') {
        const amount = Number(message.amount).toFixed(2);
        showAnimation(amount);
        if (isPreciseMode) {
          preciseStartBalance -= parseFloat(amount);
          preciseStartTime = Date.now();
        }
      }
    });



        // Безопасный вызов updateBalance с задержкой для SPA
        try {
          if (!isExtensionContextValid()) {
            return;
          }
          // Используем setTimeout чтобы дать странице стабилизироваться
          setTimeout(() => {
            try {
              if (!isExtensionContextValid()) {
                cleanupOnContextLost();
                return;
              }
              updateBalance();
            } catch (e) {
              console.error('[Extension] Ошибка отложенного вызова:', e);
              cleanupOnContextLost();
            }
          }, 100);
        } catch (e) {
          console.error('[Extension] Ошибка инициализации:', e);
          return;
        }

       updateInterval = setInterval(() => {
         try {
           if (!isExtensionContextValid()) {
             cleanupOnContextLost();
             return;
           }
           // Повторная проверка перед вызовом
           if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
             cleanupOnContextLost();
             return;
           }
           updateBalance();
         } catch (e) {
           console.error('[Extension] Ошибка в интервале:', e);
           cleanupOnContextLost();
         }
       }, 2000);
   }

   function updateBalance() {
     try {
       if (!isExtensionContextValid()) {
         cleanupOnContextLost();
         return;
       }
       const widget = document.getElementById(WIDGET_ID);
       if (!widget) {
         cleanupOnContextLost();
         return;
       }
       const pointsEl = widget.querySelector('#gpwPoints');
       const siteEl = widget.querySelector('#gpwSite');
       if (!pointsEl || !siteEl) {
         cleanupOnContextLost();
         return;
       }
       siteEl.textContent = getSiteName(window.location.hostname) || 'Unknown';
       
       // Дополнительная проверка перед асинхронным вызовом
       if (!isExtensionContextValid()) {
         cleanupOnContextLost();
         return;
       }
       
       // Безопасный вызов chrome.storage
       try {
         if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
           cleanupOnContextLost();
           return;
         }
         chrome.storage.local.get(['points'], (data) => {
           try {
             if (chrome.runtime && chrome.runtime.lastError) {
               console.error('[Extension] Ошибка storage:', chrome.runtime.lastError);
               return;
             }
             if (!isExtensionContextValid()) return;
             const currentWidget = document.getElementById(WIDGET_ID);
             if (!currentWidget) return;
             const currentPointsEl = currentWidget.querySelector('#gpwPoints');
             if (currentPointsEl) {
               currentPointsEl.textContent = ((data && data.points) || 0).toFixed(2);
             }
           } catch (e) {
             console.error('[Extension] Ошибка в колбэке обновления баллов:', e);
           }
         });
       } catch (e) {
         console.error('[Extension] Ошибка вызова chrome.storage:', e);
         cleanupOnContextLost();
       }
     } catch (e) {
       console.error('[Extension] Ошибка в updateBalance:', e);
       cleanupOnContextLost();
     }
   }

   function updatePreciseBalance() {
     if (!isExtensionContextValid()) {
       cleanupOnContextLost();
       return;
     }
     const pointsEl = document.getElementById('gpwPoints');
     if (!pointsEl) return;
     const elapsedSec = (Date.now() - preciseStartTime) / 1000;
     const currentPrecise = preciseStartBalance - (elapsedSec / 60);
     pointsEl.textContent = Math.max(0, currentPrecise).toFixed(2);
   }

   function showAnimation(amount) {
    const animEl = document.getElementById('gpwAnimation');
    if (!animEl) return;
    animEl.textContent = `-${Number(amount).toFixed(2)}`;
    animEl.classList.add('show');
    setTimeout(() => { animEl.classList.remove('show'); }, 1000);
  }

   function getHistoryItemName(key) {
     if (key.includes('|')) {
       const [domain, pathFilter] = key.split('|');
       if (pathFilter === '/shorts/') return 'YouTube Shorts';
       return getSiteName(domain) + ' (' + pathFilter + ')';
     }
     return getSiteName(key);
   }

   function loadHistoryData() {
    if (!isExtensionContextValid()) return;

    const historyList = document.getElementById('gpwHistoryList');
    const historyTotal = document.getElementById('gpwHistoryTotal');
    const canvas = document.getElementById('gpwChart');
    if (!historyList || !historyTotal || !canvas) return;
    
    historyList.innerHTML = '';
    historyTotal.textContent = '';
    
    chrome.storage.local.get(['trackedSites', 'currentDaySpends'], (data) => {
      if (!isExtensionContextValid()) return;

      const trackedSites = data.trackedSites || [];
      const currentDaySpends = data.currentDaySpends || {};
      
      const historyItems = Object.keys(currentDaySpends).map(key => {
        const amount = currentDaySpends[key] || 0;
        if (amount <= 0) return null;
        
        let isCurrent = false;
        if (key.includes('|')) {
          const [domain, pathFilter] = key.split('|');
          isCurrent = window.location.hostname.includes(domain) && window.location.pathname.includes(pathFilter);
        } else {
          isCurrent = window.location.hostname.includes(key);
        }
        
        return { key, amount, isCurrent };
      }).filter(item => item !== null);
      
      historyItems.sort((a, b) => b.amount - a.amount);
      
      let total = 0;
      historyItems.forEach((item, index) => {
        total += item.amount;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const div = document.createElement('div');
        div.className = `history-item ${item.isCurrent ? 'current' : ''}`;
        div.innerHTML = `
          <span class="color-dot" style="background: ${color};"></span>
          <span class="site-name">${getHistoryItemName(item.key)}</span>
          <span>${Number(item.amount).toFixed(2)} баллов</span>
        `;
        historyList.appendChild(div);
      });
      
      historyTotal.textContent = `ИТОГО: ${Number(total).toFixed(2)} баллов`;
      
      // Отрисовка круговой диаграммы
      drawPieChart(canvas, historyItems, total);
    });
  }

   function drawPieChart(canvas, items, total) {
     const ctx = canvas.getContext('2d');
     const width = canvas.width;
     const height = canvas.height;
     const centerX = width / 2;
     const centerY = height / 2;
     const radius = Math.min(centerX, centerY) - 10;

     ctx.clearRect(0, 0, width, height);

     if (total === 0 || items.length === 0) {
       ctx.fillStyle = '#666';
       ctx.font = '12px Arial';
       ctx.textAlign = 'center';
       ctx.fillText('Нет трат за сегодня', centerX, centerY);
       return;
     }

     let startAngle = -Math.PI / 2;
     for (let i = 0; i < items.length; i++) {
       const item = items[i];
       const sliceAngle = (item.amount / total) * 2 * Math.PI;
       const color = CHART_COLORS[i % CHART_COLORS.length];

       ctx.beginPath();
       ctx.moveTo(centerX, centerY);
       ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
       ctx.closePath();
       ctx.fillStyle = color;
       ctx.fill();

       startAngle += sliceAngle;
     }

     // Круг в центре (donut chart)
     ctx.beginPath();
     ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
     ctx.fillStyle = 'rgba(40, 44, 52, 0.92)';
     ctx.fill();

     // Текст в центре
     ctx.fillStyle = '#fff';
     ctx.font = 'bold 14px Arial';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText(Number(total).toFixed(2), centerX, centerY - 8);
     ctx.font = '9px Arial';
     ctx.fillText('баллов', centerX, centerY + 8);
   }

  function shouldInitializeWidget(callback) {
    chrome.storage.local.get(['trackedSites', 'isEnabled'], (data) => {
      const isEnabled = data.isEnabled !== false;
      if (!isEnabled) {
        callback(false);
        return;
      }
      
      const trackedSites = data.trackedSites || [];
      const currentHostname = window.location.hostname;
      const currentPathname = window.location.pathname;
      
      const matchedSite = trackedSites.find(site => {
        if (!site.enabled) return false;
        if (!currentHostname.includes(site.domain)) return false;
        if (site.pathFilter) {
          return currentPathname.includes(site.pathFilter);
        }
        return true;
      });
      
      callback(!!matchedSite);
    });
  }

  shouldInitializeWidget((shouldInit) => {
    const isJsMastery = window.location.pathname.includes('/js-mastery/') ||
                        window.location.hostname.includes('localhost') ||
                        window.location.hostname.includes('127.0.0.1');
    
    if (!shouldInit && !isJsMastery) {
      console.log('[Extension] Сайт не отслеживается, виджет не создается');
      return;
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
    } else {
      initWidget();
    }
  });

   // Проверка валидности контекста расширения
   function isExtensionContextValid() {
     try {
       return !!(chrome && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.local);
     } catch (e) {
       return false;
     }
   }

   // Очистка интервалов при потере контекста
   function cleanupOnContextLost() {
     if (updateInterval) {
       clearInterval(updateInterval);
       updateInterval = null;
     }
     if (preciseInterval) {
       clearInterval(preciseInterval);
       preciseInterval = null;
     }
     const widget = document.getElementById(WIDGET_ID);
     if (widget) {
       widget.remove();
     }
   }

   // Защита от повторной инициализации
   if (window.GAME_POINTS_WIDGET_INITIALIZED) {
     console.log('[Extension] Виджет уже инициализирован, пропускаем');
     return;
   }
   window.GAME_POINTS_WIDGET_INITIALIZED = true;

  // Переопределяем интервалы с проверкой контекста
  const originalUpdateInterval = updateInterval;
  function safeSetInterval(fn, delay) {
    return setInterval(() => {
      if (!isExtensionContextValid()) {
        cleanupOnContextLost();
        return;
      }
      fn();
    }, delay);
  }

  // Патчим updateBalance с проверкой контекста
  const originalUpdateBalance = updateBalance;
  // Будет переопределена ниже

  // Очистка интервалов при выгрузке страницы
  window.addEventListener('beforeunload', cleanupOnContextLost);
})();
