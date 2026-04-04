export const getPath = (messages, activeId) => {
  const map = {};
  (Array.isArray(messages) ? messages : []).forEach((msg) => {
    if (!msg?._id) return;
    map[msg._id] = msg;
  });

  let path = [];
  let current = map[activeId];

  while (current) {
    path.push(current);
    current = current.parentId ? map[current.parentId] : null;
  }

  return path.reverse();
};