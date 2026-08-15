import { loadProgress, setStatus, getStatus } from '../store.js';
import { getProgressStats, sortByOrder } from '../utils.js';

export function renderProgress(data) {
  const container = document.getElementById('progress-container');
  const progress = loadProgress();
  const stats = getProgressStats(data, progress);

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Progresso Aguardando Dados</h3>
        <p>Nenhuma produção para acompanhar.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="progress-header">
      <h2>📊 Seu Progresso</h2>
    </div>
    <div class="progress-stats">
      <div class="stat-card"><div class="stat-number">${stats.total}</div><div class="stat-label">Total</div></div>
      <div class="stat-card"><div class="stat-number">${stats.done}</div><div class="stat-label">Concluídos</div></div>
      <div class="stat-card"><div class="stat-number">${stats.watching}</div><div class="stat-label">Assistindo</div></div>
      <div class="stat-card"><div class="stat-number">${stats.not}</div><div class="stat-label">Não assistidos</div></div>
      <div class="stat-card"><div class="stat-number">${stats.percent}%</div><div class="stat-label">Completo</div></div>
    </div>
    <div class="progress-list">
  `;

  const sorted = [...data].sort(sortByOrder);
  sorted.forEach(item => {
    const status = getStatus(progress, item.id);
    const label = status === 'done' ? 'Concluído' : (status === 'watching' ? 'Assistindo' : 'Não assistido');
    const cls = status === 'done' ? 'done' : (status === 'watching' ? 'watching' : '');
    html += `
      <div class="progress-item" data-id="${item.id}">
        <span class="p-title">${item.title}</span>
        <span class="p-status ${cls}">${label}</span>
        <select class="status-select" data-id="${item.id}">
          <option value="not" ${status === 'not' ? 'selected' : ''}>Não assistido</option>
          <option value="watching" ${status === 'watching' ? 'selected' : ''}>Assistindo</option>
          <option value="done" ${status === 'done' ? 'selected' : ''}>Concluído</option>
        </select>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Event listeners for status change
  container.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.id;
      const newStatus = sel.value;
      setStatus(progress, id, newStatus);
      renderProgress(data); // re-render
    });
  });
}
