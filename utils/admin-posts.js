import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'posts');

const slugify = (text = '') => {
  const base = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `post-${Date.now()}`;
};

const readFileSafe = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  return content;
};

const writeFileSafe = async (filePath, data) => {
  await fs.writeFile(filePath, data, 'utf8');
};

const listPostFiles = async () => {
  const entries = await fs.readdir(POSTS_DIR);
  return entries.filter((entry) => entry.endsWith('.mdx'));
};

const parsePostFile = async (filePath) => {
  const raw = await readFileSafe(filePath);
  const { content, data } = matter(raw);
  return { content, data };
};

const stringifyPost = (data, content) => {
  return matter.stringify(content || '', data || {});
};

export const getAllPosts = async () => {
  const files = await listPostFiles();
  const posts = await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const { data } = await parsePostFile(path.join(POSTS_DIR, fileName));
      return { slug, data };
    }),
  );

  return posts.sort((a, b) => {
    const aDate = new Date(a.data?.date || 0).getTime();
    const bDate = new Date(b.data?.date || 0).getTime();
    return bDate - aDate;
  });
};

export const getPost = async (slug) => {
  const target = path.join(POSTS_DIR, `${slug}.mdx`);
  const { content, data } = await parsePostFile(target);
  return { slug, content, data };
};

export const createPost = async ({ title, description = '', content = '', date, slug }) => {
  const finalSlug = slug ? slugify(slug) : slugify(title || '');
  const target = path.join(POSTS_DIR, `${finalSlug}.mdx`);

  try {
    await fs.access(target);
    throw new Error('FILE_EXISTS');
  } catch (err) {
    if (err.code !== 'ENOENT' && err.message !== 'FILE_EXISTS') {
      throw err;
    }
  }

  const data = {
    type: 'Post',
    title: title || 'Untitled',
    description,
    date: date || new Date().toISOString().slice(0, 10),
  };

  const fileBody = stringifyPost(data, content || '\n');
  await writeFileSafe(target, fileBody);
  return { slug: finalSlug, data };
};

export const updatePost = async ({ slug, title, description, date, content }) => {
  const target = path.join(POSTS_DIR, `${slug}.mdx`);
  const { data: existingData } = await parsePostFile(target);
  const data = {
    ...existingData,
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(date !== undefined ? { date } : {}),
  };
  const fileBody = stringifyPost(data, content !== undefined ? content : '');
  await writeFileSafe(target, fileBody);
  return { slug, data };
};

export const deletePost = async (slug) => {
  const target = path.join(POSTS_DIR, `${slug}.mdx`);
  await fs.unlink(target);
  return { slug };
};

export const isEditorEnabled = () => {
  return process.env.ENABLE_LOCAL_EDITOR === 'true' && process.env.NODE_ENV !== 'production';
};
