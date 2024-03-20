const Calendar = require('../dist/calendar.cjs');
const c = new Calendar('2019-3-30');

test('2019-3-30', () => {
  expect(c.month).toBe(3);
  expect(c.date).toBe(30);
  expect(c.items.length).toBe(42);
});

test('Prev month', () => {
  const prevC = c.prev();
  expect(prevC.month).toBe(2);
  expect(prevC.date).toBe(28);
});

test('Next month', () => {
  const nextC = c.next();
  expect(nextC.month).toBe(4);
  expect(nextC.date).toBe(30);
});