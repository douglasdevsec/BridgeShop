/**
 * ServicesPage.tsx
 *
 * Página de Servicios de BridgeShop (FrontStore).
 * Ruta: /servicios
 *
 * Muestra los servicios ofrecidos por la tienda:
 *  - Sección hero con título y descripción
 *  - Tarjetas de servicios con ícono, nombre y descripción corta
 *  - CTA de contacto al final
 *
 * Fase 5.6.1 — Plan BridgeShop
 */

import React from 'react';

// ── Datos estáticos de servicios (editable desde admin en futura versión) ──────
const SERVICES = [
  {
    id: 1,
    icon: '🚚',
    title: 'Envío Rápido',
    description:
      'Entregamos tu pedido en el menor tiempo posible. Cobertura nacional con seguimiento en tiempo real.'
  },
  {
    id: 2,
    icon: '🔒',
    title: 'Compra Segura',
    description:
      'Tus pagos están protegidos por los más altos estándares de seguridad. Múltiples métodos de pago disponibles.'
  },
  {
    id: 3,
    icon: '↩️',
    title: 'Devoluciones Fáciles',
    description:
      'Si no estás satisfecho, aceptamos devoluciones en 30 días sin complicaciones ni costos adicionales.'
  },
  {
    id: 4,
    icon: '🎧',
    title: 'Soporte 24/7',
    description:
      'Nuestro equipo de atención al cliente está disponible todos los días para resolver cualquier duda.'
  },
  {
    id: 5,
    icon: '🏷️',
    title: 'Precios Competitivos',
    description:
      'Ofrecemos los mejores precios del mercado con promociones y descuentos exclusivos para nuestros clientes.'
  },
  {
    id: 6,
    icon: '🌐',
    title: 'Tienda en Línea 24h',
    description:
      'Compra cuando quieras, donde quieras. Nuestra tienda está disponible las 24 horas del día, 7 días a la semana.'
  }
];

// ── Componente ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  return (
    <div className="services-page">
      {/* ── Hero ── */}
      <section className="services__hero py-16 bg-gradient-to-br from-primary/10 to-primary/5 text-center">
        <div className="page-width">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">
            Lo que ofrecemos
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-foreground">
            Nuestros Servicios
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            En BridgeShop nos comprometemos a brindarte la mejor experiencia de compra,
            desde el primer clic hasta la entrega en tu puerta.
          </p>
        </div>
      </section>

      {/* ── Grid de servicios ── */}
      <section className="services__grid py-16">
        <div className="page-width">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <article
                key={service.id}
                className="services__card group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200"
              >
                {/* Ícono */}
                <div className="services__card-icon text-4xl mb-4 select-none" aria-hidden="true">
                  {service.icon}
                </div>
                {/* Título */}
                <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h2>
                {/* Descripción */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA de contacto ── */}
      <section className="services__cta py-14 bg-primary/5 text-center">
        <div className="page-width">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ¿Necesitas más información?
          </h2>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está listo para atenderte. Contáctanos y con gusto te ayudaremos.
          </p>
          <a
            href="mailto:soporte@bridgeshop.com"
            className="btn btn-primary btn-lg"
            aria-label="Contactar al soporte de BridgeShop"
          >
            Contactar Soporte
          </a>
        </div>
      </section>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
