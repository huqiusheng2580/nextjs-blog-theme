import {
  getPost,
  updatePost,
  deletePost,
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

  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await getPost(slug);
      res.status(200).json(post);
    } catch (err) {
      res.status(404).json({ message: 'Post not found', error: err.message });
    }
    return;
  }

  if (req.method === 'PUT') {
    const { title, description, date, content } = req.body || {};
    try {
      const updated = await updatePost({ slug, title, description, date, content });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update post', error: err.message });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      await deletePost(slug);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete post', error: err.message });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end('Method Not Allowed');
}
