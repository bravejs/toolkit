const dateFormatter = require('../dist/index');

test('Y-M-D H:m:s.ms-w z', () => {
  expect(dateFormatter('1998-3-6 6:15:39.066 +0800',
    'YYYY[YYYY]-[MM]MM-DD[D] [h]HH:mm[m]:[ssss]ss😊.msMS-w,YY_M_D+H:m:s.ms-w[z]z')).
    toBe('1998YYYY-MM03-06D h06:15m:ssss39😊.66066-5,98_3_6+6:15:39.66-5z8');
});

test('Continuous', () => {
  expect(dateFormatter(
      '1998-3-6 16:5:39.066 +0800',
      '[M]YYYYYYMMMDDDHHHmmmsssmsMSwz[M]'
    ) // [M], YYYY, YY, MM, M, DD, D, HH, H, mm, ⚠️ms, ss, ms, MS, w, z, [M]
  ).toBe('M19989803306616160566396606658M');
});

test('Custom replacer', () => {
  expect(dateFormatter(
      '1998-9-16 8:35:21.002',
      'YYYY[YYYY]-[MM]MM-DD[D]✊[h]HH:mm[m]:[ssss]ss.msMS-w,YY_M_D+H:m:s.ms-w',
      /**
       * @param {string} key
       * @param {any} value
       */
      (key, value) => {
        return key === 'YYYY' ? '九八年' : key === 'H' ? value + '点' : value;
      }
    )
  ).toBe('九八年YYYY-MM09-16D✊h08:35m:ssss21.2002-3,98_9_16+8点:35:21.2-3');
});

