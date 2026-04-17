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
