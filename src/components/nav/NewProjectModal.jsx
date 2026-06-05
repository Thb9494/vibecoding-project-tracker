import { useState } from 'react';
import { INPUT_BASE, PROJECT_COLORS } from '../../constants';
import { newId, today, initials } from '../../utils/ids';

export function NewProjectModal({ onClose, onCreate }) {
  const [name, setName]   = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [badge, setBadge] = useState('');
  const [members, setMembers] = useState([
    { id: newId(), name: 'Theresa' },
    { id: newId(), name: 'Murtaza' },
    { id: newId(), name: 'Makram'  },
  ]);
  const [newMember, setNewMember] = useState('');

  const derivedInitials = badge || (name ? initials(name).slice(0, 2) : '?');

  function addMember() {
    const n = newMember.trim();
    if (!n || members.find(m => m.name.toLowerCase() === n.toLowerCase())) return;
    setMembers(prev => [...prev, { id: newId(), name: n }]);
    setNewMember('');
  }

  function removeMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({
      id: newId(),
      name: name.trim(),
      color,
      initials: derivedInitials,
      createdDate: today(),
      tasks: [],
      documents: [],
      folders: [],
      members: members.map(m => ({ ...m, id: newId() })),
    });
    onClose();
  }

  const L = 'text-xs font-semibold text-stone-400 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-stone-600 shadow-2xl flex flex-col max-h-[90vh]">

        {/* header — fixed */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-bold text-stone-100">New Project</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-800 transition">✕</button>
        </div>

        {/* scrollable body */}
        <div className="overflow-y-auto px-6 pb-2 flex flex-col gap-5">

          {/* preview badge */}
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}>{derivedInitials}</span>
          </div>

          {/* name + create button */}
          <div className="flex flex-col gap-2">
            <label className={L}>Projektname</label>
            <input autoFocus className={`px-3 py-2 text-sm ${INPUT_BASE}`}
              placeholder="z.B. GraceBayGarage" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} disabled={!name.trim() || members.length === 0}
              className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-40 transition">
              + Projekt erstellen
            </button>
          </div>

          {/* color */}
          <div className="flex flex-col gap-2">
            <label className={L}>Farbe</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* initials */}
          <div className="flex flex-col gap-1">
            <label className={L}>Kürzel <span className="font-normal normal-case text-stone-500">· max. 2 Zeichen</span></label>
            <input className={`px-3 py-2 text-sm ${INPUT_BASE}`}
              placeholder={name ? initials(name).slice(0, 2) : 'GB'} maxLength={2}
              value={badge} onChange={e => setBadge(e.target.value.toUpperCase().slice(0, 2))} />
          </div>

          {/* members */}
          <div className="flex flex-col gap-2">
            <label className={L}>Teammitglieder</label>
            <div className="flex flex-col gap-1.5">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-800 px-3 py-2">
                  <span className="text-sm text-stone-200">{m.name}</span>
                  <button onClick={() => removeMember(m.id)} className="text-stone-500 hover:text-red-400 transition text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={`px-3 py-2 text-sm flex-1 ${INPUT_BASE}`}
                placeholder="Name hinzufügen…"
                value={newMember}
                onChange={e => setNewMember(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addMember(); }}
              />
              <button onClick={addMember}
                className="rounded-lg border border-stone-600 px-3 py-2 text-sm font-semibold text-stone-300 hover:bg-stone-800 transition">
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex justify-end px-6 py-4 border-t border-stone-800 shrink-0">
          <button onClick={onClose}
            className="rounded-lg border border-stone-600 px-4 py-2 text-sm font-semibold text-stone-300 hover:bg-stone-800 transition">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
