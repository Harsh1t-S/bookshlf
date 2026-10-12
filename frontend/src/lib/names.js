// "holland mckay" -> "Holland" for "Holland’s Reading Life".
export function firstName(name = '') {
  const first = name.trim().split(/\s+/)[0] || '';
  return first ? `${first.charAt(0).toLocaleUpperCase()}${first.slice(1)}` : '';
}

export function shelfTitle(name) {
  const first = firstName(name);
  return first ? `${first}’s Reading Life` : 'Your Reading Life';
}
