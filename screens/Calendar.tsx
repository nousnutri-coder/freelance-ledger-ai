
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent, Client } from '../types';

interface CalendarProps {
  events: CalendarEvent[];
  clients: Client[];
  onAddEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (e: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events = [], clients = [], onAddEvent, onDeleteEvent, onUpdateEvent }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('day'); // Default to day view for "Excelnet" feel
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00',
    type: 'meeting',
    completed: false
  });

  // --- Helper Functions ---
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  // Dynamic Date Formatters
  const getMonthName = (m: number) => new Date(year, m).toLocaleString(i18n.language, { month: 'long' });
  const getDayName = (date: Date) => date.toLocaleString(i18n.language, { weekday: 'long' });
  const weekDays = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, i + 1).toLocaleString(i18n.language, { weekday: 'short' })); // Jan 1 2023 was Sunday

  const getEventsForDay = (day: number | Date) => {
    if (!events || !Array.isArray(events)) return [];
    let dStr = '';
    try {
      if (typeof day === 'number') {
        dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        dStr = day.toISOString().split('T')[0];
      }
      return events.filter(e => e.date === dStr).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
    } catch (err) {
      console.error("Error formatting date", err);
      return [];
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(newEvent);
    setShowAddModal(false);
    setNewEvent({ ...newEvent, title: '', completed: false, notes: '', meetingLink: '' });
  };

  const toggleReminder = (event: CalendarEvent) => {
    onUpdateEvent({ ...event, completed: !event.completed });
  };

  const eventTypeColors = {
    meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500',
    'deep-work': 'bg-primary/10 text-primary dark:bg-emerald-900/30 dark:text-emerald-400 border-l-4 border-primary',
    deadline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-l-4 border-red-500',
    break: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-l-4 border-gray-400',
    reminder: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-l-4 border-amber-500',
  };

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 AM to 23 PM
  const pendingReminders = events.filter(e => e.type === 'reminder' && !e.completed);

  return (
    <div className="p-6 md:p-10 pb-20 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <span className="material-icons-round text-primary">calendar_month</span>
            {t('calendar.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('calendar.subtitle')}</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'month' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t('calendar.month_view')}
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'day' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t('calendar.day_view')}
          </button>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
        <button onClick={prevPeriod} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors">
          <span className="material-icons-round">chevron_left</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            {viewMode === 'month'
              ? `${getMonthName(month)} ${year}`
              : `${getDayName(currentDate)}, ${currentDate.getDate()} ${t('common.of', { defaultValue: 'de' })} ${getMonthName(month)}`
            }
          </h2>
          {viewMode === 'day' && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{t('calendar.daily_detail')}</p>}
        </div>

        <button onClick={nextPeriod} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors">
          <span className="material-icons-round">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Calendar Area */}
        <div className="lg:col-span-3 bg-white dark:bg-surface-dark rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800 p-6 md:p-8 overflow-hidden min-h-[600px]">

          {/* MONTH VIEW */}
          {viewMode === 'month' && (
            <>
              <div className="grid grid-cols-7 mb-6">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-4">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-900/30 h-28 md:h-36"></div>
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      onClick={() => { setCurrentDate(new Date(year, month, day)); setViewMode('day'); }}
                      className={`bg-white dark:bg-slate-900 h-28 md:h-36 p-2 flex flex-col transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer relative group`}
                    >
                      <div className={`text-xs font-black mb-1 flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}>
                        {day}
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                        {dayEvents.slice(0, 3).map(evt => (
                          <div key={evt.id} className={`w-2 h-2 rounded-full ${evt.type === 'meeting' ? 'bg-blue-500' : 'bg-slate-300'} mx-auto`} title={evt.title}></div>
                        ))}
                        {dayEvents.length > 0 && <span className="text-[9px] text-center block text-slate-400 font-bold">{dayEvents.length} eventos</span>}
                      </div>
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary uppercase">{t('calendar.view_day')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* DAY VIEW (Time Grid) */}
          {viewMode === 'day' && (
            <div className="relative">
              <div className="absolute top-0 left-16 bottom-0 w-px bg-slate-100 dark:bg-slate-800"></div>

              {hours.map(hour => {
                const hourEvents = getEventsForDay(currentDate).filter(e => {
                  if (!e.start) return false;
                  try {
                    const eventHour = parseInt(e.start.split(':')[0]);
                    return eventHour === hour;
                  } catch { return false; }
                });

                return (
                  <div key={hour} className="flex min-h-[100px] border-b border-slate-50 dark:border-slate-800/50 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors relative">
                    {/* Time Column */}
                    <div className="w-16 pr-4 py-3 text-right sticky left-0 bg-white/95 dark:bg-surface-dark/95 z-10">
                      <span className="text-xs font-bold text-slate-400">{hour}:00</span>
                      <span className="text-[9px] text-slate-300 block font-medium">{hour < 12 ? 'AM' : 'PM'}</span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-2 relative">
                      {/* Empty slot click target */}
                      <div
                        className="absolute inset-0 z-0 cursor-pointer"
                        onClick={() => {
                          setNewEvent({
                            ...newEvent,
                            date: currentDate.toISOString().split('T')[0],
                            start: `${String(hour).padStart(2, '0')}:00`,
                            end: `${String(hour + 1).padStart(2, '0')}:00`
                          });
                          setShowAddModal(true);
                        }}
                      ></div>

                      {/* Events in this hour */}
                      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hourEvents.map(evt => (
                          <div
                            key={evt.id}
                            className={`rounded-xl p-3 border shadow-sm transition-all hover:shadow-md cursor-pointer ${eventTypeColors[evt.type]} ${evt.completed ? 'opacity-60 saturate-0' : ''}`}
                            onClick={() => toggleReminder(evt)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black uppercase opacity-70 tracking-widest flex items-center gap-1">
                                {evt.type === 'meeting' && <span className="material-icons-round text-[10px]">videocam</span>}
                                {evt.start} - {evt.end}
                              </span>
                              {evt.completed && <span className="material-icons-round text-emerald-500 text-sm">check_circle</span>}
                            </div>
                            <h4 className={`font-bold text-sm leading-tight ${evt.completed ? 'line-through' : ''}`}>
                              {evt.title}
                            </h4>

                            {/* Notes & Links */}
                            {(evt.notes || evt.meetingLink) && (
                              <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 space-y-1">
                                {evt.notes && <p className="text-[10px] italic opacity-80 line-clamp-2">"{evt.notes}"</p>}
                                {evt.meetingLink && (
                                  <a
                                    href={evt.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1 text-[10px] font-bold underline hover:text-blue-600 mt-1"
                                  >
                                    <span className="material-icons-round text-[10px]">link</span>
                                    Unirse a reunión
                                  </a>
                                )}
                              </div>
                            )}

                            <button
                              onClick={(e) => { e.stopPropagation(); if (confirm('¿Borrar?')) onDeleteEvent(evt.id); }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                            >
                              <span className="material-icons-round text-sm">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <button
            onClick={() => {
              setNewEvent(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] }));
              setShowAddModal(true);
            }}
            className="w-full py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-icons-round group-hover:rotate-90 transition-transform">add</span>
            {t('calendar.new_event')}
          </button>

          <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-soft border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('calendar.upcoming_reminders')}</h4>
            <div className="space-y-3">
              {pendingReminders.slice(0, 5).map(evt => (
                <div key={evt.id} className="flex gap-3 group items-center cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors" onClick={() => toggleReminder(evt)}>
                  <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">radio_button_unchecked</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{evt.title}</p>
                    <p className="text-[9px] text-slate-400">{evt.date}</p>
                  </div>
                </div>
              ))}
              {pendingReminders.length === 0 && <p className="text-[10px] text-slate-400 text-center italic">{t('calendar.all_completed')}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Programar */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-[40px] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('calendar.schedule_activity')}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-black hover:bg-slate-200 transition-all">
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.what_to_do')}</label>
                <input required autoFocus placeholder="Ej. Reunión con Cliente o Ejercicio" type="text" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-4 focus:ring-2 focus:ring-primary text-base font-bold dark:text-white placeholder:font-medium placeholder:text-slate-300" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.date')}</label>
                  <input required type="date" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.type')}</label>
                  <select className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}>
                    <option value="meeting">{t('calendar.types.meeting')}</option>
                    <option value="deep-work">{t('calendar.types.deep_work')}</option>
                    <option value="deadline">{t('calendar.types.deadline')}</option>
                    <option value="reminder">{t('calendar.types.reminder')}</option>
                    <option value="break">{t('calendar.types.break')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.start')}</label>
                  <input required type="time" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newEvent.start} onChange={e => setNewEvent({ ...newEvent, start: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.end')}</label>
                  <input required type="time" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-bold dark:text-white" value={newEvent.end} onChange={e => setNewEvent({ ...newEvent, end: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.notes')}</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Levantarme a las 3am, preparar café..."
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm font-medium dark:text-white resize-none"
                  value={newEvent.notes || ''}
                  onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('calendar.meeting_link')}</label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 pl-10 focus:ring-2 focus:ring-primary text-sm font-medium dark:text-white"
                    value={newEvent.meetingLink || ''}
                    onChange={e => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                  />
                  <span className="material-icons-round absolute left-3 top-3.5 text-slate-400">link</span>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs mt-2">
                {t('calendar.confirm_event')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
