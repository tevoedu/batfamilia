const STORAGE_KEY = 'batfamilia_items';

// Carrega os itens do localStorage ou retorna array vazio
export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao carregar dados:', e);
  }
  return [];
}

// Salva a lista inteira
export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Adiciona uma nova obra
export function addItem(item) {
  const items = loadItems();
  const newItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

// Edita uma obra existente
export function updateItem(id, updatedFields) {
  const items = loadItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  const updated = {
    ...items[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };
  items[index] = updated;
  saveItems(items);
  return updated;
}

// Remove uma obra
export function deleteItem(id) {
  let items = loadItems();
  items = items.filter(i => i.id !== id);
  saveItems(items);
}

// Inicializa com dados padrão se não houver nada
export function initDefaultData(defaultData) {
  const existing = loadItems();
  if (existing.length === 0 && defaultData && defaultData.length > 0) {
    // Garantir que os dados padrão tenham IDs
    const withIds = defaultData.map(item => ({
      ...item,
      id: item.id || generateId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    }));
    saveItems(withIds);
  }
}

// Gera ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
