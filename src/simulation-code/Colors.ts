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

export const blendColors = (color1: number, color2: number, factor: number = .5) => {
  const rgb1 = colorToRGB(color1);
  const rgb2 = colorToRGB(color2);
  const factor2 = 1 - factor;
  return colorToNumber(rgb1.r * factor + rgb2.r * factor2, rgb1.g * factor + rgb2.g * factor2, rgb1.b * factor + rgb2.b * factor2);

}
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

export const colorToRGBStyle = (color: number) => {
  const rgb = colorToRGB(color);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  // return `#${rgb.r.toString(16)}${rgb.g.toString(16)}${rgb.b.toString(16)}`
}

(() => {
  // https://sashamaps.net/docs/resources/20-colors/
  // const uniqueColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#ffffff', '#000000'];
  GenomeColors.push(colorToNumber(0, 255, 0));
  GenomeColors.push(colorToNumber(255, 0, 0));
  GenomeColors.push(colorToNumber(64, 64, 255));
  GenomeColors.push(colorToNumber(255, 255, 0));
  GenomeColors.push(colorToNumber(255, 0, 255));
  GenomeColors.push(colorToNumber(0, 255, 255));
  GenomeColors.push(colorToNumber(192, 192, 192));

  GenomeColors.push(colorToNumber(128, 0, 32));
  GenomeColors.push(colorToNumber(0, 128, 32));
  GenomeColors.push(colorToNumber(192, 32, 0));
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
export const ColorDeathRay = colorToNumber(255, 63, 65);
