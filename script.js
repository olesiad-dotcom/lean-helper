/**
 * ==========================================
 * SCRIPT.JS — Интерактивный интерактор данных
 * ==========================================
 * Этот файл управляет вкладками, поиском по ключевым словам,
 * раскрытием деталей методов и подбором инструментов.
 */

// 1. Глобальное состояние приложения
const APP_STATE = {
  activeTab: 'disciplines',      // Текущая активная вкладка: 'disciplines' | 'methods' | 'documents'
  searchQuery: '',              // Текст поискового запроса пользователя
  selectedDisciplineSlug: 'all', // Фильтр методов по конкретной дисциплине
  expandedMethods: new Set()    // Множество ID раскрытых методов (для спойлеров)
};

// 2. Инициализация после полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
  initFilter();
  render(); // Первичная отрисовка данных
});

// 3. Управление вкладками (Tabs)
function initTabs() {
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Клик по кнопке меняет активную вкладку в состоянии
      APP_STATE.activeTab = e.currentTarget.getAttribute('data-tab-target');
      
      // Сбрасываем фильтры при переходе между разделами
      APP_STATE.searchQuery = '';
      APP_STATE.selectedDisciplineSlug = 'all';
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = '';
      
      // Обновляем визуальный стиль кнопок вкладок
      tabButtons.forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white', 'shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]');
        btn.classList.add('bg-white', 'text-slate-850');
      });
      
      e.currentTarget.classList.remove('bg-white', 'text-slate-850');
      e.currentTarget.classList.add('bg-slate-900', 'text-white', 'shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]');
      
      // Отрендерить содержимое заново
      render();
    });
  });
}

// 4. Поиск по ключевым словам в реальном времени
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    APP_STATE.searchQuery = e.target.value.trim().toLowerCase();
    render();
  });

  // Логика кнопки сброса поиска
  const resetBtn = document.getElementById('reset-search-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      APP_STATE.searchQuery = '';
      render();
    });
  }
}

// 5. Инициализация селектора дисциплин в разделе «Методы»
function initFilter() {
  const disciplineSelect = document.getElementById('discipline-filter-select');
  if (!disciplineSelect) return;

  disciplineSelect.addEventListener('change', (e) => {
    APP_STATE.selectedDisciplineSlug = e.target.value;
    render();
  });
}

// 6. Главная функция отрисовки (Render Engine)
function render() {
  const container = document.getElementById('content-display-area');
  const filterPanel = document.getElementById('active-filters-panel');
  if (!container) return;

  // Очищаем контейнер перед генерацией новых карточек
  container.innerHTML = '';

  // Показываем или скрываем селектор дисциплин в зависимости от вкладки
  if (filterPanel) {
    if (APP_STATE.activeTab === 'methods') {
      filterPanel.classList.remove('hidden');
    } else {
      filterPanel.classList.add('hidden');
    }
  }

  // Роутинг отрисовки в зависимости от активной вкладки
  if (APP_STATE.activeTab === 'disciplines') {
    renderDisciplines(container);
  } else if (APP_STATE.activeTab === 'methods') {
    renderMethods(container);
  } else if (APP_STATE.activeTab === 'documents') {
    renderDocuments(container);
  }
}

// ================= МЕТОДЫ ГЕНЕРАЦИИ HTML ДЛЯ КАРТОЧЕК =================

// А. Отрисовка теоретических Дисциплин
function renderDisciplines(container) {
  // Фильтрация disciplines (из data.js) по поисковой строке
  const filtered = disciplines.filter(d => {
    const query = APP_STATE.searchQuery;
    return !query || 
      d.name.toLowerCase().includes(query) || 
      d.definition.toLowerCase().includes(query) ||
      d.author_year.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    renderEmptyState(container);
    return;
  }

  filtered.forEach(disc => {
    const card = document.createElement('div');
    card.className = "bg-white border-4 border-slate-900 p-5 relative overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all";
    card.innerHTML = `
      <div class="absolute top-0 right-0 w-16 h-16 bg-slate-900 text-white rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1 font-mono text-[9px] font-bold">
        QM
      </div>
      <div>
        <div class="text-[10px] font-mono font-bold text-slate-400 mb-1 uppercase">id: ${disc.slug}</div>
        <h4 class="text-base font-black uppercase text-slate-950 tracking-tight mb-2 italic">${disc.name}</h4>
        <div class="bg-slate-50 border border-slate-250 p-2.5 font-mono text-[10px] text-teal-700 leading-tight mb-3">
          <span class="font-extrabold block">АВТОРЫ & КОРНИ:</span> ${disc.author_year}
        </div>
        <p class="text-xs text-slate-600 leading-relaxed text-justify mb-4">${disc.definition}</p>
      </div>
      <div class="border-t border-slate-200 pt-3">
        <span class="text-[10px] font-mono text-slate-500 block">Инструментов в базе: ${disc.method_ids.length}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Б. Отрисовка практических Методов (с гармошкой-аккордеоном)
function renderMethods(container) {
  // Фильтрация методов (из data.js) по поисковому запросу и селектору дисциплин
  const filtered = methods.filter(m => {
    const matchQuery = !APP_STATE.searchQuery || 
      m.name.toLowerCase().includes(APP_STATE.searchQuery) ||
      m.description.toLowerCase().includes(APP_STATE.searchQuery) ||
      m.where_applied.toLowerCase().includes(APP_STATE.searchQuery);

    if (APP_STATE.selectedDisciplineSlug === 'all') return matchQuery;

    // Находим дисциплину по slug
    const currentDisc = disciplines.find(d => d.slug === APP_STATE.selectedDisciplineSlug);
    if (!currentDisc) return matchQuery;

    // Проверяем, привязан ли метод к ней в data.js
    const isLinked = currentDisc.method_ids.includes(m.id);
    return matchQuery && isLinked;
  });

  if (filtered.length === 0) {
    renderEmptyState(container);
    return;
  }

  filtered.forEach(method => {
    const isExpanded = APP_STATE.expandedMethods.has(method.id);
    const card = document.createElement('div');
    card.className = `bg-white border-2 transition-all ${isExpanded ? 'border-slate-900 bg-slate-50/50 shadow-[#10B981_3px_3px_0px_0px]' : 'border-slate-300 hover:border-slate-900'}`;
    
    // Header спойлера метода
    card.innerHTML = `
      <div class="p-4 flex items-start justify-between cursor-pointer select-none" onclick="toggleMethodExpand(${method.id})">
        <div class="flex items-start gap-4">
          <span class="shrink-0 w-8 h-8 rounded-none bg-slate-900 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-slate-900">
            ${String(method.id).padStart(2, '0')}
          </span>
          <div>
            <h4 class="text-base font-black uppercase text-slate-900 tracking-tight">${method.name}</h4>
            <p class="text-xs text-slate-500 mt-0.5">Внедряется в: <span class="font-mono text-emerald-600 font-bold">${method.where_applied}</span></p>
          </div>
        </div>
        <div class="text-slate-900 text-sm font-bold bg-slate-100 border px-2 py-1">
          ${isExpanded ? '▲ СВЕРНУТЬ' : '▼ ПОДРОБНЕЕ'}
        </div>
      </div>
    `;

    // Тело спойлера (если раскрыто)
    if (isExpanded) {
      const detailsDiv = document.createElement('div');
      detailsDiv.className = "px-5 pb-5 pt-3 border-t-2 border-slate-200 bg-white space-y-4";
      
      let examplesHTML = '';
      if (method.examples && method.examples.length > 0) {
        examplesHTML = `
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-2">Примеры реализации:</span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${method.examples.map((ex, idx) => `
                <div class="bg-emerald-50/50 p-3 border-l-4 border-emerald-500 text-xs text-slate-700 leading-relaxed">
                  <span class="font-mono text-emerald-700 font-extrabold block text-[9px] uppercase mb-1">КЕЙС №${idx + 1}:</span>
                  ${ex}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      detailsDiv.innerHTML = `
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">Описание и логика:</span>
          <p class="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50 p-3 border border-slate-200">${method.description}</p>
        </div>
        ${examplesHTML}
      `;
      card.appendChild(detailsDiv);
    }

    container.appendChild(card);
  });
}

// Изменение состояния раскрытия отдельного метода
window.toggleMethodExpand = function(id) {
  if (APP_STATE.expandedMethods.has(id)) {
    APP_STATE.expandedMethods.delete(id);
  } else {
    APP_STATE.expandedMethods.add(id);
  }
  render();
};

// В. Отрисовка шаблонов Документов
function renderDocuments(container) {
  const filtered = documents.filter(doc => {
    const query = APP_STATE.searchQuery;
    return !query || 
      doc.name.toLowerCase().includes(query) || 
      doc.description.toLowerCase().includes(query) || 
      doc.where_applied.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    renderEmptyState(container);
    return;
  }

  filtered.forEach(doc => {
    const card = document.createElement('div');
    card.className = "bg-white border-4 border-slate-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between";
    card.innerHTML = `
      <div class="p-4 bg-slate-900 text-white flex items-start gap-3">
        <span class="p-1.5 bg-emerald-500 text-slate-950 font-bold rounded-none shrink-0 font-mono text-xs">
          ${String(doc.id).padStart(2, '0')}
        </span>
        <div>
          <h4 class="text-sm font-black uppercase tracking-tight italic text-emerald-300 mb-0.5">${doc.name}</h4>
          <p class="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Где внедрять: ${doc.where_applied}</p>
        </div>
      </div>
      <div class="p-5 space-y-4 flex-1">
        <div>
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Назначение регламента и структура:</span>
          <p class="text-xs text-slate-600 leading-relaxed text-justify">${doc.description}</p>
        </div>
        <div class="pt-3 border-t border-slate-100">
          <span class="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-2">Примеры реализации форм:</span>
          <div class="space-y-2">
            ${doc.examples.map(ex => `
              <div class="text-xs text-slate-755 bg-slate-50 p-2.5 border border-slate-200 pl-4 relative">
                <span class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></span>
                ${ex}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Заглушка, если ничего не найдено по поисковому запросу
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="col-span-full text-center py-12 px-4 bg-white border-2 border-slate-900 max-w-sm mx-auto shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mt-6">
      <h4 class="text-sm font-black uppercase text-slate-900 mb-1">Ничего не найдено</h4>
      <p class="text-xs text-slate-500">Попробуйте ввести другие ключевые слова или сбросить фильтры.</p>
    </div>
  `;
}