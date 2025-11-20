import React from 'react';
import { AlertTriangleIcon } from '../components/Icons';

interface ErrorViewProps {
    error: string | null;
    reset: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, reset }) => {
    return (
        <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg border border-red-500">
            <AlertTriangleIcon className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Ups! Algo salió mal</h2>
            <p className="mb-6">{error || 'Ocurrió un error inesperado.'}</p>
            <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Intentar de nuevo
            </button>
        </div>
    );
};

export default ErrorView;
