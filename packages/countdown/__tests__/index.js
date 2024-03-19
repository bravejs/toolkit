const Countdown = require('../dist/index');

const cd = new Countdown();

/**
 * TODO：use timer-mocks
 * https://jestjs.io/docs/timer-mocks
 */

test('Start', () => {
  expect(cd.seconds).toBe(-1);
  cd.start(10);
  expect(cd.seconds).toBe(10);
});

test('End', () => {
  cd.end();
  expect(cd.seconds).toBe(0);
});

test('Restart', () => {
  cd.start(10);
  expect(cd.seconds).toBe(10);
});

test('Reset', () => {
  cd.reset();
  expect(cd.seconds).toBe(-1);
});

test('Start -> Cancel -> End -> Reset', () => {
  expect(cd.seconds).toBe(-1);
  cd.start(10);
  expect(cd.seconds).toBe(10);
  cd.cancel();
  expect(cd.seconds).toBe(10);
  cd.end();
  expect(cd.seconds).toBe(0);
  cd.reset();
  expect(cd.seconds).toBe(-1);
});
