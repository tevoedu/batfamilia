export function getStatusLabel(status) {
  const map = {
    done: 'Concluído',
    watching: 'Assistindo',
    not: 'Não assistido'
  };
  return map[status] || 'Não assistido';
}

export function sortByOrder(a, b) {
  return (a.order ?? Infinity) - (b.order ?? Infinity);
}

export function sortByYear(a, b) {
  return (a.yearStart ?? 0) - (b.yearStart ?? 0);
}

export function sortByTitle(a, b) {
  return (a.title || '').localeCompare(b.title || '');
}

export function sortByPriority(a, b) {
  const priorityOrder = { core: 0, important: 1, extra: 2 };
  return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
}

export function sortByDuration(a, b) {
  const durA = a.durationMinutes ?? (a.episodeDurationMinutes * (a.episodes || 0));
  const durB = b.durationMinutes ?? (b.episodeDurationMinutes * (b.episodes || 0));
  return durA - durB;
}

export function getNextProduction(items, progress) {
  const sorted = [...items].sort(sortByOrder);
  for (let i = 0; i < sorted.length; i++) {
    const id = sorted[i].id;
    if (progress[id] !== 'done') {
      return { current: sorted[i], index: i };
    }
  }
  return null; // all done
}

export function getProgressStats(items, progress) {
  const total = items.length;
  let done = 0,
    watching = 0,
    not = 0;
  items.forEach(item => {
    const status = progress[item.id] || 'not';
    if (status === 'done') done++;
    else if (status === 'watching') watching++;
    else not++;
  });
  const remaining = total - done;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, watching, not, remaining, percent };
}
