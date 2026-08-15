export function renderCharacters(data) {
  const container = document.getElementById('characters-container');
  const allChars = new Map();
  data.forEach(item => {
    (item.batfamilyMembers || []).forEach(name => {
      if (!allChars.has(name)) {
        allChars.set(name, { name, productions: [] });
      }
      allChars.get(name).productions.push(item.title);
    });
  });

  if (data.length === 0 || allChars.size === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🦸</div>
        <h3>Personagens Aguardando Dados</h3>
        <p>Adicione obras com personagens para vê-los aqui.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="characters-header">
      <h2>🦸 Personagens da BatFamília</h2>
    </div>
    <div class="characters-grid">
  `;
  for (const [name, info] of allChars) {
    html += `
      <div class="character-card">
        <div class="char-name">${name}</div>
        <div class="char-identity">${info.productions.length} produção(ões)</div>
      </div>
    `;
  }
  html += '</div>';
  container.innerHTML = html;
}
