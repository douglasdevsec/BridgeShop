/**
 * Componente Logo para la tienda pública.
 * Muestra el logotipo cargado desde la carpeta /public.
 */
import React from 'react';

interface LogoProps {
  themeConfig: {
    logo: {
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
}
export default function Logo({
  themeConfig: {
    logo: { src, alt = 'Evershop', width = 128, height = 128 }
  }
}: LogoProps) {
  return (
    <div className="logo md:ml-0 flex justify-center items-center">
      <a href="/" className="logo-icon">
        <img
          src={src || '/logo.png'}
          alt={alt || 'BridgeShop'}
          width={width || 128}
          height={height || 128}
          className="object-contain"
          style={{ maxHeight: '60px' }}
        />
      </a>
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleCenter',
  sortOrder: 10
};

export const query = `
  query query {
    themeConfig {
      logo {
        src
        alt
        width
        height
      }
    }
  }
`;
