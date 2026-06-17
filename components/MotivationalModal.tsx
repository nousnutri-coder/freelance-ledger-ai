
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface MotivationalModalProps {
    user: UserProfile;
    onClose: () => void;
    onToggleSetting: (enabled: boolean) => void;
}

const QUOTES = [
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "No cuentes los días, haz que los días cuenten.",
    "La disciplina es el puente entre metas y logros.",
    "Tu único límite es tu mente.",
    "Hazlo con pasión o no lo hagas.",
    "El futuro pertenece a quienes creen en la belleza de sus sueños.",
    "No te detengas cuando estés cansado, detente cuando hayas terminado.",
    "La mejor forma de predecir el futuro es creándolo.",
    "Sueña en grande y atrévete a fallar.",
    "La calidad no es un acto, es un hábito."
];

const MotivationalModal: React.FC<MotivationalModalProps> = ({ user, onClose, onToggleSetting }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [quote, setQuote] = useState("");

    useEffect(() => {
        // Check if user has disabled it
        if (user.showMotivationalMessage === false) {
            return;
        }

        // Pick random quote
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        setIsVisible(true);
    }, [user.showMotivationalMessage]);

    const handleClose = () => {
        setIsVisible(false);
        onClose();
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        // We want "Don't show again" -> showMotivationalMessage = false
        // So if "Don't show" is checked, enabled = false.
        onToggleSetting(!isChecked);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative border border-white/20 transform scale-100 animate-in zoom-in-95 duration-300">

                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <span className="material-icons-round text-2xl">close</span>
                </button>

                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 dark:text-emerald-400">
                        <span className="material-icons-round text-4xl">local_fire_department</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                        "{quote}"
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-xs">
                        Mensaje del Día
                    </p>

                    <div className="mt-12 flex items-center justify-center gap-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    onChange={handleToggle}
                                />
                                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md peer-checked:bg-slate-500 peer-checked:border-slate-500 transition-all"></div>
                                <span className="material-icons-round text-white text-[14px] absolute top-[2px] left-[2px] opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                No volver a mostrar este mensaje
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotivationalModal;
