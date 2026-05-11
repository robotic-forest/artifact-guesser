// Helper function to adjust HSL lightness
export const adjustLightness = (hexColor, amount) => {
  if (!hexColor) return '#cccccc'; // Fallback for undefined color
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 4) {
    r = parseInt(hexColor[1] + hexColor[1], 16);
    g = parseInt(hexColor[2] + hexColor[2], 16);
    b = parseInt(hexColor[3] + hexColor[3], 16);
  } else if (hexColor.length === 7) {
    r = parseInt(hexColor[1] + hexColor[2], 16);
    g = parseInt(hexColor[3] + hexColor[4], 16);
    b = parseInt(hexColor[5] + hexColor[6], 16);
  } else {
      return '#cccccc'; // Invalid hex format fallback
  }
  r /= 255; g /= 255; b /= 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2; // Initialize h

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Adjust lightness
  l = Math.max(0, Math.min(1, l + amount)); // Clamp between 0 and 1

  // Convert HSL back to RGB
  let r1, g1, b1;
  if (s === 0) {
    r1 = g1 = b1 = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r1 = hue2rgb(p, q, h + 1 / 3);
    g1 = hue2rgb(p, q, h);
    b1 = hue2rgb(p, q, h - 1 / 3);
  }

  // Convert RGB to Hex
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
};
