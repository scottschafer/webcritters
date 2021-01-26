export const Colors: number[] = [];

(() => {
  let endianNess = (() => {
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
    :
    (r: number, g: number, b: number, a = 255) => {
      return a * 256 * 256 * 256 + b * 256 * 256 + g * 256 + r;
    };


  Colors.push(colorToNumber(0, 0, 0));
  Colors.push(colorToNumber(0, 255, 0));

  Colors.push(colorToNumber(255, 0, 0));
  Colors.push(colorToNumber(0, 0, 255));
  Colors.push(colorToNumber(255, 255, 0));
  Colors.push(colorToNumber(0, 255, 255));

  // for (let r = 1; r >= .4; r -= .3)
  //   for (let g = 1; g >= .4; g -= .3)
  //     for (let b = 1; b >= .4; b -= .3)
  //       if (r != 0 || g != 1 || b != 0) {
  //         Colors.push(colorToNumber(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)));
  //       }
})();
