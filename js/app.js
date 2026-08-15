import { loadItems, initDefaultData, addItem, updateItem, deleteItem } from './dataStore.js';
import defaultData from './data-batfamilia.js';
import { renderHome } from './pages/home.js';
import { renderJourney, setModalHandler as setJourneyModal, setFormHandler as setJourneyForm } from './pages/journey.js';
import { renderCatalog, setModalHandler as setCatalogModal, setFormHandler as setCatalogForm } from './pages/catalog.js';
import { renderCharacters } from './pages/characters.js';
import { renderProgress } from './pages/progress.js';
import { loadProgress, setStatus } from './store.js';

// Inicializar com dados padrão (se vazio)
initDefaultData(defaultData);

// ===== MODAL DE DETALHES =====
function openModal(item) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const progress = loadProgress();
  const status = progress[item.id] || 'not';

  let charsHtml = '';
  if (item.batfamilyMembers && item.batfamilyMembers.length) {
    charsHtml = `
      <div class="modal-characters">
        <h4>🦇 Personagens da BatFamília</h4>
        ${item.batfamilyMembers.map(c => `<span class="char-tag">${c}</span>`).join(' ')}
      </div>
    `;
  }

  let reviewHtml = '';
  if (item.review) {
    reviewHtml = `
      <div class="modal-review">
        <div class="review-label">💬 Comentário</div>
        <div class="review-text">${item.review}</div>
      </div>
    `;
  }

  let ratingHtml = '';
  if (item.rating !== undefined && item.rating !== null) {
    ratingHtml = `<span class="modal-rating">⭐ ${item.rating.toFixed(1)}</span>`;
  }

  content.innerHTML = `
    <img class="modal-poster" src="${item.posterUrl || ''}" alt="${item.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22270%22 viewBox=%220 0 180 270%22%3E%3Crect width=%22180%22 height=%22270%22 fill=%22%231c1820%22/%3E%3Ctext x=%2260%22 y=%22135%22 fill=%22%237a727a%22 font-size=%2230%22 font-family=%22Inter%22%3E🦇%3C/text%3E%3C/svg%3E'" />
    <div class="modal-title" id="modal-title">${item.title}</div>
    ${item.titlePT ? `<div class="modal-title-pt">${item.titlePT}</div>` : ''}
    <div class="modal-meta">
      <span><strong>Ano:</strong> ${item.yearStart || '-'}${item.yearEnd ? ` — ${item.yearEnd}` : ''}</span>
      <span><strong>Tipo:</strong> ${item.mediaType || '-'}</span>
      <span><strong>Formato:</strong> ${item.format || '-'}</span>
      ${item.durationMinutes ? `<span><strong>Duração:</strong> ${item.durationMinutes} min</span>` : ''}
      ${item.episodes ? `<span><strong>Episódios:</strong> ${item.episodes}</span>` : ''}
      ${item.seasons ? `<span><strong>Temporadas:</strong> ${item.seasons}</span>` : ''}
      <span><strong>Universo:</strong> ${item.universe || '-'}</span>
      <span><strong>Prioridade:</strong> ${item.priority || '-'}</span>
      ${item.order ? `<span><strong>Posição:</strong> ${item.order}</span>` : ''}
      ${ratingHtml ? `<span>${ratingHtml}</span>` : ''}
    </div>
    ${item.synopsis ? `<div class="modal-synopsis">${item.synopsis}</div>` : ''}
    ${charsHtml}
    ${reviewHtml}
    <div class="modal-status-select">
      <label for="modal-status">Status:</label>
      <select id="modal-status">
        <option value="not" ${status === 'not' ? 'selected' : ''}>Não assistido</option>
        <option value="watching" ${status === 'watching' ? 'selected' : ''}>Assistindo</option>
        <option value="done" ${status === 'done' ? 'selected' : ''}>Concluído</option>
      </select>
    </div>
  `;

  overlay.classList.add('open');

  // Status change inside modal
  const statusSelect = document.getElementById('modal-status');
  statusSelect.addEventListener('change', () => {
    const newStatus = statusSelect.value;
    setStatus(progress, item.id, newStatus);
    // Refresh all views
    renderAll();
    // Update modal content to reflect new status (re-open with same item)
    openModal(item);
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ===== MODAL DE FORMULÁRIO (CRIAR/EDITAR) =====
const formModalOverlay = document.getElementById('form-modal-overlay');
const formModalClose = formModalOverlay.querySelector('.modal-close');
const formCancel = document.getElementById('form-cancel');
const formDelete = document.getElementById('form-delete');
const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-modal-title');

let editingId = null;

function openForm(itemData = null) {
  editingId = itemData?.id || null;
  formTitle.textContent = editingId ? 'Editar Obra' : 'Adicionar Obra';
  formDelete.style.display = editingId ? 'inline-block' : 'none';

  // Preencher campos
  document.getElementById('form-title').value = itemData?.title || '';
  document.getElementById('form-title-pt').value = itemData?.titlePT || '';
  document.getElementById('form-year-start').value = itemData?.yearStart || '';
  document.getElementById('form-year-end').value = itemData?.yearEnd || '';
  document.getElementById('form-type').value = itemData?.mediaType || '';
  document.getElementById('form-format').value = itemData?.format || '';
  document.getElementById('form-universe').value = itemData?.universe || '';
  document.getElementById('form-priority').value = itemData?.priority || '';
  document.getElementById('form-order').value = itemData?.order || '';
  document.getElementById('form-duration').value = itemData?.durationMinutes || '';
  document.getElementById('form-episodes').value = itemData?.episodes || '';
  document.getElementById('form-seasons').value = itemData?.seasons || '';
  document.getElementById('form-poster').value = itemData?.posterUrl || '';
  document.getElementById('form-synopsis').value = itemData?.synopsis || '';
  document.getElementById('form-characters').value = (itemData?.batfamilyMembers || []).join(', ');
  document.getElementById('form-rating').value = itemData?.rating || '';
  document.getElementById('form-review').value = itemData?.review || '';

  // Atualizar pré-visualização da capa
  updatePosterPreview(document.getElementById('form-poster').value);

  formModalOverlay.classList.add('open');
}

function closeForm() {
  formModalOverlay.classList.remove('open');
  editingId = null;
  form.reset();
  // Reset preview
  const img = document.getElementById('poster-preview-img');
  img.src = '';
  img.style.display = 'none';
  document.getElementById('poster-placeholder').style.display = 'block';
}

function updatePosterPreview(url) {
  const img = document.getElementById('poster-preview-img');
  const placeholder = document.getElementById('poster-placeholder');
  if (url) {
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'block';
    };
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

// Eventos do formulário
document.getElementById('form-poster').addEventListener('input', (e) => {
  updatePosterPreview(e.target.value);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = {
    title: document.getElementById('form-title').value.trim(),
    titlePT: document.getElementById('form-title-pt').value.trim(),
    yearStart: parseInt(document.getElementById('form-year-start').value) || undefined,
    yearEnd: parseInt(document.getElementById('form-year-end').value) || undefined,
    mediaType: document.getElementById('form-type').value || undefined,
    format: document.getElementById('form-format').value || undefined,
    universe: document.getElementById('form-universe').value.trim() || undefined,
    priority: document.getElementById('form-priority').value || undefined,
    order: parseInt(document.getElementById('form-order').value) || undefined,
    durationMinutes: parseInt(document.getElementById('form-duration').value) || undefined,
    episodes: parseInt(document.getElementById('form-episodes').value) || undefined,
    seasons: parseInt(document.getElementById('form-seasons').value) || undefined,
    posterUrl: document.getElementById('form-poster').value.trim() || undefined,
    synopsis: document.getElementById('form-synopsis').value.trim() || undefined,
    batfamilyMembers: document.getElementById('form-characters').value.split(',').map(s => s.trim()).filter(Boolean),
    rating: parseFloat(document.getElementById('form-rating').value) || undefined,
    review: document.getElementById('form-review').value.trim() || undefined,
  };

  // Validação básica
  if (!formData.title) {
    alert('O título é obrigatório.');
    return;
  }

  if (editingId) {
    updateItem(editingId, formData);
    showToast('Obra atualizada!');
  } else {
    addItem(formData);
    showToast('Obra adicionada!');
  }

  closeForm();
  renderAll();
});

formDelete.addEventListener('click', () => {
  if (!editingId) return;
  if (confirm('Tem certeza que deseja excluir esta obra?')) {
    deleteItem(editingId);
    closeForm();
    renderAll();
    showToast('Obra excluída.');
  }
});

// Fechar modal do formulário
[formModalClose, formCancel].forEach(btn => btn.addEventListener('click', closeForm));
formModalOverlay.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeForm();
});

// ===== MODAL DE DETALHES - fechar =====
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.querySelector('.modal-close').addEventListener('click', closeModal);

// ===== TOAST =====
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ===== NAVEGAÇÃO =====
const navLinks = document.querySelectorAll('.main-nav a');
const pages = {
  home: document.getElementById('page-home'),
  journey: document.getElementById('page-journey'),
  catalog: document.getElementById('page-catalog'),
  characters: document.getElementById('page-characters'),
  progress: document.getElementById('page-progress')
};

function navigate(page) {
  // Update nav
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === page));
  // Show page
  Object.keys(pages).forEach(key => {
    pages[key].classList.toggle('active', key === page);
  });
  // Render page content
  renderPage(page);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    navigate(page);
    // Close mobile menu
    document.querySelector('.main-nav').classList.remove('open');
  });
});

// Mobile menu toggle
document.querySelector('.menu-toggle').addEventListener('click', () => {
  const nav = document.querySelector('.main-nav');
  nav.classList.toggle('open');
  const expanded = nav.classList.contains('open');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', expanded);
});

// ===== RENDERIZAÇÃO =====
function renderPage(page) {
  const data = loadItems(); // sempre fresco
  switch (page) {
    case 'home':
      renderHome(data);
      break;
    case 'journey':
      renderJourney(data);
      break;
    case 'catalog':
      renderCatalog(data);
      break;
    case 'characters':
      renderCharacters(data);
      break;
    case 'progress':
      renderProgress(data);
      break;
  }
}

function renderAll() {
  const currentPage = document.querySelector('.main-nav a.active')?.dataset.page || 'home';
  renderPage(currentPage);
}

// ===== INJEÇÃO DOS HANDLERS NAS PÁGINAS =====
setJourneyModal(openModal);
setJourneyForm(openForm);
setCatalogModal(openModal);
setCatalogForm(openForm);

// ===== INICIALIZAÇÃO =====
navigate('home');

// Handle window hash change (optional)
window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1) || 'home';
  const link = document.querySelector(`[data-page="${hash}"]`);
  if (link) link.click();
});

// If hash on load
if (location.hash) {
  const hash = location.hash.slice(1);
  const link = document.querySelector(`[data-page="${hash}"]`);
  if (link) link.click();
}
