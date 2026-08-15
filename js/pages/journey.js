import { loadProgress, getStatus } from '../store.js';
import { sortByOrder, getNextProduction } from '../utils.js';

let openModal = () => {};
let openForm = () => {};

export function setModalHandler(handler) {
  openModal = handler;
}

export function setFormHandler(handler) {
  openForm = handler;
}

export function renderJourney(data) {
  const container = document.getElementById('journey-container');
  const progress = loadProgress();
  const sorted = [...data].sort(sortByOrder);
  const nextInfo = getNextProduction(data, progress);

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕯️</div>
        <h3>Jornada Aguardando Dados</h3>
        <p>Adicione obras no catálogo para começar.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="journey-header">
      <h2>📜 Jornada da BatFamília</h2>
      <p style="color:var(--text-secondary);">Ordem recomendada para assistir.</p>
    </div>
    <div class="timeline">
  `;

  sorted.forEach((item, index) => {
    const status = getStatus(progress, item.id);
    const isCurrent = nextInfo && nextInfo.current.id === item.id && status !== 'done';
    const isNext = nextInfo && nextInfo.index > 0 && sorted[nextInfo.index - 1]?.id === item.id && status !== 'done' && item.id !== nextInfo.current.id;

    let statusLabel = '';
    let statusClass = '';
    if (status === 'done') {
      statusLabel = '✓ Concluído';
      statusClass = 'done';
    } else if (status === 'watching') {
      statusLabel = '⏳ Assistindo';
      statusClass = 'watching';
    } else if (isCurrent) {
      statusLabel = '▶ Atual';
      statusClass = 'next';
    } else if (isNext) {
      statusLabel = '⏩ Próximo';
      statusClass = 'next';
    } else {
      statusLabel = '⏹ Pendente';
    }

    const cls = isCurrent ? 'timeline-item current' : (isNext ? 'timeline-item next-item' : 'timeline-item');

    html += `
      <div class="${cls}" data-id="${item.id}">
        <div class="position">${String(index + 1).padStart(2, '0')}</div>
        <img class="thumb" src="${item.posterUrl || ''}" alt="${item.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2270%22 viewBox=%220 0 50 70%22%3E%3Crect width=%2250%22 height=%2270%22 fill=%22%231c1820%22/%3E%3Ctext x=%225%22 y=%2235%22 fill=%22%237a727a%22 font-size=%2220%22 font-family=%22Inter%22%3E🦇%3C/text%3E%3C/svg%3E'" />
        <div class="info">
          <div class="title">${item.title}${item.titlePT ? ` <span style="color:var(--text-muted);font-weight:400;">(${item.titlePT})</span>` : ''}</div>
          <div class="meta">${item.yearStart || ''} · ${item.mediaType || ''} · ${item.format || ''}</div>
        </div>
        <span class="status-badge ${statusClass}">${statusLabel}</span>
        <button class="edit-btn" data-id="${item.id}" title="Editar">✏️</button>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Click to open details (except edit button)
  container.querySelectorAll('.timeline-item').forEach(el => {
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
