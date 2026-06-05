import { useState } from 'react';
import { INPUT_BASE } from '../../constants';
import { newId, today } from '../../utils/ids';

const MAX_FILE_WARN = 4 * 1024 * 1024; // 4 MB warning threshold

function DocumentModal({ onClose, onSave }) {
  const [type, setType] = useState('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [filename, setFilename] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [warn, setWarn] = useState('');

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_WARN) setWarn(`⚠ Large file (${(file.size / 1024 / 1024).toFixed(1)} MB) — localStorage limit is ~5 MB total.`);
    else setWarn('');
    setFilename(file.name);
    setFileSize(file.size);
    if (!title) setTitle(file.name);
    const reader = new FileReader();
    reader.onload = ev => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: newId(),
      title: title.trim(),
      type,
      url: type === 'link' ? url.trim() : null,
      body: type === 'file' ? (fileData ?? '') : type === 'note' ? body : '',
      filename: type === 'file' ? filename : null,
      fileSize: type === 'file' ? fileSize : null,
      createdDate: today(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  }

  const L = 'text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Add Document</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition">✕</button>
        </div>

        {/* type selector */}
        <div className="flex gap-2">
          {['link', 'file', 'note'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition
                ${type === t ? 'bg-brand-primary text-white' : 'border border-slate-200 dark:border-stone-600 text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800'}`}>
              {t === 'link' ? '🔗 Link' : t === 'file' ? '📎 File' : '📝 Note'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className={L}>Title</label>
          <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="Give it a name" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {type === 'link' && (
          <div className="flex flex-col gap-1">
            <label className={L}>URL</label>
            <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
        )}

        {type === 'file' && (
          <div className="flex flex-col gap-2">
            <label className={L}>File</label>
            <input type="file" className="text-sm text-slate-600 dark:text-stone-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-brand-dark transition" onChange={handleFile} />
            {warn && <p className="text-xs text-amber-600 dark:text-amber-400">{warn}</p>}
          </div>
        )}

        {type === 'note' && (
          <div className="flex flex-col gap-1">
            <label className={L}>Content</label>
            <textarea rows={5} className={`px-3 py-2 text-sm resize-y ${INPUT_BASE}`} placeholder="Markdown supported…" value={body} onChange={e => setBody(e.target.value)} />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={L}>Tags <span className="font-normal normal-case text-slate-400">· comma separated</span></label>
          <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="design, figjam, research" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-slate-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40 transition">Save</button>
        </div>
      </div>
    </div>
  );
}

function DocCard({ doc, onDelete }) {
  const isImage = doc.body?.startsWith('data:image/');
  return (
    <div className="rounded-xl border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 flex flex-col gap-3">
      {doc.type === 'file' && isImage && (
        <img src={doc.body} alt={doc.title} className="w-full h-32 object-cover rounded-lg" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{doc.type === 'link' ? '🔗' : doc.type === 'file' ? '📎' : '📝'}</span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-stone-100 leading-snug">{doc.title}</p>
            {doc.filename && <p className="text-xs text-slate-400 dark:text-stone-500">{doc.filename} · {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''}</p>}
            {doc.url && <p className="text-xs text-slate-400 dark:text-stone-500 truncate max-w-[180px]">{doc.url}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(doc.id)} className="shrink-0 text-slate-300 hover:text-red-400 dark:text-stone-600 dark:hover:text-red-400 transition">✕</button>
      </div>
      {doc.type === 'note' && doc.body && (
        <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-3 font-mono">{doc.body}</p>
      )}
      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.map(t => <span key={t} className="rounded-full bg-slate-100 dark:bg-stone-700 px-2 py-0.5 text-[11px] text-slate-500 dark:text-stone-400">{t}</span>)}
        </div>
      )}
      {doc.type === 'link' && doc.url && (
        <a href={doc.url} target="_blank" rel="noreferrer"
          className="self-start rounded-lg bg-brand-primary px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition">
          Open →
        </a>
      )}
      {doc.type === 'file' && doc.body && !isImage && (
        <a href={doc.body} download={doc.filename ?? doc.title}
          className="self-start rounded-lg bg-brand-primary px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition">
          Download
        </a>
      )}
    </div>
  );
}

export function DocumentsView({ project, onUpdateProject }) {
  const [showModal, setShowModal] = useState(false);
  const docs = project.documents ?? [];

  function handleSave(doc) {
    onUpdateProject({ ...project, documents: [...docs, doc] });
  }

  function handleDelete(id) {
    onUpdateProject({ ...project, documents: docs.filter(d => d.id !== id) });
  }

  const files = docs.filter(d => d.type === 'file');
  const links = docs.filter(d => d.type === 'link');
  const notes = docs.filter(d => d.type === 'note');

  return (
    <div className="px-6 py-10 pb-32 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">Documents</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark transition">
          + Add
        </button>
      </div>

      {docs.length === 0 && (
        <div className="text-center py-20 text-slate-400 dark:text-stone-500">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-sm">No documents yet — add links, files, or notes.</p>
        </div>
      )}

      {files.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide mb-3">Files</h2>
          <div className="grid grid-cols-3 gap-4">
            {files.map(d => <DocCard key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        </section>
      )}

      {links.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide mb-3">Links</h2>
          <div className="grid grid-cols-3 gap-4">
            {links.map(d => <DocCard key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide mb-3">Notes</h2>
          <div className="flex flex-col gap-3">
            {notes.map(d => <DocCard key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
        </section>
      )}

      {showModal && <DocumentModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
