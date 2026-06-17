
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import DashboardV2 from './screens/DashboardV2';
import Transactions from './screens/Transactions';
import Kanban from './screens/Kanban';
import Settings from './screens/Settings';
import Clients from './screens/Clients';
import Quotations from './screens/Quotations';
import Calendar from './screens/Calendar';
import Intelligence from './screens/Intelligence';
import Health from './screens/Health';
import PendingItems from './screens/PendingItems';
import Legal from './screens/Legal';
import Checkout from './screens/Checkout';
import PaymentSuccess from './screens/PaymentSuccess';
import Layout from './components/Layout';
import { Transaction, KanbanTask, UserProfile, Client, Quotation, CalendarEvent } from './types';
import { requestNotificationPermission, sendNotification } from './services/notificationService';
import MotivationalModal from './components/MotivationalModal';
import { AuthProvider, useAuth } from './context/AuthContext';
// import { PrivacyProvider } from './context/PrivacyContext'; (Moved to index.tsx)

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-10-24', description: 'Integración API REST', amount: 1250000, type: 'income', category: 'Desarrollo', status: 'paid' },
  { id: '2', date: '2024-10-23', description: 'Servidor AWS', amount: 180000, type: 'expense', category: 'Infraestructura', status: 'fixed' },
  { id: '3', date: '2024-10-21', description: 'Suscripción Figma', amount: 60000, type: 'expense', category: 'Diseño', status: 'fixed' },
  { id: '4', date: '2024-10-18', description: 'Diseño Landing SaaS', amount: 2800000, type: 'income', category: 'Diseño', status: 'pending' },
];

const INITIAL_TASKS: KanbanTask[] = [
  { id: 'k1', title: 'Landing Page SaaS', client: 'NEXUS TECH', amount: 1200000, category: 'Web Design', status: 'todo', progress: 0, notes: 'Fase inicial de prototipado.', projectNotes: [] },
  { id: 'k2', title: 'Migración Shopify', client: 'FASHION NOVA', amount: 3500000, category: 'E-Commerce', status: 'in-progress', progress: 45, notes: 'Migrando base de datos de productos.', projectNotes: [] },
  { id: 'k3', title: 'API Integration', client: 'FINTECH CORP', amount: 2100000, category: 'Backend', status: 'pending-payment', progress: 100, notes: 'Esperando confirmación del cliente.', projectNotes: [] },
];
import { fetchTransactions, addTransaction as apiAddTransaction, deleteTransaction as apiDeleteTransaction, updateTransaction as apiUpdateTransaction, fetchTasks, addTask as apiAddTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, fetchClients, addClient as apiAddClient, updateClient as apiUpdateClient, deleteClient as apiDeleteClient, fetchQuotations, addQuotation as apiAddQuotation, deleteQuotation as apiDeleteQuotation, updateQuotation as apiUpdateQuotation, fetchEvents, addEvent as apiAddEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from './services/dbService';

const AuthenticatedApp: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  // Use userProfile from context or fallback to default for demo/dev if not logged in fully
  // In a real scenario, we might force userProfile to exist.
  // For now, let's allow basic usage even if profile isn't fully fetched, but ideally we wait.

  const currentUser: UserProfile = userProfile || {
    name: user?.email?.split('@')[0] || 'Usuario',
    email: user?.email || '',
    currency: 'COP',
    companyName: userProfile?.companyName,
    companyDescription: userProfile?.companyDescription,
    profileImage: userProfile?.profileImage || 'https://ui-avatars.com/api/?name=' + (user?.email || 'User')
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>(['¡Bienvenido!', 'Sistema conectado a nube.']);

  const currentBalance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  // Load Data from Supabase
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const [txs, tsks, clis, quotes, evts] = await Promise.all([
            fetchTransactions(user.id),
            fetchTasks(user.id),
            fetchClients(user.id),
            fetchQuotations(user.id),
            fetchEvents(user.id)
          ]);
          setTransactions(txs);
          setTasks(tsks);
          setClients(clis);
          setQuotations(quotes);
          setEvents(evts);
        } catch (error) {
          console.error("Error loading data:", error);
          addNotification("Error cargando datos de la nube.");
        }
      };
      loadData();
    }
  }, [user]);

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      const newTx = await apiAddTransaction(user.id, t);
      setTransactions(prev => [newTx, ...prev]);
      addNotification(`Transacción añadida: ${t.description}`);
    } catch (e) {
      console.error(e);
      addNotification("Error guardando transacción.");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiDeleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      addNotification(`Transacción eliminada.`);
    } catch (e) { console.error(e); }
  };

  const toggleTransactionStatus = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    const newStatus = tx.status === 'paid' ? 'pending' : 'paid';

    try {
      await apiUpdateTransaction(id, { status: newStatus });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (e) { console.error(e); }
  };

  const addTask = async (t: Omit<KanbanTask, 'id'>) => {
    if (!user) return;
    try {
      const newTask = await apiAddTask(user.id, t);
      setTasks(prev => [...prev, newTask]);
      addNotification(`Proyecto: ${t.title}`);
    } catch (e) { console.error(e); }
  };

  const updateTask = async (updatedTask: KanbanTask) => {
    try {
      await apiUpdateTask(updatedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      addNotification(`Proyecto "${updatedTask.title}" actualizado.`);
    } catch (e) { console.error(e); }
  };

  const updateTaskStatus = async (id: string, newStatus: KanbanTask['status']) => {
    try {
      let progress = tasks.find(t => t.id === id)?.progress || 0;
      if (newStatus === 'done') progress = 100;
      if (newStatus === 'todo') progress = 0;
      await apiUpdateTask(id, { status: newStatus, progress });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, progress } : t));
    } catch (e) { console.error(e); }
  };

  const addClient = async (c: Omit<Client, 'id'>) => {
    if (!user) return;
    try {
      const newClient = await apiAddClient(user.id, c);
      setClients(prev => [...prev, newClient]);
      addNotification(`Cliente ${c.company} añadido.`);
    } catch (e) { console.error(e); }
  };

  const updateClient = async (id: string, c: Partial<Client>) => {
    try {
      await apiUpdateClient(id, c);
      setClients(prev => prev.map(client => client.id === id ? { ...client, ...c } : client));
      addNotification(`Cliente actualizado.`);
    } catch (e) { console.error(e); }
  };

  const deleteClient = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await apiDeleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
        addNotification(`Cliente eliminado correctamente.`);
      } catch (e) { console.error(e); }
    }
  };

  const addQuotation = async (q: Omit<Quotation, 'id'>) => {
    if (!user) return;
    try {
      const newQuote = await apiAddQuotation(user.id, q);
      setQuotations(prev => [newQuote, ...prev]);
      addNotification(`Cotización generada.`);
    } catch (e) { console.error(e); }
  };

  const updateQuotationStatus = async (id: string, status: Quotation['status']) => {
    try {
      await apiUpdateQuotation(id, { status });
      setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
      addNotification(`Estado de cotización ${id} actualizado a ${status}.`);
    } catch (e) { console.error(e); }
  };

  const deleteQuotation = async (id: string) => {
    try {
      await apiDeleteQuotation(id);
      setQuotations(prev => prev.filter(q => q.id !== id));
      addNotification("Cotización eliminada");
    } catch (e) { console.error(e); }
  };

  const addEvent = async (e: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;
    try {
      const newEvent = await apiAddEvent(user.id, e);
      setEvents(prev => [...prev, newEvent]);
      addNotification(`${e.type === 'reminder' ? 'Recordatorio' : 'Evento'} "${e.title}" programado.`);
    } catch (e) { console.error(e); }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiDeleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      addNotification("Evento eliminado");
    } catch (e) { console.error(e); }
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      await apiUpdateEvent(updatedEvent.id, updatedEvent);
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } catch (e) { console.error(e); }
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 10));
    sendNotification("Freelance Ledger", msg);
  };

  // Notification Polling Effect
  useEffect(() => {
    requestNotificationPermission();

    const interval = setInterval(() => {
      const now = new Date();

      // Check Calendar Events (within 15 mins)
      events.forEach(event => {
        const eventTime = new Date(`${event.date}T${event.start}`);
        const diffValues = eventTime.getTime() - now.getTime();
        const diffMinutes = diffValues / (1000 * 60);

        // Notify at 15 minutes and 5 minutes before
        if ((diffMinutes > 14 && diffMinutes <= 15) || (diffMinutes > 4 && diffMinutes <= 5)) {
          sendNotification("Recordatorio de Evento", `"${event.title}" comienza en ${Math.ceil(diffMinutes)} minutos.`);
        }
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [events]);

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      let count = 0;
      lines.slice(1).forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
          addTransaction({
            date: parts[0] || new Date().toISOString().split('T')[0],
            description: parts[1] || 'Importado',
            amount: parseFloat(parts[2].replace(/[^0-9.-]+/g, "")) || 0,
            type: (parts[3]?.toLowerCase().includes('ingreso') ? 'income' : 'expense') as any,
            category: parts[4] || 'Importación',
            status: 'paid'
          });
          count++;
        }
      });
      addNotification(`Se importaron ${count} transacciones exitosamente.`);
    };
    reader.readAsText(file);
  };

  // No loading blocker - app renders instantly
  // If no user yet, show Login (will auto-switch when session is detected)
  if (!user) {
    return <Login onLogin={() => { /* Handled by Supabase Auth state change */ }} />;
  }

  return (
    <Router>
      <MotivationalModal
        user={currentUser}
        onClose={() => { }}
        onToggleSetting={(enabled) => { /* setUser(prev => ({ ...prev, showMotivationalMessage: enabled })) */ }}
      />
      <Routes>
        <Route element={
          <Layout
            user={currentUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onLogout={() => { /* Handled by AuthProvider */ }}
            notifications={notifications}
            clearNotifications={() => setNotifications([])}
          />
        }>
          <Route path="/dashboard" element={<Dashboard transactions={transactions} currency={currentUser.currency} onImport={handleImportCSV} events={events} clients={clients} quotations={quotations} onAddEvent={addEvent} user={currentUser} />} />
          <Route path="/pending" element={<PendingItems events={events} tasks={tasks} transactions={transactions} />} />
          <Route path="/dashboard-v2" element={<DashboardV2 transactions={transactions} currency={currentUser.currency} />} />
          <Route path="/transactions" element={<Transactions transactions={transactions.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))} onAdd={addTransaction} onDelete={deleteTransaction} onToggleStatus={toggleTransactionStatus} currency={currentUser.currency} />} />
          <Route path="/kanban" element={<Kanban tasks={tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))} onAdd={addTask} onUpdate={updateTask} onDelete={(id) => setTasks(t => t.filter(x => x.id !== id))} onUpdateStatus={updateTaskStatus} currency={currentUser.currency} />} />
          <Route path="/clients" element={<Clients clients={clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase()))} transactions={transactions} quotations={quotations} tasks={tasks} events={events} onAdd={addClient} onUpdate={updateClient} onDelete={deleteClient} formatCurrency={(amount: number) => `${currentUser.currency} ${new Intl.NumberFormat('es-CO').format(amount)}`} />} />
          <Route path="/quotations" element={<Quotations quotations={quotations} clients={clients} onAdd={addQuotation} onUpdateStatus={updateQuotationStatus} onDelete={deleteQuotation} currency={currentUser.currency} user={currentUser} />} />
          <Route path="/calendar" element={<Calendar events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} onUpdateEvent={updateEvent} clients={clients} />} />
          <Route path="/intelligence" element={<Intelligence transactions={transactions} currentBalance={currentBalance} />} />
          <Route path="/health" element={<Health transactions={transactions} />} />
          <Route path="/settings" element={<Settings user={currentUser} setUser={() => { /* Handled by AuthProvider */ }} />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
