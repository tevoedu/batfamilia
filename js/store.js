const STORAGE_KEY = 'batfamilia_progress';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function setStatus(progress, id, status) {
  progress[id] = status;
  saveProgress(progress);
}

export function getStatus(progress, id) {
  return progress[id] || 'not';
}
