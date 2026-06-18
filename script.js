// ============================================
// ЛОГИКА – ДИСЦИПЛИНЫ, МЕТОДЫ, ДОКУМЕНТЫ
// ============================================

let currentTab = 'disciplines';
let searchQuery = '';
let currentDetailId = null;
let currentDetailType = null; // 'discipline', 'method' или 'document'

const container = document.getElementById('cards-container');
const detailContainer = document.getElementById('detail-container');
const searchInput = document.getElementById('search-input');
const resetSearchBtn = document.getElementById('reset-search');
const tabButtons = document.querySelectorAll('.tab-btn');

// --- СОБЫТИЯ ---
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  render();
});

resetSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  render();
});

tabButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    tabButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentTab = this.dataset.tab;
    currentDetailId = null;
    currentDetailType = null;
    render();
  });
});

// --- ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ---
function render() {
  if (currentDetailId !== null) {
    if (currentDetailType === 'document') {
      const doc = documents.find(d => d.id === currentDetailId);
      if (doc) {
        renderDetailDocument(doc);
        return;
      }
    } else if (currentDetailType === 'method') {
      const method = methods.find(m => m.id === currentDetailId);
      if (method) {
        renderDetailMethod(method);
        return;
      }
    } else {
      const discipline = disciplines.find(d => d.id === currentDetailId);
      if (discipline) {
        renderDetailDiscipline(discipline);
        return;
      }
    }
  }

  container.style.display = 'grid';
  detailContainer.style.display = 'none';

  if (currentTab === 'disciplines') renderDisciplines();
  else if (currentTab === 'methods') renderMethods();
  else if (currentTab === 'documents') renderDocuments();
}

// --- РЕНДЕРИНГ ДИСЦИПЛИН (карточки) ---
function renderDisciplines() {
  const filtered = disciplines.filter(d => {
    if (!searchQuery) return true;
    return d.name.toLowerCase().includes(searchQuery) ||
           d.definition.toLowerCase().includes(searchQuery) ||
           d.author_year.toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center">Ничего не найдено</p>';
    return;
  }

  let html = '';
  filtered.forEach(d => {
    html += `
      <div class="card p-4 overflow-hidden break-words" data-id="${d.id}">
        <h3 class="font-bold text-lg text-indigo-800">${d.name}</h3>
        <p class="text-sm text-slate-600">${d.author_year}</p>
        <p class="text-sm mt-2">${d.definition}</p>
        <div class="mt-3 text-xs text-slate-500">Методов: ${d.method_ids.length}, Документов: ${d.document_ids.length}</div>
      </div>
    `;
  });
  container.innerHTML = html;

  document.querySelectorAll('.card[data-id]').forEach(el => {
    el.addEventListener('click', function() {
      currentDetailId = parseInt(this.dataset.id);
      currentDetailType = 'discipline';
      render();
    });
  });
}

// --- РЕНДЕРИНГ ДЕТАЛЬНОГО ВИДА ДИСЦИПЛИНЫ ---
function renderDetailDiscipline(discipline) {
  container.style.display = 'none';
  detailContainer.style.display = 'block';

  const discMethods = methods.filter(m => discipline.method_ids.includes(m.id));
  const discDocs = documents.filter(d => discipline.document_ids.includes(d.id));

  let html = `
    <div class="detail">
      <button class="back-btn" id="back-to-list">← Назад к списку дисциплин</button>
      <h2 class="text-2xl font-black text-indigo-800">${discipline.name}</h2>
      
      <div class="border-2 border-blue-200 rounded-lg p-4 mt-3 bg-blue-50">
        <div class="space-y-2">
          <p><strong>Автор(ы), год и страна:</strong> ${discipline.author_year}</p>
          <p><strong>Цель:</strong> ${discipline.goal}</p>
          <p><strong>Этапы:</strong> ${discipline.stages}</p>
          <p><strong>Определение:</strong> ${discipline.definition}</p>
          <p><strong>Стандарты РФ:</strong> ${discipline.standards_rf}</p>
          <p><strong>Стандарты мира:</strong> ${discipline.standards_world}</p>
        </div>
      </div>

      <hr class="my-4">

      <h3 class="font-bold text-lg text-indigo-800">Методы (${discMethods.length})</h3>
      ${discMethods.map(m => `
        <div class="method-item" style="background:#e0f2fe; border:1px solid #bae6fd; padding:0.5rem 1rem; margin-bottom:0.5rem; border-radius:4px;">
          <strong class="text-indigo-800">${m.name}</strong>
          <p class="text-sm">${m.description}</p>
          ${m.examples ? `<p class="text-xs text-slate-500 italic">Пример: ${m.examples.join(', ')}</p>` : ''}
          <span class="text-xs text-slate-400">Применяется: ${m.where_applied}</span>
        </div>
      `).join('')}

      <h3 class="font-bold text-lg text-indigo-800 mt-4">Документы (${discDocs.length})</h3>
      ${discDocs.map(d => `
        <div class="doc-item" style="background:#fef3c7; border:1px solid #fde68a; padding:0.5rem 1rem; margin-bottom:0.5rem; border-radius:4px;">
          <strong class="text-indigo-800">${d.name}</strong>
          <p class="text-sm">${d.description}</p>
          ${d.examples ? `<p class="text-xs text-slate-500 italic">Пример: ${d.examples.join(', ')}</p>` : ''}
          <span class="text-xs text-slate-400">Применяется: ${d.where_applied}</span>
        </div>
      `).join('')}
    </div>
  `;

  detailContainer.innerHTML = html;

  document.getElementById('back-to-list').addEventListener('click', function() {
    detailContainer.style.display = 'none';
    container.style.display = 'grid';
    currentDetailId = null;
    currentDetailType = null;
    render();
  });
}

// --- РЕНДЕРИНГ МЕТОДОВ (только названия) ---
function renderMethods() {
  let filtered = methods.filter(m => {
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery) && !m.description.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center">Методы не найдены</p>';
    return;
  }

  let html = '';
  filtered.forEach(m => {
    html += `
      <div class="card p-4 overflow-hidden break-words method-card" data-id="${m.id}" style="cursor:pointer;">
        <h3 class="font-bold text-lg text-indigo-800">${m.name}</h3>
      </div>
    `;
  });
  container.innerHTML = html;

  document.querySelectorAll('.method-card').forEach(el => {
    el.addEventListener('click', function() {
      currentDetailId = parseInt(this.dataset.id);
      currentDetailType = 'method';
      render();
    });
  });
}

// --- РЕНДЕРИНГ ДЕТАЛЬНОГО ВИДА МЕТОДА ---
function renderDetailMethod(method) {
  container.style.display = 'none';
  detailContainer.style.display = 'block';

  let html = `
    <div class="detail">
      <button class="back-btn" id="back-to-list">← Назад к списку методов</button>
      <h2 class="text-2xl font-black text-indigo-800">${method.name}</h2>
      
      <div class="border-2 border-blue-200 rounded-lg p-4 mt-3 bg-blue-50">
        <div class="space-y-2">
          <p><strong>Описание:</strong> ${method.description}</p>
          <p><strong>Где применяется:</strong> ${method.where_applied}</p>
          ${method.examples && method.examples.length > 0 ? `
            <p><strong>Примеры:</strong></p>
            <ul class="list-disc pl-5">
              ${method.examples.map(ex => `<li class="italic">${ex}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  detailContainer.innerHTML = html;

  document.getElementById('back-to-list').addEventListener('click', function() {
    detailContainer.style.display = 'none';
    container.style.display = 'grid';
    currentDetailId = null;
    currentDetailType = null;
    render();
  });
}

// --- РЕНДЕРИНГ ДОКУМЕНТОВ (только названия) ---
function renderDocuments() {
  const filtered = documents.filter(d => {
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery) && !d.description.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center">Документы не найдены</p>';
    return;
  }

  let html = '';
  filtered.forEach(d => {
    html += `
      <div class="card p-4 overflow-hidden break-words document-card" data-id="${d.id}" style="cursor:pointer;">
        <h3 class="font-bold text-lg text-indigo-800">${d.name}</h3>
      </div>
    `;
  });
  container.innerHTML = html;

  document.querySelectorAll('.document-card').forEach(el => {
    el.addEventListener('click', function() {
      currentDetailId = parseInt(this.dataset.id);
      currentDetailType = 'document';
      render();
    });
  });
}

// --- РЕНДЕРИНГ ДЕТАЛЬНОГО ВИДА ДОКУМЕНТА ---
function renderDetailDocument(doc) {
  container.style.display = 'none';
  detailContainer.style.display = 'block';

  let html = `
    <div class="detail">
      <button class="back-btn" id="back-to-list">← Назад к списку документов</button>
      <h2 class="text-2xl font-black text-indigo-800">${doc.name}</h2>
      
      <div class="border-2 border-blue-200 rounded-lg p-4 mt-3 bg-blue-50">
        <div class="space-y-2">
          <p><strong>Описание:</strong> ${doc.description}</p>
          <p><strong>Где применяется:</strong> ${doc.where_applied}</p>
          ${doc.examples && doc.examples.length > 0 ? `
            <p><strong>Примеры:</strong></p>
            <ul class="list-disc pl-5">
              ${doc.examples.map(ex => `<li class="italic">${ex}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  detailContainer.innerHTML = html;

  document.getElementById('back-to-list').addEventListener('click', function() {
    detailContainer.style.display = 'none';
    container.style.display = 'grid';
    currentDetailId = null;
    currentDetailType = null;
    render();
  });
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', function() {
  render();
});
