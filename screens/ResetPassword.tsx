import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase injects the access token in the URL hash when coming from recovery email
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // The session is set, ready to update password
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-pattern pointer-events-none"></div>
        <main className="w-full max-w-[420px] bg-surface-light dark:bg-surface-dark rounded-3xl shadow-xl p-8 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-primary/20 text-primary mb-6 shadow-sm">
            <span className="material-icons-round text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contraseña actualizada</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Tu contraseña se ha restablecido exitosamente.</p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
          >
            Ir al inicio
            <span className="material-icons-round text-sm ml-2">arrow_forward</span>
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pattern pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-[420px] bg-surface-light dark:bg-surface-dark rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-white/50 dark:border-gray-700 relative z-10">
        <div className="h-1.5 w-full bg-primary"></div>
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-primary/20 text-primary mb-4 shadow-sm">
              <span className="material-icons-round text-3xl">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Restablecer contraseña</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresa tu nueva contraseña</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm shadow-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  <span className="material-icons-round text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="material-icons-round text-gray-400 text-xl">lock</span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm shadow-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/25 text-sm font-semibold text-white bg-primary hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="material-icons-round animate-spin">refresh</span>
              ) : (
                <>
                  Actualizar Contraseña
                  <span className="material-icons-round text-sm ml-2">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
