import { loadProgress, getStatus } from '../store.js';
import { sortByOrder, sortByYear, sortByTitle, sortByPriority, sortByDuration } from '../utils.js';

let openModal = () => {};
let openForm = () => {};

export function setModalHandler(handler) {
  openModal = handler;
}

export function setFormHandler(handler) {
  openForm = handler;
}

export function renderCatalog(data, filters = {}) {
  const container = document.getElementById('catalog-container');
  const progress = loadProgress();

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>Catálogo Vazio</h3>
        <p>Nenhuma produção registrada. Clique em "Adicionar Obra" para começar.</p>
      </div>
    `;
    return;
  }

  // Extract filter options
  const types = [...new Set(data.map(d => d.mediaType).filter(Boolean))];
  const formats = [...new Set(data.map(d => d.format).filter(Boolean))];
  const universes = [...new Set(data.map(d => d.universe).filter(Boolean))];
  const priorities = [...new Set(data.map(d => d.priority).filter(Boolean))];
  const years = [...new Set(data.map(d => d.yearStart).filter(Boolean))].sort((a, b) => a - b);
  const allChars = new Set();
  data.forEach(d => (d.batfamilyMembers || []).forEach(c => allChars.add(c)));
  const characters = [...allChars].sort();

  // Build filter UI
  let filterHtml = `
    <div class="catalog-header">
      <h2>📚 Catálogo</h2>
      <button class="add-btn" id="add-item-btn">+ Adicionar Obra</button>
    </div>
    <div class="catalog-filters">
      <input class="search-input" type="text" placeholder="🔍 Buscar por título..." value="${filters.search || ''}" />
      <div class="filter-group">
        <select class="filter-type">
          <option value="">Todos os tipos</option>
          ${types.map(t => `<option value="${t}" ${filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <select class="filter-format">
          <option value="">Todos os formatos</option>
          ${formats.map(f => `<option value="${f}" ${filters.format === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
        <select class="filter-universe">
          <option value="">Todos os universos</option>
          ${universes.map(u => `<option value="${u}" ${filters.universe === u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
        <select class="filter-priority">
          <option value="">Todas as prioridades</option>
          ${priorities.map(p => `<option value="${p}" ${filters.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select class="filter-status">
          <option value="">Todos os status</option>
          <option value="done" ${filters.status === 'done' ? 'selected' : ''}>Concluído</option>
          <option value="watching" ${filters.status === 'watching' ? 'selected' : ''}>Assistindo</option>
          <option value="not" ${filters.status === 'not' ? 'selected' : ''}>Não assistido</option>
        </select>
        <select class="filter-year">
          <option value="">Todos os anos</option>
          ${years.map(y => `<option value="${y}" ${filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
        <select class="filter-character">
          <option value="">Todos os personagens</option>
          ${characters.map(c => `<option value="${c}" ${filters.character === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select class="sort-order">
          <option value="order" ${filters.sort === 'order' ? 'selected' : ''}>Ordem da Jornada</option>
          <option value="year" ${filters.sort === 'year' ? 'selected' : ''}>Ano</option>
          <option value="title" ${filters.sort === 'title' ? 'selected' : ''}>Título</option>
          <option value="priority" ${filters.sort === 'priority' ? 'selected' : ''}>Prioridade</option>
          <option value="duration" ${filters.sort === 'duration' ? 'selected' : ''}>Duração</option>
        </select>
      </div>
    </div>
  `;

  // Filter data
  let filtered = [...data];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(d => d.title?.toLowerCase().includes(s) || d.titlePT?.toLowerCase().includes(s));
  }
  if (filters.type) filtered = filtered.filter(d => d.mediaType === filters.type);
  if (filters.format) filtered = filtered.filter(d => d.format === filters.format);
  if (filters.universe) filtered = filtered.filter(d => d.universe === filters.universe);
  if (filters.priority) filtered = filtered.filter(d => d.priority === filters.priority);
  if (filters.status) filtered = filtered.filter(d => getStatus(progress, d.id) === filters.status);
  if (filters.year) filtered = filtered.filter(d => d.yearStart === parseInt(filters.year));
  if (filters.character) {
    filtered = filtered.filter(d => (d.batfamilyMembers || []).includes(filters.character));
  }

  // Sort
  const sortMap = {
    order: sortByOrder,
    year: sortByYear,
    title: sortByTitle,
    priority: sortByPriority,
    duration: sortByDuration
  };
  const sorter = sortMap[filters.sort] || sortByOrder;
  filtered.sort(sorter);

  // Cards
  let gridHtml = '<div class="catalog-grid">';
  if (filtered.length === 0) {
    gridHtml = `<p style="color:var(--text-muted);text-align:center;width:100%;">Nenhum item encontrado.</p>`;
  } else {
    filtered.forEach(item => {
      const status = getStatus(progress, item.id);
      const statusLabel = status === 'done' ? '✓ Concluído' : (status === 'watching' ? '⏳ Assistindo' : '⏹ Pendente');
      gridHtml += `
        <div class="media-card" data-id="${item.id}">
          <img class="card-poster" src="${item.posterUrl || ''}" alt="${item.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22 viewBox=%220 0 200 300%22%3E%3Crect width=%22200%22 height=%22300%22 fill=%22%231c1820%22/%3E%3Ctext x=%2260%22 y=%22150%22 fill=%22%237a727a%22 font-size=%2230%22 font-family=%22Inter%22%3E🦇%3C/text%3E%3C/svg%3E'" />
          <div class="card-body">
            <div class="card-title">${item.title}</div>
            ${item.titlePT ? `<div class="card-title-pt">${item.titlePT}</div>` : ''}
            <div class="card-meta">
              <span>${item.yearStart || ''}</span>
              <span>${item.mediaType || ''}</span>
              ${item.format ? `<span class="badge">${item.format}</span>` : ''}
            </div>
            <div class="card-status">${statusLabel}</div>
            <div class="card-actions">
              <button class="edit-btn" data-id="${item.id}" title="Editar">✏️</button>
            </div>
          </div>
        </div>
      `;
    });
  }
  gridHtml += '</div>';

  container.innerHTML = filterHtml + gridHtml;

  // Events
  const searchInput = container.querySelector('.search-input');
  const selects = container.querySelectorAll('select');
  const allFilters = { ...filters };

  const update = () => {
    allFilters.search = searchInput.value;
    selects.forEach(sel => {
      const key = sel.className.replace('filter-', '').replace('sort-', '');
      if (sel.classList.contains('sort-order')) allFilters.sort = sel.value;
      else if (sel.classList.contains('filter-type')) allFilters.type = sel.value;
      else if (sel.classList.contains('filter-format')) allFilters.format = sel.value;
      else if (sel.classList.contains('filter-universe')) allFilters.universe = sel.value;
      else if (sel.classList.contains('filter-priority')) allFilters.priority = sel.value;
      else if (sel.classList.contains('filter-status')) allFilters.status = sel.value;
      else if (sel.classList.contains('filter-year')) allFilters.year = sel.value;
      else if (sel.classList.contains('filter-character')) allFilters.character = sel.value;
    });
    renderCatalog(data, allFilters);
  };

  searchInput.addEventListener('input', update);
  selects.forEach(sel => sel.addEventListener('change', update));

  // Botão Adicionar
  const addBtn = container.querySelector('#add-item-btn');
  if (addBtn) addBtn.addEventListener('click', () => openForm());

  // Card clicks (except edit button)
  container.querySelectorAll('.media-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn')) return;
      const id = el.dataset.id;
      const item = data.find(d => d.id === id);
      if (item) openModal(item);
    });
    const editBtn = el.querySelector('.edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = editBtn.dataset.id;
        const item = data.find(d => d.id === id);
        if (item) openForm(item);
      });
    }
  });
}
