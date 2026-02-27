/**
 * LogoUploader.tsx
 *
 * Componente de carga de logo para el panel de Settings de BridgeShop.
 *
 * Funcionalidades:
 *  - Selección de archivo de imagen desde el sistema de archivos local
 *  - Previsualización inmediata de la imagen seleccionada
 *  - Conversión a Base64 para almacenamiento en la base de datos
 *  - Candado de proporción (🔒/🔓) que bloquea el ratio ancho/alto
 *  - Campos de ancho y alto sincronizados al activar el candado
 *  - Soporte para formatos: PNG, JPG, JPEG, GIF, SVG, WEBP
 *
 * Fase 5.4.a — Plan BridgeShop
 */

import React, { useCallback, useRef, useState } from 'react';

interface LogoUploaderProps {
  /** Valor actual del logo (URL o Base64) */
  currentLogo?: string;
  /** Ancho actual del logo en px */
  currentWidth?: number;
  /** Alto actual del logo en px */
  currentHeight?: number;
  /** Nombre del campo hidden para el logo Base64/URL */
  logoFieldName?: string;
  /** Nombre del campo de ancho */
  widthFieldName?: string;
  /** Nombre del campo de alto */
  heightFieldName?: string;
}

// ── Tipos SVG aceptados como favicon/logo ─────────────────────────────────────
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp';

export default function LogoUploader({
  currentLogo,
  currentWidth = 160,
  currentHeight = 50,
  logoFieldName = 'storeLogo',
  widthFieldName = 'storeLogoWidth',
  heightFieldName = 'storeLogoHeight'
}: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogo || '');
  const [base64Value, setBase64Value] = useState<string>(currentLogo || '');
  const [width, setWidth] = useState<number>(currentWidth);
  const [height, setHeight] = useState<number>(currentHeight);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ratio guardado cuando se activa el candado
  const ratioRef = useRef<number>(currentWidth / (currentHeight || 1));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Cargar archivo ──────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validar tamaño máx 2 MB
      if (file.size > 2 * 1024 * 1024) {
        setError('El archivo excede el límite de 2 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPreviewUrl(result);
        setBase64Value(result);

        // Obtener dimensiones naturales de la imagen para actualizar ratio
        const img = new Image();
        img.onload = () => {
          const naturalRatio = img.naturalWidth / img.naturalHeight;
          ratioRef.current = naturalRatio;
          setWidth(img.naturalWidth > 400 ? 400 : img.naturalWidth);
          setHeight(
            img.naturalWidth > 400
              ? Math.round(400 / naturalRatio)
              : img.naturalHeight
          );
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // ── Cambio de ancho ─────────────────────────────────────────────────────────
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10) || 1;
    setWidth(newWidth);
    if (isLocked) {
      setHeight(Math.round(newWidth / ratioRef.current));
    }
  };

  // ── Cambio de alto ──────────────────────────────────────────────────────────
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10) || 1;
    setHeight(newHeight);
    if (isLocked) {
      setWidth(Math.round(newHeight * ratioRef.current));
    }
  };

  // ── Activar/desactivar candado ──────────────────────────────────────────────
  const toggleLock = () => {
    if (!isLocked) {
      // Al bloquear, guarda el ratio actual
      ratioRef.current = width / (height || 1);
    }
    setIsLocked((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      {/* ── Input oculto con el valor Base64/URL para submit del form ── */}
      <input type="hidden" name={logoFieldName} value={base64Value} />

      {/* ── Zona de carga ── */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Seleccionar archivo de logo"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vista previa del logo"
            style={{ maxWidth: 320, maxHeight: 160, objectFit: 'contain' }}
            className="rounded-lg shadow-sm"
          />
        ) : (
          <div className="text-muted-foreground text-center text-sm">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="font-medium">Haz clic para seleccionar una imagen</p>
            <p className="text-xs mt-1">PNG, JPG, SVG, WEBP — máx. 2 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          aria-hidden="true"
          onChange={handleFileChange}
        />
      </div>

      {previewUrl && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-destructive underline"
          onClick={() => {
            setPreviewUrl('');
            setBase64Value('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        >
          Quitar logo
        </button>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {/* ── Dimensiones con candado de proporción ── */}
      <div className="flex items-end gap-2">
        {/* Ancho */}
        <div className="flex-1 space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={widthFieldName}
          >
            Ancho (px)
          </label>
          <input
            id={widthFieldName}
            name={widthFieldName}
            type="number"
            min={16}
            max={800}
            value={width}
            onChange={handleWidthChange}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Botón candado */}
        <button
          type="button"
          onClick={toggleLock}
          aria-label={isLocked ? 'Desbloquear proporción' : 'Bloquear proporción'}
          title={isLocked ? 'Proporción bloqueada — clic para desbloquear' : 'Proporción libre — clic para bloquear'}
          className={`flex items-center justify-center w-10 h-10 rounded-md border transition-colors mb-0.5 ${
            isLocked
              ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-border bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>

        {/* Alto */}
        <div className="flex-1 space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor={heightFieldName}
          >
            Alto (px)
          </label>
          <input
            id={heightFieldName}
            name={heightFieldName}
            type="number"
            min={16}
            max={400}
            value={height}
            onChange={handleHeightChange}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* ── Info ── */}
      <p className="text-muted-foreground text-xs">
        {isLocked
          ? '🔒 La proporción está bloqueada. Cambiar el ancho o alto ajusta el otro automáticamente.'
          : '🔓 Proporción libre. Puedes cambiar ancho y alto de forma independiente.'}
      </p>
    </div>
  );
}
