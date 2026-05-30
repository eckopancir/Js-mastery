// Background.js (версия 3.0 - 1 балл в минуту)

function getStorageData(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result));
  });
}

function setStorageData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

function getSiteSettings(url, sites) {
  if (!url || !sites || sites.length === 0) return null;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Находим все правила для данного домена
    const domainSites = sites.filter(site => 
      hostname.includes(site.domain) && site.enabled !== false
    );
    
    if (domainSites.length === 0) return null;
    
    // Сначала ищем точное совпадение с pathFilter
    let matchedSite = domainSites.find(site => 
      site.pathFilter && pathname.includes(site.pathFilter)
    );
    
    // Если не нашли, берем первое правило без pathFilter
    if (!matchedSite) {
      matchedSite = domainSites.find(site => !site.pathFilter);
    }
    
    // Если и такого нет, берем первое попавшееся
    if (!matchedSite && domainSites.length > 0) {
      matchedSite = domainSites[0];
    }
    
    return matchedSite;
  } catch (e) {
    return null;
  }
}

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function ensureTodaySpends() {
  const data = await getStorageData(['spendDate', 'currentDaySpends']);
  const today = getTodayDateString();
  if (data.spendDate !== today) {
    await setStorageData({
      spendDate: today,
      currentDaySpends: {}
    });
  }
}

async function checkAndDeduct() {
  try {
    const tabs = await new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, resolve));
    if (tabs.length === 0) return;

    const currentTab = tabs[0];
    if (!currentTab.url || currentTab.url.startsWith('chrome://')) return;

    const data = await getStorageData(['points', 'trackedSites', 'isEnabled']);
    const points = data.points || 0;
    const sites = data.trackedSites || [];
    const isEnabled = data.isEnabled !== false;

    if (!isEnabled) return;

    const siteSettings = getSiteSettings(currentTab.url, sites);
    if (!siteSettings) return;

    const costPerMinute = siteSettings.costPerMinute || 1;

    if (points >= costPerMinute) {
      const newPoints = Math.max(0, points - costPerMinute);
      await setStorageData({ points: parseFloat(newPoints.toFixed(2)) });
      console.log(`[Extension] Списано ${costPerMinute} баллов. Остаток: ${newPoints}`);

      // Записываем трату в историю за день
      await ensureTodaySpends();
      const spendsData = await getStorageData(['currentDaySpends']);
      let siteKey = siteSettings.domain;
      if (siteSettings.pathFilter) {
        siteKey = `${siteSettings.domain}|${siteSettings.pathFilter}`;
      }
      const updatedSpends = spendsData.currentDaySpends || {};
      updatedSpends[siteKey] = (updatedSpends[siteKey] || 0) + costPerMinute;
      await setStorageData({ currentDaySpends: updatedSpends });

      chrome.tabs.sendMessage(currentTab.id, { 
        type: 'DEDUCTION', 
        amount: costPerMinute 
      }).catch(e => console.log('Content script not ready:', e.message));
    } else {
      console.log('[Extension] Недостаточно баллов, блокировка.');
      chrome.tabs.update(currentTab.id, { url: chrome.runtime.getURL('blocked.html') });
    }
  } catch (error) {
    console.error('[Extension] Ошибка в checkAndDeduct:', error);
  }
}

function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith(chrome.runtime.getURL(''))) return;

  getStorageData(['points', 'trackedSites', 'isEnabled']).then(data => {
    const points = data.points || 0;
    const sites = data.trackedSites || [];
    const isEnabled = data.isEnabled !== false;

    if (!isEnabled) return;

    const siteSettings = getSiteSettings(tab.url, sites);
    if (!siteSettings) return;

    if (points <= 0) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') });
    }
  }).catch(error => console.error('[Extension] Ошибка в handleTabUpdate:', error));
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Extension] Установка/Обновление');
  chrome.storage.local.get(['points', 'trackedSites', 'isEnabled', 'spendDate', 'currentDaySpends'], (data) => {
    const defaults = {};
    if (data.points === undefined) defaults.points = 0;
    if (data.trackedSites === undefined) defaults.trackedSites = [
      { domain: 'youtube.com', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'youtube.com', costPerMinute: 5, enabled: true, pathFilter: '/shorts/' },
      { domain: 'twitch.tv', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'dtf.ru', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'coub.com', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'pikabu.ru', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'ozon.ru', costPerMinute: 1, enabled: true, pathFilter: null },
      { domain: 'wildberries.ru', costPerMinute: 1, enabled: true, pathFilter: null }
    ];
    if (data.isEnabled === undefined) defaults.isEnabled = true;
    if (data.spendDate === undefined) defaults.spendDate = getTodayDateString();
    if (data.currentDaySpends === undefined) defaults.currentDaySpends = {};
    if (Object.keys(defaults).length > 0) {
      setStorageData(defaults);
    }
  });
});

chrome.tabs.onUpdated.addListener(handleTabUpdate);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addPoints') {
    getStorageData(['points']).then(data => {
      const newPoints = (data.points || 0) + request.amount;
      setStorageData({ points: newPoints }).then(() => sendResponse({ success: true, points: newPoints }));
    });
    return true;
  }
  if (request.action === 'forceCheck') {
    checkAndDeduct();
    return true;
  }
});

// РЕЖИМ: 1 балл в минуту
console.log('[Extension] Background script запущен. РЕЖИМ: 1 балл в минуту.');
// Проверка сохранности баллов при запуске
chrome.storage.local.get(['points'], (data) => {
  console.log(`[Extension] Загружено баллов при запуске: ${data.points || 0}`);
});

// Используем alarms вместо setInterval (надежнее в service worker)
chrome.alarms.create('checkAndDeduct', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkAndDeduct') {
    checkAndDeduct();
  }
});
