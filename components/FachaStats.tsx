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

const getTopPercentile = (rating: number): number => {
    if (rating >= 10) return 0.5;
    if (rating >= 9.5) return 1;
    if (rating >= 9) return 5;
    if (rating >= 8) return 15;
    if (rating >= 7) return 30;
    if (rating >= 5) return 50;
    return 0; // Not in top 50
};

const FachaStats: React.FC<{ rating: number }> = ({ rating }) => {
    const peopleInRoom = Math.max(0, 10 - (Math.floor(rating) + 1));
    const animatedPeople = useCountUp(peopleInRoom, 2000, 0);

    const topPercentile = getTopPercentile(rating);
    const animatedPercentile = useCountUp(topPercentile, 2000, topPercentile < 1 ? 1 : 0);

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