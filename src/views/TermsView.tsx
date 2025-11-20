import React from 'react';

interface TermsViewProps {
    onReset: () => void;
}

const TermsView: React.FC<TermsViewProps> = ({ onReset }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 neon-text-fuchsia text-center">
                Términos y Condiciones de OnlyFachas
            </h2>
            <div className="space-y-6 text-violet-300/90 leading-relaxed">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">1. Aceptación</h3>
                    <p>
                        Al acceder o utilizar OnlyFachas aceptás estos términos en su totalidad.
                        Si no estás de acuerdo, no uses la aplicación.
                    </p>
                </div>

                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">2. Aclaración Importante</h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        El término <span className="text-cyan-400 font-bold">"facha"</span> se usa únicamente en el sentido argentino de fachero/estilo, sin relación con política o ideologías.
                        Hace referencia a la apariencia o "pinta" de una persona, su look o estilo personal.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">3. Uso Permitido</h3>
                    <p className="mb-4">
                        OnlyFachas es una aplicación de entretenimiento.
                        Queda prohibido usarla para acosar, discriminar, difamar o infringir derechos de terceros.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                        <li>Uso exclusivo para diversión.</li>
                        <li>No subir contenido ofensivo, ilegal, violento o sexual.</li>
                        <li>Respetar derechos de imagen y de autor.</li>
                        <li>Ser mayor de 18 años o contar con supervisión adulta.</li>
                    </ul>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">4. Contenido del Usuario</h3>
                    <p className="mb-4">
                        Vos sos el único responsable de las fotos que subas.
                        No cargues imágenes de otras personas sin su consentimiento.
                    </p>
                    <p className="text-violet-300/80">
                        Las imágenes no se almacenan: se procesan en el momento mediante servicios de terceros (por ejemplo, Google Gemini) que pueden aplicar filtros automáticos para moderación.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">5. Limitación de Responsabilidad</h3>
                    <p className="mb-4">
                        OnlyFachas se ofrece "tal cual", sin garantías de ningún tipo.
                        Los puntajes generados por la IA:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                        <li>Son solo para entretenimiento.</li>
                        <li>No constituyen un juicio real sobre apariencia o valor personal.</li>
                        <li>Pueden variar o contener errores.</li>
                        <li>No asumimos responsabilidad por decisiones tomadas en base a los resultados.</li>
                    </ul>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">6. Servicios de Terceros</h3>
                    <p className="mb-4">
                        El análisis de imágenes se realiza con APIs de Google (Gemini, entre otros) y las métricas publicitarias se gestionan a través de Google AdSense.
                        Al usar la aplicación aceptás las políticas de privacidad y términos de dichos servicios.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">7. Cambios</h3>
                    <p>
                        Podemos actualizar estos términos y/o la política de privacidad en cualquier momento.
                        El uso continuo de la aplicación implica la aceptación de las modificaciones.
                    </p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-4">8. Contacto</h3>
                    <p>
                        Para consultas o solicitudes vinculadas a privacidad, escribí a: <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>
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

export default TermsView;
