const { get, put } = require('@vercel/blob');

const PATHNAME = 'prompts.json';

async function readAll() {
  const result = await get(PATHNAME, { access: 'private', useCache: false });
  if (!result) return [];
  const text = await new Response(result.stream).text();
  try {
    const list = JSON.parse(text);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function writeAll(list) {
  await put(PATHNAME, JSON.stringify(list, null, 2), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const list = await readAll();
      res.status(200).json(list);
      return;
    }

    if (req.method === 'POST') {
      const { name, body } = req.body || {};
      if (!name || typeof name !== 'string' || !body || typeof body !== 'string') {
        res.status(400).json({ error: 'Thiếu name hoặc body.' });
        return;
      }
      const list = await readAll();
      const item = { id: makeId(), name: name.trim().slice(0, 60), body, createdAt: Date.now() };
      list.unshift(item);
      await writeAll(list);
      res.status(200).json(item);
      return;
    }

    if (req.method === 'DELETE') {
      const id = req.query.id;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Thiếu id.' });
        return;
      }
      const list = await readAll();
      const next = list.filter((p) => p.id !== id);
      await writeAll(next);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err && err.message ? err.message : 'Lỗi server không xác định.' });
  }
};
