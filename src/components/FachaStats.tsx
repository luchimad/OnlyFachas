import React, { useState, useEffect } from 'react';
import { GlobeIcon } from './Icons';

const useCountUp = (end: number, duration = 2000, decimals = 0) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            const easedProgress = 1 - Math.pow(1 - percentage, 3);
            const value = easedProgress * end;
            
            setCount(value);

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [end, duration]);

    return count.toFixed(decimals);
};

// Función para aproximar la CDF de la distribución normal estándar
const normalCDF = (z: number): number => {
    // Aproximación de Abramowitz y Stegun para la CDF normal estándar
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z >= 0 ? 1 : -1;
    z = Math.abs(z) / Math.sqrt(2);

    const t = 1 / (1 + p * z);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

    return 0.5 * (1 + sign * y);
};

const getTopPercentile = (rating: number): number => {
    // Parámetros de la distribución normal
    const mean = 5;
    const stdDev = 3;
    
    // Calcular z-score
    const zScore = (rating - mean) / stdDev;
    
    // Obtener percentil usando CDF
    const percentile = normalCDF(zScore) * 100;
    
    // Convertir a "top mundial" (100% - percentil)
    const topPercentile = 100 - percentile;
    
    return Math.max(0, Math.min(100, topPercentile));
};

const FachaStats: React.FC<{ rating: number }> = ({ rating }) => {
    const topPercentile = getTopPercentile(rating);
    const animatedPercentile = useCountUp(topPercentile, 2000, topPercentile < 1 ? 1 : 0);
    
    // Calcular personas más facheras en juntada de 20
    // Si estás en el top X%, entonces X% de personas son más facheras (las que están por encima de vos)
    const peopleMoreFacheros = Math.round(topPercentile / 100 * 20);
    const animatedPeople = useCountUp(peopleMoreFacheros, 2000, 0);


    return (
        <div className="mt-6 w-full bg-slate-800/50 p-4 rounded-lg border border-violet-500/30">
            <h3 className="font-bold text-lg text-violet-300 mb-4 flex items-center gap-2">
                <GlobeIcon /> Tu Facha en el Mundo
            </h3>
            <div className="space-y-4 text-left">
                {topPercentile > 0 ? (
                     <div className="p-3 bg-slate-900/50 rounded-md">
                        <p className="text-sm text-violet-400/80">
                            Estás en el
                        </p>
                        <p className="font-orbitron text-2xl font-bold text-cyan-400">
                           TOP {animatedPercentile}%
                        </p>
                         <p className="text-xs text-violet-400/60">de facha a nivel mundial. ¡Casi nada!</p>
                    </div>
                ) : (
                    <div className="p-3 bg-slate-900/50 rounded-md">
                        <p className="text-sm text-violet-400/80">
                           Seguí metiéndole onda para entrar al TOP 50% mundial.
                        </p>
                    </div>
                )}
                 <div className="p-3 bg-slate-900/50 rounded-md">
                    <p className="text-sm text-violet-400/80">
                        En una juntada de 20 personas, solo <span className="font-bold text-2xl text-cyan-400">{animatedPeople}</span> tendrían más facha que vos.
                    </p>
                     <p className="text-xs text-violet-400/60">Para que te des una idea.</p>
                </div>
            </div>
        </div>
    );
};

export default FachaStats;