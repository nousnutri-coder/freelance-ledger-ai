import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile, SubscriptionPlan } from '../types';
import { usePrivacy } from '../context/PrivacyContext';
import { useTranslation } from 'react-i18next';
import UserAvatar from './UserAvatar';
import SubscriptionBadge from './SubscriptionBadge';
import PromoTicker from './PromoTicker';

const DarkModeToggle = () => {
  const toggleDarkMode = () => document.documentElement.classList.toggle('dark');
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all"
      title={useTranslation().t('layout.dark_mode_title')}
    >
      <span className="material-icons-round block dark:hidden">dark_mode</span>
      <span className="material-icons-round hidden dark:block">light_mode</span>
    </button>
  );
};

const IncognitoToggle = () => {
  const { isIncognito, toggleIncognito } = usePrivacy();
  return (
    <button
      onClick={toggleIncognito}
      className={`p-2 rounded-full transition-all ${isIncognito ? 'text-primary bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary'}`}
      title={isIncognito ? useTranslation().t('layout.incognito_off') : useTranslation().t('layout.incognito_on')}
    >
      <span className="material-icons-round">{isIncognito ? 'visibility_off' : 'visibility'}</span>
    </button>
  );
};

interface LayoutProps {
  user: UserProfile;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onLogout: () => void;
  notifications: string[];
  clearNotifications: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, searchQuery, setSearchQuery, onLogout, notifications, clearNotifications }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: t('menu.dashboard'), icon: 'dashboard' },
    { path: '/pending', label: t('menu.pending'), icon: 'notification_important', badge: true },
    { path: '/transactions', label: t('menu.transactions'), icon: 'receipt_long' },
    { path: '/kanban', label: t('menu.kanban'), icon: 'view_kanban' },
    { path: '/calendar', label: t('menu.calendar'), icon: 'calendar_today' },
    { path: '/clients', label: t('menu.clients'), icon: 'group' },
    { path: '/quotations', label: t('menu.quotations'), icon: 'description' },
    { path: '/intelligence', label: t('menu.intelligence'), icon: 'psychology' },
    { path: '/health', label: t('menu.health'), icon: 'favorite' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100">
      {/* Promo Ticker - Top Banner */}
      <PromoTicker userPlan={(user as any).currentPlan || 'free'} userName={user.name} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 lg:w-72 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-all duration-300 h-full hidden md:flex z-30 no-print">
          <div>
            <div className="h-24 flex items-center px-8">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <span className="material-icons-round text-2xl">account_balance_wallet</span>
                </div>
                <span className="text-xl font-black tracking-tight hidden lg:block text-gray-900 dark:text-white uppercase italic">Freel<span className="text-primary">Aissist</span>Pro</span>
              </Link>
            </div>
            <div className="px-6 mb-2">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hidden lg:block mb-6 pl-3">{t('layout.platform_section')}</span>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = activePath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${isActive ? 'text-primary bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full"></div>}
                      <span className={`material-icons-round text-2xl`}>{item.icon}</span>
                      <span className="hidden lg:block text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="px-6 mt-8">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hidden lg:block mb-6 pl-3">{t('layout.settings_section')}</span>
              <nav className="space-y-2">
                <Link
                  to="/settings"
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group font-bold ${activePath === '/settings' ? 'text-primary bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                >
                  <span className="material-icons-outlined text-2xl">settings</span>
                  <span className="hidden lg:block text-sm">{t('menu.settings')}</span>
                </Link>
                <button onClick={onLogout} className="w-full text-left flex items-center gap-4 px-4 py-3.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold group">
                  <span className="material-icons-outlined text-2xl">logout</span>
                  <span className="hidden lg:block text-sm">{t('menu.logout')}</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <header className="h-24 px-6 md:px-10 flex items-center justify-between bg-background-light dark:bg-background-dark md:bg-transparent md:dark:bg-transparent z-20 shrink-0 no-print">
            <div className="hidden md:flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">search</span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-white dark:bg-surface-dark shadow-sm text-sm focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-200"
                  placeholder={t('layout.search_placeholder')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
              <IncognitoToggle />
              <DarkModeToggle />
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                  className="relative p-2 rounded-full text-gray-400 hover:bg-white dark:hover:bg-surface-dark hover:text-primary transition-all"
                >
                  <span className="material-icons-outlined text-2xl">notifications</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h4 className="font-bold uppercase tracking-widest text-xs">{t('layout.alerts')}</h4>
                      <button onClick={clearNotifications} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">{t('layout.clear_all')}</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <div key={i} className="p-4 border-b border-gray-50 dark:border-gray-800 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-3 items-start">
                          <span className="material-icons-round text-emerald-500 text-sm">circle</span>
                          {n}
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t('layout.no_notifications')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
              <div className="relative flex items-center gap-3 pl-2">
                <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="flex items-center gap-3 group">
                  <UserAvatar name={user.name} imageUrl={user.profileImage} size="lg" className="group-hover:scale-105 transition-transform" />
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{user.name}</p>
                      <SubscriptionBadge plan={(user as any).currentPlan || 'free'} showUpgradeHint={true} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                  </div>
                  <span className={`material-icons-round text-gray-300 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-16 w-52 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150">
                    <Link to="/settings" onClick={() => setShowProfile(false)} className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold flex items-center gap-3 transition-colors">
                      <span className="material-icons-round text-lg text-slate-300">manage_accounts</span> {t('layout.my_account')}
                    </Link>
                    <button onClick={onLogout} className="w-full text-left px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold text-red-500 flex items-center gap-3 transition-colors">
                      <span className="material-icons-round text-lg">logout</span> {t('menu.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <Outlet />

            <footer className="w-full py-6 mt-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark bg-opacity-50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="flex justify-center items-center gap-6 mb-4 text-xs font-semibold tracking-wider uppercase text-gray-500">
                  <a onClick={() => navigate('/legal')} className="cursor-pointer hover:text-primary transition-colors">{t('layout.privacy')}</a>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <a onClick={() => navigate('/legal')} className="cursor-pointer hover:text-primary transition-colors">{t('layout.terms')}</a>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <a onClick={() => navigate('/legal')} className="cursor-pointer hover:text-primary transition-colors">{t('layout.cookies')}</a>
                </div>
                <p className="text-[10px] text-gray-400">
                  © {new Date().getFullYear()} FreelAissistPro. {t('layout.footer_rights')}
                </p>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
