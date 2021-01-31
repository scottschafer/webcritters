export const GenomeColors: number[] = [];

const endianNess = (() => {
  let uInt32 = new Uint32Array([0x11223344]);
  let uInt8 = new Uint8Array(uInt32.buffer);

  if (uInt8[0] === 0x44) {
    return 'Little Endian';
  } else if (uInt8[0] === 0x11) {
    return 'Big Endian';
  } else {
    return 'Maybe mixed-endian?';
  }
})();

const colorToNumber = (endianNess === 'Big Endian') ?
  (r: number, g: number, b: number, a = 255) => {
    return r * 256 * 256 * 256 + g * 256 * 256 + b * 256 + a;
  }
  : (r: number, g: number, b: number, a = 255) => {
    return a * 256 * 256 * 256 + b * 256 * 256 + g * 256 + r;
  };

export const colorToRGB = (color: number) => {
  let rgb: { r: number; g: number; b: number } =
    (endianNess === 'Big Endian') ?
      {
        r: (color / 256 / 256 / 256) & 0xff,
        g: (color / 256 / 256) & 0xff,
        b: (color / 256) & 0xff
      } :
      {
        r: (color) & 0xff,
        g: (color / 256) & 0xff,
        b: (color / 256 / 256) & 0xff
      }
    ;

  return rgb;
}

(() => {
  GenomeColors.push(colorToNumber(0, 255, 0));
  GenomeColors.push(colorToNumber(255, 0, 0));
  GenomeColors.push(colorToNumber(0, 0, 255));
  GenomeColors.push(colorToNumber(255, 255, 0));
  GenomeColors.push(colorToNumber(255, 0, 255));
  GenomeColors.push(colorToNumber(0, 255, 255));
  GenomeColors.push(colorToNumber(192, 192, 192));

  GenomeColors.push(colorToNumber(0, 192, 0));
  GenomeColors.push(colorToNumber(192, 0, 0));
  GenomeColors.push(colorToNumber(0, 0, 192));
  GenomeColors.push(colorToNumber(192, 192, 0));
  GenomeColors.push(colorToNumber(192, 0, 192));
  GenomeColors.push(colorToNumber(0, 192, 192));

  return;

  for (let r = .8; r >= .3; r -= .3) {
    for (let g = .8; g >= .3; g -= .3) {
      for (let b = .8; b >= .3; b -= .3) {
        if (r !== g || g !== b) {
          const brightness = Math.sqrt(
            r * r * .241 +
            g * g * .691 +
            b * b * .068);

          const scale = brightness * .75;
          GenomeColors.push(colorToNumber(
            Math.floor(r / scale) & 0xff,
            Math.floor(g / scale) & 0xff,
            Math.floor(b / scale) & 0xff));
        }
      }
    }
  }
})();

export const ColorBlack = colorToNumber(0, 0, 0);
export const ColorGreen = colorToNumber(0, 255, 0);
export const ColorGray = colorToNumber(128, 128, 128);
