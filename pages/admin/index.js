import { useEffect, useMemo, useRef, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: '',
  description: '',
  date: today(),
  slug: '',
  content: '',
});

const EditorPage = () => {
  const [posts, setPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [form, setForm] = useState(() => emptyForm());
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const fetchPosts = async () => {
    setLoadingList(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/posts');
      if (!res.ok) throw new Error('加载文章列表失败');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const loadPost = async (slug) => {
    setLoadingForm(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/posts/${slug}`);
      if (!res.ok) throw new Error('加载文章失败');
      const data = await res.json();
      setForm({
        title: data.data?.title || '',
        description: data.data?.description || '',
        date: data.data?.date || today(),
        slug: data.slug || '',
        content: data.content || '',
      });
      setSelectedSlug(slug);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const resetForm = () => {
    setSelectedSlug(null);
    setForm(emptyForm());
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setMessage('');

    const payload = { ...form };
    const isEditing = Boolean(selectedSlug);
    const url = isEditing ? `/api/admin/posts/${selectedSlug}` : '/api/admin/posts';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '保存失败');
      }
      await fetchPosts();
      setMessage(isEditing ? '文章已更新。' : '文章已创建。');
      if (!isEditing) {
        const created = await res.json();
        await loadPost(created.slug);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlug) return;
    if (!confirm('确认删除这篇文章？')) return;
    setLoadingForm(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/posts/${selectedSlug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      await fetchPosts();
      resetForm();
      setMessage('文章已删除。');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const sortedPosts = useMemo(() => posts, [posts]);

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const setSelection = (start, end) => {
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, end);
      }
    });
  };

  const wrapSelection = (before, after, placeholder = '') => {
    const el = textareaRef.current;
    const content = form.content || '';
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    const nextStart = start + before.length;
    const nextEnd = nextStart + selected.length;
    setForm((f) => ({ ...f, content: next }));
    focusTextarea();
    setSelection(nextStart, nextEnd);
  };

  const prefixLines = (prefix, placeholder = '') => {
    const el = textareaRef.current;
    const content = form.content || '';
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = content.slice(start, end);
    const text = selected || placeholder;
    const lines = text.split(/\n/).map((line, idx) => {
      return prefix.replace('%n', idx + 1) + line;
    });
    const replaced = lines.join('\n');
    const next = content.slice(0, start) + replaced + content.slice(end);
    const nextStart = start + prefix.replace('%n', 1).length;
    const nextEnd = nextStart + (replaced.length - prefix.replace('%n', 1).length);
    setForm((f) => ({ ...f, content: next }));
    focusTextarea();
    setSelection(nextStart, nextEnd);
  };

  const applyFormat = (type) => {
    switch (type) {
      case 'bold':
        wrapSelection('**', '**', '粗体');
        break;
      case 'italic':
        wrapSelection('*', '*', '斜体');
        break;
      case 'code':
        wrapSelection('`', '`', 'code');
        break;
      case 'codeblock':
        wrapSelection('```\n', '\n```\n', 'console.log("hello")');
        break;
      case 'h1':
        prefixLines('# ', '一级标题');
        break;
      case 'h2':
        prefixLines('## ', '二级标题');
        break;
      case 'ul':
        prefixLines('- ', '列表项');
        break;
      case 'ol':
        prefixLines('%n. ', '列表项');
        break;
      case 'quote':
        prefixLines('> ', '引用内容');
        break;
      case 'link':
        wrapSelection('[', '](https://)', '链接文字');
        break;
      case 'image':
        wrapSelection('![图片说明](', ')', '/images/example.jpg');
        break;
      case 'hr':
        wrapSelection('\n---\n', '\n', '');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">本地 MDX 编辑器</h1>
            <p className="text-sm text-slate-300">仅用于开发模式，创建或编辑 /posts 下的 MDX 文章。</p>
          </div>
          <button
            className="rounded bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400 disabled:opacity-50"
            onClick={resetForm}
            disabled={loadingForm}
          >
            新建文章
          </button>
        </header>

        {message && (
          <div className="mb-4 rounded border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">文章列表</h2>
              <button
                onClick={fetchPosts}
                disabled={loadingList}
                className="text-xs rounded border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
              >
                刷新
              </button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
              {loadingList && <p className="text-sm text-slate-400">读取中…</p>}
              {!loadingList && sortedPosts.length === 0 && (
                <p className="text-sm text-slate-400">暂无文章。</p>
              )}
              {sortedPosts.map((post) => (
                <button
                  key={post.slug}
                  onClick={() => loadPost(post.slug)}
                  className={`w-full text-left rounded px-3 py-2 border ${
                    selectedSlug === post.slug ? 'border-indigo-400 bg-indigo-500/20' : 'border-slate-800 hover:bg-slate-800'
                  }`}
                  disabled={loadingForm}
                >
                  <div className="font-medium">{post.data?.title || post.slug}</div>
                  <div className="text-xs text-slate-400">{post.data?.date || '未设置日期'}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="font-semibold mb-4">{selectedSlug ? '编辑文章' : '新建文章'}</h2>

            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400">快捷格式：</span>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('h1')}>
                H1
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('h2')}>
                H2
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('bold')}>
                粗体
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('italic')}>
                斜体
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('code')}>
                行内代码
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('codeblock')}>
                代码块
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('ul')}>
                无序列表
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('ol')}>
                有序列表
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('quote')}>
                引用
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('link')}>
                链接
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('image')}>
                图片
              </button>
              <button type="button" className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={() => applyFormat('hr')}>
                分隔线
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-1">标题 *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Slug（可选）</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="留空则按标题生成"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">描述</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">日期</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">内容（MDX）</label>
                <textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  rows={16}
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="rounded bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-50"
                >
                  {selectedSlug ? '保存修改' : '创建文章'}
                </button>
                {selectedSlug && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loadingForm}
                    className="rounded border border-red-500 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    删除
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loadingForm}
                  className="text-sm text-slate-300 hover:text-white"
                >
                  重置
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const enabled = process.env.ENABLE_LOCAL_EDITOR === 'true' && process.env.NODE_ENV !== 'production';
  if (!enabled) {
    return { notFound: true };
  }
  return { props: {} };
}

export default EditorPage;
