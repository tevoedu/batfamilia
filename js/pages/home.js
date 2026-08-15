import { getNextProduction, getProgressStats, sortByOrder } from '../utils.js';
import { loadProgress } from '../store.js';

export function renderHome(data) {
  const container = document.getElementById('home-container');
  const progress = loadProgress();
  const stats = getProgressStats(data, progress);
  const nextInfo = getNextProduction(data, progress);

  let nextHtml = '';
  if (nextInfo) {
    const item = nextInfo.current;
    const status = progress[item.id] || 'not';
    nextHtml = `
      <div class="home-next">
        <div>
          <div class="next-label">🔮 Próxima da Jornada</div>
          <div class="next-title">${item.title}${item.titlePT ? ` (${item.titlePT})` : ''}</div>
          <div class="next-meta">${item.yearStart || ''} · ${item.mediaType || ''} · ${item.format || ''}</div>
        </div>
        <button class="next-action" data-id="${item.id}">Continuar →</button>
      </div>
    `;
  } else if (data.length > 0) {
    nextHtml = `
      <div class="home-next">
        <div>
          <div class="next-label">🎉 Jornada Concluída!</div>
          <div class="next-title">Você assistiu a tudo!</div>
        </div>
      </div>
    `;
  }

  const emptyHtml = `
    <div class="empty-state">
      <div class="empty-icon">🦇</div>
      <h3>Catálogo Aguardando Dados</h3>
      <p>O Oráculo ainda não forneceu os arquivos. Adicione suas obras manualmente clicando em "Adicionar Obra" no Catálogo.</p>
    </div>
  `;

  let content = '';
  if (data.length === 0) {
    content = emptyHtml;
  } else {
    content = `
      <div class="home-greeting">
        <h1>🦇 <span class="highlight">BatFamília</span> · Arquivo de Gotham</h1>
        <p style="color:var(--text-secondary);">Sua jornada através das sombras.</p>
      </div>
      <div class="home-stats-grid">
        <div class="stat-card"><div class="stat-number">${stats.total}</div><div class="stat-label">Total</div></div>
        <div class="stat-card"><div class="stat-number">${stats.done}</div><div class="stat-label">Assistidos</div></div>
        <div class="stat-card"><div class="stat-number">${stats.remaining}</div><div class="stat-label">Restantes</div></div>
        <div class="stat-card"><div class="stat-number">${stats.percent}%</div><div class="stat-label">Progresso</div></div>
      </div>
      ${nextHtml}
      <div class="home-shortcuts">
        <button class="shortcut-btn" data-page="journey">📜 Ver Jornada</button>
        <button class="shortcut-btn" data-page="catalog">📚 Catálogo</button>
        <button class="shortcut-btn" data-page="characters">🦸 Personagens</button>
        <button class="shortcut-btn" data-page="progress">📊 Progresso</button>
      </div>
    `;
  }

  container.innerHTML = content;

  // Event listeners
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      document.querySelector(`[data-page="${page}"]`)?.click();
    });
  });

  const nextBtn = container.querySelector('.next-action');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      document.querySelector('[data-page="journey"]')?.click();
    });
  }
}
