import { useIsMobile } from '@components/common/ui/hooks/useIsMobile.js';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@bridgeshop/bridgeshop/components/common/ui/NavigationMenu';
import { cn } from '@bridgeshop/bridgeshop/lib/util/cn';
import React from 'react';

interface BasicMenuProps {
  basicMenuWidget: {
    menus: {
      id: string;
      name: string;
      url: string;
      type: string;
      uuid: string;
      children: {
        name: string;
        url: string;
        type: string;
        uuid: string;
      }[];
    }[];
    isMain: boolean;
    className: string;
  };
}

export default function BasicMenu({
  basicMenuWidget: { menus, isMain, className }
}: BasicMenuProps) {
  const [isOpen, setIsOpen] = React.useState(!isMain);
  const isMobile = useIsMobile();
  const [currentPath, setCurrentPath] = React.useState('');
  // Referencia al contenedor principal para detectar clics fuera
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  // Cerrar el menú al hacer clic fuera del componente
  React.useEffect(() => {
    if (!isMain || !isMobile) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMain, isMobile]);

  // Cerrar el menú al cambiar de tamaño a escritorio
  React.useEffect(() => {
    if (!isMobile && isMain) setIsOpen(false);
  }, [isMobile, isMain]);

  const isActive = (url: string) => {
    if (url === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(url);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={className} ref={menuRef}>
      <div className="flex justify-start gap-4 items-center">
        <nav className="p-2 relative md:flex md:justify-center w-full">
          <div className="flex justify-between items-center w-full">
            {isMain && isMobile && (
              <button
                onClick={toggleMenu}
                aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isOpen}
                className="text-foreground focus:outline-none p-1 rounded-md hover:bg-muted transition-colors"
              >
                {/* Botón hamburguesa / X animado */}
                <svg
                  className="w-6 h-6 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {isOpen ? (
                    // Ícono X para cerrar
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    // Ícono hamburguesa para abrir
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  )}
                </svg>
              </button>
            )}
            <div
              className={cn(
                isMain
                  ? 'md:flex absolute md:relative left-0 top-full md:top-auto mt-2 md:mt-0 w-screen md:w-auto p-4 md:p-0 bg-background md:bg-transparent z-40 shadow-lg md:shadow-none border-t md:border-0 border-border'
                  : 'flex relative left-0 w-screen md:w-auto p-2 md:p-0 bg-background md:bg-transparent',
                isOpen ? 'block' : 'hidden',
                'md:flex'
              )}
            >
              <NavigationMenu className="w-full max-w-full">
                <NavigationMenuList className="flex-col md:flex-row items-start md:items-center w-full md:w-auto">
                  {menus.map((item) => (
                    <NavigationMenuItem
                      key={item.uuid}
                      className="w-full md:w-auto"
                    >
                      {item.children.length > 0 && !isMobile ? (
                        <>
                          <NavigationMenuTrigger className="w-full md:w-auto justify-start md:justify-center bg-transparent hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-open:hover:bg-transparent data-open:focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent hover:font-semibold hover:text-primary">
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="flex flex-col min-w-50 p-2">
                              {item.children.map((subItem) => (
                                <li key={subItem.uuid}>
                                  <NavigationMenuLink
                                    href={subItem.url}
                                    className="w-full"
                                  >
                                    {subItem.name}
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink
                          href={item.url}
                          onClick={() => isMobile && setIsOpen(false)}
                          className="w-full md:w-auto px-4 py-3 md:py-2 hover:text-primary data-[active=true]:bg-transparent data-[active=true]:hover:bg-transparent transition-colors data-[active=true]:text-primary data-[active=true]:font-semibold hover:bg-transparent focus:bg-transparent hover:underline text-xl md:text-base"
                          data-active={isActive(item.url)}
                        >
                          {item.name}
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export const query = `
  query Query($settings: JSON) {
    basicMenuWidget(settings: $settings) {
      menus {
        id
        name
        url
        type
        uuid
        children {
          name
          url
          type
          uuid
        }
      }
      isMain
      className
    }
  }
`;

export const variables = `{
  settings: getWidgetSetting()
}`;
