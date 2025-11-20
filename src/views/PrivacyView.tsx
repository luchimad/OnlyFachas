import React from 'react';

interface PrivacyViewProps {
    onReset: () => void;
}

const PrivacyView: React.FC<PrivacyViewProps> = ({ onReset }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 neon-text-fuchsia text-center">
                Política de Privacidad
            </h2>
            <div className="space-y-6 text-violet-300/90 leading-relaxed">
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">1. Aclaración Importante</h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        La palabra <span className="text-cyan-400 font-bold">"facha"</span> se usa únicamente en el sentido argentino de fachero/estilo, sin relación con política o ideologías.
                        Se refiere a apariencia o "pinta" de una persona, nunca a creencias ni posicionamientos.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">2. Resumen</h3>
                    <p>
                        OnlyFachas respeta tu privacidad.
                        Procesamos las imágenes solo para generar un puntaje de facha en tiempo real.
                        No almacenamos, guardamos ni compartimos las fotos ni los resultados.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">3. Procesamiento de Imágenes</h3>
                    <p className="mb-4">
                        Las fotos se envían de manera temporal a los servicios de inteligencia artificial de Google Gemini.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                        <li>Se utilizan únicamente para calcular el puntaje.</li>
                        <li>No se guardan en nuestros servidores.</li>
                        <li>Se eliminan automáticamente después del análisis.</li>
                        <li>No se comparten con terceros.</li>
                    </ul>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">4. Datos Técnicos</h3>
                    <p className="mb-4">
                        Podemos recopilar datos de uso anónimos para estadísticas, publicidad y mejora de la experiencia, como:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                        <li>Cookies y datos de navegación.</li>
                        <li>Tiempo de permanencia en la aplicación.</li>
                        <li>Páginas visitadas.</li>
                        <li>Información básica del dispositivo (tipo, navegador).</li>
                    </ul>
                    <p className="text-violet-300/80 mt-4">
                        Estos datos no identifican a una persona de forma directa.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">5. Servicios de Terceros</h3>
                    <p className="mb-4">
                        Al usar OnlyFachas aceptás que algunos datos de navegación sean tratados por terceros bajo sus propias políticas:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                        <li><strong>Google Gemini:</strong> procesamiento de imágenes.</li>
                        <li><strong>Google AdSense:</strong> anuncios publicitarios.</li>
                        <li><strong>Google Analytics:</strong> métricas y estadísticas de uso.</li>
                    </ul>
                    <p className="text-violet-300/80 mt-4">
                        Recomendamos revisar las políticas de privacidad de Google para más información.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">6. Tus Derechos</h3>
                    <p className="mb-4">
                        No guardamos ninguna foto ni información personal.
                    </p>
                    <p className="mb-4">
                        Podés borrar las cookies de tu navegador para eliminar los datos técnicos almacenados localmente.
                    </p>
                    <p className="text-violet-300/80">
                        Solo se guardan, en tu propio dispositivo, las preferencias locales (por ejemplo, audio o configuraciones de juego).
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">7. Contacto</h3>
                    <p>
                        Para consultas o solicitudes vinculadas a privacidad escribinos a: <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/80 to-gray-800/80 hover:from-gray-500/90 hover:to-gray-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 border-2 border-gray-400 border-opacity-60"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default PrivacyView;
