
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KanbanTask } from '../types';

interface KanbanProps {
  tasks: KanbanTask[];
  onAdd: (task: Omit<KanbanTask, 'id'>) => void;
  onUpdate: (task: KanbanTask) => void;
  onUpdateStatus: (id: string, status: KanbanTask['status']) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const Kanban: React.FC<KanbanProps> = ({ tasks, onAdd, onUpdate, onUpdateStatus, onDelete, currency }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<KanbanTask | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const columns: { id: KanbanTask['status']; label: string; dot: string }[] = [
    { id: 'todo', label: t('kanban.columns.todo'), dot: 'bg-gray-400' },
    { id: 'in-progress', label: t('kanban.columns.in_progress'), dot: 'bg-blue-500' },
    { id: 'delivered', label: t('kanban.columns.delivered'), dot: 'bg-purple-500' },
    { id: 'pending-payment', label: t('kanban.columns.pending_payment'), dot: 'bg-amber-500' },
    { id: 'done', label: t('kanban.columns.done'), dot: 'bg-emerald-500' },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const moveForward = (id: string, currentStatus: KanbanTask['status']) => {
    const sequence: KanbanTask['status'][] = ['todo', 'in-progress', 'delivered', 'pending-payment', 'done'];
    const nextIndex = sequence.indexOf(currentStatus) + 1;
    if (nextIndex < sequence.length) {
      onUpdateStatus(id, sequence[nextIndex]);
    }
  };

  const moveBackward = (id: string, currentStatus: KanbanTask['status']) => {
    const sequence: KanbanTask['status'][] = ['todo', 'in-progress', 'delivered', 'pending-payment', 'done'];
    const prevIndex = sequence.indexOf(currentStatus) - 1;
    if (prevIndex >= 0) {
      onUpdateStatus(id, sequence[prevIndex]);
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newClient && newAmount) {
      onAdd({
        title: newTitle,
        client: newClient.toUpperCase(),
        amount: parseFloat(newAmount),
        category: 'Desarrollo',
        status: 'todo',
        progress: 0,
        notes: newNotes
      });
      setShowModal(false);
      setNewTitle('');
      setNewClient('');
      setNewAmount('');
      setNewNotes('');
    }
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTask) {
      onUpdate(editTask);
      setEditTask(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="px-6 lg:px-10 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-display tracking-tight">{t('kanban.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('kanban.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          {t('kanban.new_btn')}
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 lg:px-10 pb-2 mb-6">
        <div className="flex gap-8 h-full min-w-max pb-4">
          {columns.map(col => (
            <div key={col.id} className="w-[380px] flex-shrink-0 flex flex-col h-full">
              <div className="p-4 flex items-center justify-between mb-4 bg-white/50 dark:bg-surface-dark/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                  <h3 className="font-black text-gray-900 dark:text-gray-200 text-sm uppercase tracking-widest">{col.label}</h3>
                </div>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-1 rounded-lg font-black tracking-tighter">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-10">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700 group relative transition-all hover:shadow-2xl hover:border-emerald-100 dark:hover:border-emerald-900/30">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-slate-900 dark:text-gray-100 text-xl leading-tight pr-8">{task.title}</h4>
                      <button onClick={() => onDelete(task.id)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                        <span className="material-icons-round text-lg">delete</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 mb-6 uppercase tracking-[0.2em]">{task.client}</p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('kanban.modal.progress')}</span>
                        <span className="text-xs font-black text-primary">{task.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-[8px] overflow-hidden border border-slate-50 dark:border-slate-700">
                        <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${task.progress || 0}%` }}></div>
                      </div>
                    </div>

                    {/* Notes Badge & Latest Note */}
                    {(task.projectNotes?.length || 0) > 0 || task.notes ? (
                      <div className="mb-6 space-y-2">
                        {/* Show legacy note if exists and no project notes (migration) */}
                        {task.notes && (!task.projectNotes || task.projectNotes.length === 0) && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed">"{task.notes}"</p>
                          </div>
                        )}

                        {/* Show Latest Note */}
                        {task.projectNotes && task.projectNotes.length > 0 && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-icons-round text-[10px] text-primary">chat_bubble</span>
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Última Nota</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                              "{task.projectNotes[task.projectNotes.length - 1].text}"
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {task.projectNotes && task.projectNotes.length > 0 && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <span className="material-icons-round text-[10px]">history</span>
                              {task.projectNotes.length} notas
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(task.amount)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditTask(task)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-primary transition-all mr-2"
                          title="Editar detalles"
                        >
                          <span className="material-icons-round text-lg">edit</span>
                        </button>
                        <button
                          disabled={col.id === 'todo'}
                          onClick={() => moveBackward(task.id, task.status)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:bg-slate-200 transition-all disabled:opacity-20"
                          title="Retroceder etapa"
                        >
                          <span className="material-icons-round text-lg">chevron_left</span>
                        </button>
                        <button
                          disabled={col.id === 'done'}
                          onClick={() => moveForward(task.id, task.status)}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-all disabled:opacity-20"
                          title="Avanzar etapa"
                        >
                          <span className="material-icons-round text-lg">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="py-16 text-center border-4 border-dashed border-slate-100 dark:border-slate-800/50 rounded-[40px] flex flex-col items-center justify-center gap-3 opacity-50">
                    <span className="material-icons-outlined text-slate-300 text-4xl">inventory_2</span>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{t('kanban.empty_lane')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Nuevo Proyecto */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('kanban.modal.create_title')}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-black">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('kanban.modal.job_title')}</label>
                <input required type="text" placeholder="Ej. Rediseño App Móvil" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('kanban.modal.client')}</label>
                <input required type="text" placeholder="Ej. NEXUS TECH" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newClient} onChange={(e) => setNewClient(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('kanban.modal.budget')}</label>
                <input required type="number" placeholder="Monto total" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('kanban.modal.notes')}</label>
                <textarea placeholder="Detalles o requerimientos..." className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-medium dark:text-white" rows={2} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
              </div>
              <button type="submit" className="w-full py-4.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all uppercase tracking-widest text-xs mt-4">{t('kanban.modal.submit_btn')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Detalles del Proyecto */}
      {editTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('kanban.modal.edit_title')}</h2>
              <button onClick={() => setEditTask(null)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-black">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('kanban.modal.progress')}</label>
                  <span className="text-xs font-black text-primary">{editTask.progress}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={editTask.progress || 0}
                  onChange={(e) => setEditTask({ ...editTask, progress: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-left">{t('kanban.modal.job_title')}</label>
                <input required type="text" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest text-left">{t('kanban.modal.log')}</label>

                {/* Historial de Notas */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-3 max-h-[200px] overflow-y-auto space-y-3 custom-scrollbar border border-slate-100 dark:border-slate-800">
                  {editTask.projectNotes && editTask.projectNotes.length > 0 ? (
                    editTask.projectNotes.map((note) => (
                      <div key={note.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(note.createdAt).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedNotes = editTask.projectNotes?.filter(n => n.id !== note.id);
                              setEditTask({ ...editTask, projectNotes: updatedNotes });
                            }}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <span className="material-icons-round text-sm">delete</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pr-6">{note.text}</p>
                      </div>
                    )).reverse()
                  ) : (
                    <p className="text-center text-xs text-slate-400 italic py-4">No hay notas registradas.</p>
                  )}
                </div>

                {/* Input Nueva Nota */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('kanban.modal.new_note_placeholder')}
                    className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-medium dark:text-white"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (noteInput.trim()) {
                          const newNoteItem = {
                            id: Math.random().toString(36).substr(2, 9),
                            text: noteInput,
                            createdAt: new Date().toISOString()
                          };
                          setEditTask({
                            ...editTask,
                            projectNotes: [...(editTask.projectNotes || []), newNoteItem]
                          });
                          setNoteInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (noteInput.trim()) {
                        const newNoteItem = {
                          id: Math.random().toString(36).substr(2, 9),
                          text: noteInput,
                          createdAt: new Date().toISOString()
                        };
                        setEditTask({
                          ...editTask,
                          projectNotes: [...(editTask.projectNotes || []), newNoteItem]
                        });
                        setNoteInput('');
                      }
                    }}
                    className="bg-slate-900 dark:bg-slate-700 text-white w-12 rounded-2xl flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <span className="material-icons-round">send</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-4.5 bg-primary text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition-all uppercase tracking-widest text-xs">{t('kanban.modal.update_btn')}</button>
            </form>
          </div >
        </div >
      )}
    </div >
  );
};

export default Kanban;
