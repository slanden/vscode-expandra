const test = require("baretest")("Tests");
const assert = require("assert");
const { expansion_range } = require("./lib.js");

test("Should get expansion string range", () => {
  assert.deepEqual(expansion_range("this{some text}not this", 14), {
    start: 0,
    end: 15,
  });
  assert.deepEqual(expansion_range("this{some text}not this", 10), {
    start: 0,
    end: 15,
  });
  assert.deepEqual(expansion_range("this{some text}not this", 15), {
    start: 0,
    end: 15,
  });
  assert.deepEqual(expansion_range("not this {some text}not this", 14), {
    start: 9,
    end: 20,
  });
  assert.deepEqual(expansion_range("this[some attrs]not this", 14), {
    start: 0,
    end: 16,
  });
  assert.deepEqual(expansion_range("this[some attrs]not this", 10), {
    start: 0,
    end: 16,
  });
  assert.deepEqual(expansion_range("this[some attrs]not this", 15), {
    start: 0,
    end: 16,
  });
  assert.deepEqual(expansion_range("not this [some attrs]not this", 14), {
    start: 9,
    end: 21,
  });
  assert.deepEqual(expansion_range("[attr butes]", 11), { start: 0, end: 12 });
  assert.deepEqual(expansion_range("[attr butes]", 12), { start: 0, end: 12 });
  assert.deepEqual(expansion_range("a[attr butes]", 12), { start: 0, end: 13 });
  assert.deepEqual(expansion_range(" a[attr butes] ", 13), {
    start: 1,
    end: 14,
  });
  assert.deepEqual(expansion_range("a[attr butes={expr expr} ]", 26), {
    start: 0,
    end: 26,
  });
  assert.deepEqual(expansion_range("a[attr butes={expr expr} ]", 19), {
    start: 0,
    end: 26,
  });
});

test.run();
