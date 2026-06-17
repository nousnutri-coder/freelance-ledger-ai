import React, { useState } from 'react';
import { CompanyDNA, DocumentUploadHistory } from '../types';

interface Props {
    currentDNA?: CompanyDNA;
    uploadHistory?: DocumentUploadHistory[];
    onUpload: (file: File) => Promise<void>;
    onRemove: () => void;
    isProcessing: boolean;
}

const CompanyProfileUpload: React.FC<Props> = ({ currentDNA, uploadHistory, onUpload, onRemove, isProcessing }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string>('');

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        setError('');

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            await handleFile(files[0]);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        if (e.target.files && e.target.files[0]) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('El archivo debe ser un PDF');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('El archivo no debe superar 10MB');
            return;
        }

        try {
            await onUpload(file);
        } catch (err: any) {
            setError(err.message || 'Error al procesar el archivo');
        }
    };

    return (
        <div className="space-y-8">
            {/* Upload Area */}
            <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Subir ADN de Empresa</h3>

                <div
                    className={`relative border-2 border-dashed rounded-[32px] p-12 text-center transition-all ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                    />

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="material-icons-round text-4xl text-primary">
                                {isProcessing ? 'hourglass_empty' : 'upload_file'}
                            </span>
                        </div>

                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                {isProcessing ? 'Procesando documento...' : 'Arrastra tu PDF aquí'}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                o haz clic para seleccionar (máx. 10MB)
                            </p>
                        </div>

                        {isProcessing && (
                            <div className="w-full max-w-xs">
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-pulse" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                            <span className="material-icons-round text-lg">error</span>
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Current DNA Status */}
            {currentDNA && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-[32px] p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                                <span className="material-icons-round text-white text-2xl">verified</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-200 uppercase tracking-widest">ADN Activo</h4>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{currentDNA.fileName}</p>
                            </div>
                        </div>

                        <button
                            onClick={onRemove}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-emerald-800 dark:text-emerald-300 font-black uppercase tracking-wider">Subido:</span>
                            <p className="text-emerald-600 dark:text-emerald-400 mt-1">
                                {new Date(currentDNA.uploadDate).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="text-emerald-800 dark:text-emerald-300 font-black uppercase tracking-wider">Estado:</span>
                            <p className="text-emerald-600 dark:text-emerald-400 mt-1">
                                ✅ Activo y en uso
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload History */}
            {uploadHistory && uploadHistory.length > 0 && (
                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Historial de Cargas</h3>
                    <div className="space-y-2">
                        {uploadHistory.slice(0, 5).map(item => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`material-icons-round text-lg ${item.status === 'completed' ? 'text-green-500' :
                                            item.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                                        }`}>
                                        {item.status === 'completed' ? 'check_circle' :
                                            item.status === 'failed' ? 'error' : 'pending'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.fileName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(item.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        item.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {item.status === 'completed' ? 'Completado' :
                                        item.status === 'failed' ? 'Error' : 'Procesando'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProfileUpload;
