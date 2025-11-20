import React, { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  slot, 
  format = 'auto', 
  style = {}, 
  className = '',
  size = 'medium'
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      if (window.adsbygoogle) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, []);

  // Estilos base según el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { minHeight: '90px', maxHeight: '120px' };
      case 'medium':
        return { minHeight: '120px', maxHeight: '250px' };
      case 'large':
        return { minHeight: '250px', maxHeight: '300px' };
      default:
        return { minHeight: '120px', maxHeight: '250px' };
    }
  };

  return (
    <div 
      className={`ad-container my-4 p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-violet-500/20 ${className}`}
      style={style}
    >
      <div className="ad-label mb-2 text-center">
        <span className="text-xs text-violet-400/60 uppercase tracking-wider font-medium">
          Publicidad
        </span>
      </div>
      <div 
        className="ad-content flex items-center justify-center"
        style={getSizeStyles()}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: 'inherit',
          }}
          data-ad-client="ca-pub-7767554718249498"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdBanner;
