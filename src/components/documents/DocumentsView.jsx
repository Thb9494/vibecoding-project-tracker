import { useState, useRef } from 'react';
import { INPUT_BASE } from '../../constants';
import { newId, today } from '../../utils/ids';

const MAX_FILE_WARN = 4 * 1024 * 1024;

// ── helpers ───────────────────────────────────────────────────────────────────

function readFileAsDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function fileIcon(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) return '🖼';
  if (['pdf'].includes(ext)) return '📄';
  if (['pptx','ppt'].includes(ext)) return '📊';
  if (['docx','doc'].includes(ext)) return '📝';
  if (['xlsx','xls','csv'].includes(ext)) return '📈';
  if (['zip','rar','7z'].includes(ext)) return '🗜';
  return '📎';
}

// ── DocumentModal ─────────────────────────────────────────────────────────────

function DocumentModal({ onClose, onSave, folders }) {
  const [type, setType]       = useState('link');
  const [title, setTitle]     = useState('');
  const [url, setUrl]         = useState('');
  const [body, setBody]       = useState('');
  const [tags, setTags]       = useState('');
  const [folderId, setFolderId] = useState('');
  const [filename, setFilename] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [warn, setWarn]       = useState('');

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_WARN) setWarn(`⚠ Große Datei (${(file.size/1024/1024).toFixed(1)} MB) — localStorage-Limit ~5 MB.`);
    else setWarn('');
    setFilename(file.name);
    setFileSize(file.size);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
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
      folderId: folderId || null,
    });
    onClose();
  }

  const L = 'text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Dokument hinzufügen</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition">✕</button>
        </div>

        <div className="flex gap-2">
          {['link','file','note'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition
                ${type === t ? 'bg-brand-primary text-white' : 'border border-stone-600 text-stone-400 hover:bg-stone-800'}`}>
              {t === 'link' ? '🔗 Link' : t === 'file' ? '📎 File' : '📝 Note'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className={L}>Titel</label>
          <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="Name" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {type === 'link' && (
          <div className="flex flex-col gap-1">
            <label className={L}>URL</label>
            <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
        )}
        {type === 'file' && (
          <div className="flex flex-col gap-2">
            <label className={L}>Datei</label>
            <input type="file" className="text-sm text-slate-600 dark:text-stone-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-brand-dark transition" onChange={handleFile} />
            {warn && <p className="text-xs text-amber-500">{warn}</p>}
          </div>
        )}
        {type === 'note' && (
          <div className="flex flex-col gap-1">
            <label className={L}>Inhalt</label>
            <textarea rows={5} className={`px-3 py-2 text-sm resize-y ${INPUT_BASE}`} placeholder="Markdown…" value={body} onChange={e => setBody(e.target.value)} />
          </div>
        )}

        {folders.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className={L}>Ordner <span className="font-normal normal-case text-slate-400">· optional</span></label>
            <select className={`px-3 py-2 text-sm ${INPUT_BASE} dark:[color-scheme:dark]`} value={folderId} onChange={e => setFolderId(e.target.value)}>
              <option value="">— Kein Ordner —</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className={L}>Tags <span className="font-normal normal-case text-slate-400">· kommagetrennt</span></label>
          <input className={`px-3 py-2 text-sm ${INPUT_BASE}`} placeholder="design, research" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg border border-slate-200 dark:border-stone-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-stone-800 transition">Abbrechen</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40 transition">Speichern</button>
        </div>
      </div>
    </div>
  );
}

// ── DocCard ───────────────────────────────────────────────────────────────────

function DocCard({ doc, onDelete, folders, onMove }) {
  const isImage = doc.body?.startsWith('data:image/');
  const icon = doc.type === 'link' ? '🔗' : doc.type === 'note' ? '📝' : fileIcon(doc.filename);

  return (
    <div className="rounded-xl border border-stone-700 bg-zinc-800 p-4 flex flex-col gap-3 min-h-[120px]">
      {doc.type === 'file' && isImage && (
        <img src={doc.body} alt={doc.title} className="w-full h-36 object-cover rounded-lg" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-xl shrink-0 mt-0.5">{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-100 leading-snug break-words">{doc.title}</p>
            {doc.filename && (
              <p className="text-xs text-stone-500 mt-0.5 break-all">{doc.filename} · {doc.fileSize ? `${(doc.fileSize/1024).toFixed(0)} KB` : ''}</p>
            )}
            {doc.url && (
              <p className="text-xs text-stone-500 mt-0.5 truncate">{doc.url}</p>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(doc.id)} className="shrink-0 text-stone-600 hover:text-red-400 transition text-lg leading-none">✕</button>
      </div>

      {doc.type === 'note' && doc.body && (
        <p className="text-xs text-stone-400 line-clamp-4 font-mono whitespace-pre-wrap">{doc.body}</p>
      )}

      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.map(t => <span key={t} className="rounded-full bg-stone-700 px-2 py-0.5 text-[11px] text-stone-400">{t}</span>)}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto flex-wrap">
        {doc.type === 'link' && doc.url && (
          <a href={doc.url} target="_blank" rel="noreferrer"
            className="rounded-lg bg-brand-primary px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition">
            Öffnen →
          </a>
        )}
        {doc.type === 'file' && doc.body && !isImage && (
          <a href={doc.body} download={doc.filename ?? doc.title}
            className="rounded-lg bg-brand-primary px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition">
            Download
          </a>
        )}
        {folders.length > 0 && (
          <select
            value={doc.folderId ?? ''}
            onChange={e => onMove(doc.id, e.target.value || null)}
            onClick={e => e.stopPropagation()}
            className="text-xs text-stone-400 bg-transparent border border-stone-600 rounded-lg px-2 py-1 cursor-pointer hover:border-stone-400 focus:outline-none dark:[color-scheme:dark] transition"
          >
            <option value="">📁 Kein Ordner</option>
            {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

// ── DocumentsView ─────────────────────────────────────────────────────────────

export function DocumentsView({ project, onUpdateProject }) {
  const [showModal, setShowModal]   = useState(false);
  const [newFolder, setNewFolder]   = useState(false);
  const [folderName, setFolderName] = useState('');
  const [openFolders, setOpenFolders] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const docs    = project.documents ?? [];
  const folders = project.folders   ?? [];

  // ── save helpers ────────────────────────────────────────────────────────────

  function saveDoc(doc) {
    onUpdateProject({ ...project, documents: [...docs, doc] });
  }

  function deleteDoc(id) {
    onUpdateProject({ ...project, documents: docs.filter(d => d.id !== id) });
  }

  function moveDoc(docId, folderId) {
    onUpdateProject({ ...project, documents: docs.map(d => d.id === docId ? { ...d, folderId: folderId || null } : d) });
  }

  function createFolder() {
    if (!folderName.trim()) return;
    const folder = { id: newId(), name: folderName.trim() };
    onUpdateProject({ ...project, folders: [...folders, folder] });
    setFolderName('');
    setNewFolder(false);
    setOpenFolders(prev => ({ ...prev, [folder.id]: true }));
  }

  function deleteFolder(folderId) {
    // move docs out of folder before deleting
    const updatedDocs = docs.map(d => d.folderId === folderId ? { ...d, folderId: null } : d);
    onUpdateProject({ ...project, folders: folders.filter(f => f.id !== folderId), documents: updatedDocs });
  }

  // ── file drop ───────────────────────────────────────────────────────────────

  async function handleDrop(e) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;
    for (const file of droppedFiles) {
      const data = await readFileAsDataURL(file);
      saveDoc({
        id: newId(),
        title: file.name.replace(/\.[^.]+$/, ''),
        type: 'file',
        url: null,
        body: data,
        filename: file.name,
        fileSize: file.size,
        createdDate: today(),
        tags: [],
        folderId: null,
      });
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const unfiled = docs.filter(d => !d.folderId);

  return (
    <div
      className={`px-6 py-10 pb-32 max-w-5xl mx-auto min-h-screen transition-all
        ${isDragOver ? 'ring-2 ring-inset ring-brand-ring bg-brand-primary/10' : ''}`}
      onDragEnter={e => { e.preventDefault(); dragCounter.current++; setIsDragOver(true); }}
      onDragOver={e => e.preventDefault()}
      onDragLeave={() => { dragCounter.current--; if (dragCounter.current === 0) setIsDragOver(false); }}
      onDrop={handleDrop}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-100">Documents</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setNewFolder(true)}
            className="flex items-center gap-1.5 rounded-xl border border-stone-600 px-3 py-2 text-sm font-semibold text-stone-300 hover:bg-stone-800 transition">
            📁 Ordner
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark transition">
            + Add
          </button>
        </div>
      </div>

      {/* drop hint */}
      {isDragOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="rounded-2xl bg-brand-primary/10 border-2 border-brand-ring px-10 py-6 text-brand-ring text-lg font-semibold backdrop-blur-sm">
            📂 Datei hier ablegen
          </div>
        </div>
      )}

      {/* new folder input */}
      {newFolder && (
        <div className="mb-6 flex items-center gap-2">
          <input
            autoFocus
            className={`px-3 py-2 text-sm flex-1 ${INPUT_BASE}`}
            placeholder="Ordnername…"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setNewFolder(false); }}
          />
          <button onClick={createFolder} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition">Erstellen</button>
          <button onClick={() => setNewFolder(false)} className="rounded-lg border border-stone-600 px-3 py-2 text-sm text-stone-400 hover:bg-stone-800 transition">✕</button>
        </div>
      )}

      {/* empty state */}
      {docs.length === 0 && folders.length === 0 && !isDragOver && (
        <div className="text-center py-24 text-stone-500">
          <p className="text-5xl mb-4">📂</p>
          <p className="text-sm">Noch keine Dokumente — hinzufügen oder Datei reinziehen.</p>
        </div>
      )}

      {/* folders */}
      {folders.map(folder => {
        const folderDocs = docs.filter(d => d.folderId === folder.id);
        const isOpen = openFolders[folder.id] ?? true;
        return (
          <section key={folder.id} className="mb-8">
            <div className="flex items-center gap-2 mb-3 group">
              <button
                onClick={() => setOpenFolders(prev => ({ ...prev, [folder.id]: !isOpen }))}
                className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wide hover:text-stone-200 transition"
              >
                <span>{isOpen ? '▾' : '▸'}</span>
                <span>📁 {folder.name}</span>
                <span className="text-stone-600">({folderDocs.length})</span>
              </button>
              <button onClick={() => deleteFolder(folder.id)}
                className="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-400 transition text-sm ml-1">✕</button>
            </div>
            {isOpen && (
              folderDocs.length === 0
                ? <p className="text-xs text-stone-600 pl-6">Leer — verschiebe Dokumente hierher.</p>
                : <div className="grid grid-cols-3 gap-4">
                    {folderDocs.map(d => <DocCard key={d.id} doc={d} onDelete={deleteDoc} folders={folders} onMove={moveDoc} />)}
                  </div>
            )}
          </section>
        );
      })}

      {/* unfiled docs */}
      {unfiled.length > 0 && (
        <section className="mb-8">
          {folders.length > 0 && (
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Ohne Ordner</h2>
          )}
          <div className="grid grid-cols-3 gap-4">
            {unfiled.map(d => <DocCard key={d.id} doc={d} onDelete={deleteDoc} folders={folders} onMove={moveDoc} />)}
          </div>
        </section>
      )}

      {showModal && <DocumentModal onClose={() => setShowModal(false)} onSave={saveDoc} folders={folders} />}
    </div>
  );
}
