import QRCode from 'qrcode';

export function buildQrOptions({
  value,
  size,
  margin,
  foreground,
  background,
  errorCorrectionLevel,
}) {
  return {
    text: value,
    width: size,
    margin,
    errorCorrectionLevel,
    color: {
      dark: foreground,
      light: background,
    },
  };
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const chunk = normalized.length === 3
    ? normalized
      .split('')
      .map((part) => part + part)
      .join('')
    : normalized;
  const int = Number.parseInt(chunk, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function relativeChannel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * relativeChannel(r) +
    0.7152 * relativeChannel(g) +
    0.0722 * relativeChannel(b)
  );
}

export function contrastRatio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

export function isLowContrastPair(foreground, background) {
  return contrastRatio(foreground, background) < 3.5;
}

export function shouldWarnAboutScanability({ foreground, background }) {
  return isLowContrastPair(foreground, background);
}

export async function renderQrToCanvas(canvas, options) {
  const { text, ...qrOptions } = buildQrOptions(options);
  await QRCode.toCanvas(canvas, text, qrOptions);
}

export function exportCanvasAsPng(canvas, filename = 'qr-code.png') {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
