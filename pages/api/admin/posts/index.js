import {
  getAllPosts,
  createPost,
  isEditorEnabled,
} from '../../../../utils/admin-posts';

const guard = (res) => {
  if (!isEditorEnabled()) {
    res.status(403).json({ message: 'Local editor disabled. Set ENABLE_LOCAL_EDITOR=true in development to use.' });
    return false;
  }
  return true;
};

export default async function handler(req, res) {
  if (!guard(res)) return;

  if (req.method === 'GET') {
    try {
      const posts = await getAllPosts();
      res.status(200).json({ posts });
    } catch (err) {
      res.status(500).json({ message: 'Failed to list posts', error: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    const { title, description, content, date, slug } = req.body || {};
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }
    try {
      const created = await createPost({ title, description, content, date, slug });
      res.status(201).json(created);
    } catch (err) {
      if (err.message === 'FILE_EXISTS') {
        res.status(409).json({ message: 'A post with this slug already exists' });
        return;
      }
      res.status(500).json({ message: 'Failed to create post', error: err.message });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('Method Not Allowed');
}
