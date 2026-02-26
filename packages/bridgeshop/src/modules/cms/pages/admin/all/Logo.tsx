/**
 * Componente Logo para el panel de administración.
 * Muestra el logotipo de BridgeShop en la barra superior.
 */
import React from 'react';

interface LogoProps {
  dashboardUrl: string;
}
export default function Logo({ dashboardUrl }: LogoProps) {
  return (
    <div className="logo w-9 h-auto flex items-center">
      <a href={dashboardUrl} className="flex items-end">
        <img
          src="/logo.png"
          alt="BridgeShop Admin"
          className="w-auto"
          style={{ maxHeight: '40px', objectFit: 'contain' }}
        />
      </a>
    </div>
  );
}

export const layout = {
  areaId: 'header',
  sortOrder: 10
};

export const query = `
  query query {
    dashboardUrl: url(routeId:"dashboard")
  }
`;
