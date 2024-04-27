const formatDate = require('../dist/format-date.cjs');

test('Format date', () => {
  expect(formatDate('1989-12-26 10:03:03',
    '[YY]YY[YYYY]YYYY[M]M[MM]MM[MMM]MMM[MMMM]MMMM[D]D[DD]DD[d]d[dd]dd[ddd]ddd[dddd]dddd[H]H[HH]HH[h]h[hh]hh[m]m[mm]mm[s]s[ss]ss[S]S[SSS]SSS[z]z[Z]Z[ZZ]ZZ[a]a[A]A[Q]Q[x]x[X]X')).
    toBe('YY89YYYY1989M12MM12MMMDecMMMMDecemberD26DD26d2ddTudddTueddddTuesdayH10HH10h10hh10m3mm03s3ss03S0SSS000z8Z+08:00ZZ+0800aamAAMQ4x630640983000X630640983');
});
