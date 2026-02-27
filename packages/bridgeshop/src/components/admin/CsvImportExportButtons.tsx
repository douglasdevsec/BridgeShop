/**
 * CsvImportExportButtons.tsx
 *
 * Componente de UI reutilizable para importar y exportar datos en formato CSV.
 * Se puede usar en cualquier grilla administrativa (Productos, Clientes, etc.).
 *
 * Props:
 *   - exportUrl: URL del endpoint de exportación CSV (GET).
 *   - importUrl: URL del endpoint de importación CSV (POST multipart/form-data).
 *   - entityName: Nombre de la entidad para etiquetas accesibles ("Productos", "Clientes").
 *   - onImportSuccess: Callback opcional al completar una importación exitosa.
 *
 * Fase 5.5 — Plan BridgeShop
 */

import { Button } from '@components/common/ui/Button.js';
import React, { useRef, useState } from 'react';

interface CsvImportExportButtonsProps {
  /** URL GET para descargar el CSV */
  exportUrl: string;
  /** URL POST para subir el CSV importado */
  importUrl: string;
  /** Nombre de la entidad para labels ("Productos", "Clientes") */
  entityName?: string;
  /** Callback después de importar exitosamente */
  onImportSuccess?: () => void;
}

/**
 * Renderiza un botón "Exportar CSV" (descarga) y un "Importar CSV"
 * (abre selector de archivo + sube al servidor vía fetch).
 */
export default function CsvImportExportButtons({
  exportUrl,
  importUrl,
  entityName = 'datos',
  onImportSuccess
}: CsvImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // ── Exportar: navega directamente a la URL de descarga ─────────────────────
  const handleExport = () => {
    window.location.href = exportUrl;
  };

  // ── Importar: enviar archivo al endpoint con multipart/form-data ────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación del tipo antes de enviar (seguridad en cliente)
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setImportError('Solo se permiten archivos CSV.');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(importUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include' // enviar cookies de sesión
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Error HTTP ${res.status}`);
      }

      setImportSuccess(true);
      onImportSuccess?.();
      // Refrescar la página para mostrar los cambios importados
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Error al importar el archivo.'
      );
    } finally {
      setIsImporting(false);
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* ── Botón Exportar ── */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        aria-label={`Exportar ${entityName} a CSV`}
        title={`Descargar ${entityName} en formato CSV`}
      >
        ↓ Exportar CSV
      </Button>

      {/* ── Botón Importar (delegado al input oculto) ── */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        aria-label={`Importar ${entityName} desde CSV`}
        title={`Subir archivo CSV de ${entityName}`}
      >
        {isImporting ? 'Importando…' : '↑ Importar CSV'}
      </Button>

      {/* Input oculto para selección de archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      {/* Mensajes de estado inline */}
      {importError && (
        <span className="text-destructive text-sm" role="alert">
          {importError}
        </span>
      )}
      {importSuccess && (
        <span className="text-green-600 text-sm" role="status">
          ✓ Importación exitosa
        </span>
      )}
    </div>
  );
}
