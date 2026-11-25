// Hidden grader tests: copied into the trial workspace only AFTER the agent has finished.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeInvoiceTotal } from "../src/invoice.js";

test("options are optional and default to no discount and no tax", () => {
  assert.deepEqual(computeInvoiceTotal([{ unitPriceCents: 199, quantity: 3 }]), {
    subtotalCents: 597,
    discountCents: 0,
    taxCents: 0,
    totalCents: 597,
  });
});

test("an empty invoice is all zeros", () => {
  assert.deepEqual(computeInvoiceTotal([], { discountPct: 10, taxPct: 22 }), {
    subtotalCents: 0,
    discountCents: 0,
    taxCents: 0,
    totalCents: 0,
  });
});

test("discount and tax are rounded half up to the cent, tax on the discounted amount", () => {
  // subtotal 999; 15% = 149.85 -> 150; taxable 849; 22% = 186.78 -> 187
  assert.deepEqual(computeInvoiceTotal([{ unitPriceCents: 333, quantity: 3 }], { discountPct: 15, taxPct: 22 }), {
    subtotalCents: 999,
    discountCents: 150,
    taxCents: 187,
    totalCents: 1036,
  });
});

test("a .5 fraction rounds up", () => {
  // subtotal 250; 5% = 12.5 -> 13
  assert.equal(computeInvoiceTotal([{ unitPriceCents: 250, quantity: 1 }], { discountPct: 5 }).discountCents, 13);
});

test("a 100% discount leaves nothing to tax", () => {
  assert.deepEqual(computeInvoiceTotal([{ unitPriceCents: 500, quantity: 2 }], { discountPct: 100, taxPct: 22 }), {
    subtotalCents: 1000,
    discountCents: 1000,
    taxCents: 0,
    totalCents: 0,
  });
});

test("out-of-range percentages throw RangeError", () => {
  const lines = [{ unitPriceCents: 100, quantity: 1 }];
  assert.throws(() => computeInvoiceTotal(lines, { discountPct: 101 }), RangeError);
  assert.throws(() => computeInvoiceTotal(lines, { discountPct: -1 }), RangeError);
  assert.throws(() => computeInvoiceTotal(lines, { taxPct: -5 }), RangeError);
});

test("invalid line items throw TypeError", () => {
  assert.throws(() => computeInvoiceTotal([{ unitPriceCents: 100, quantity: 1.5 }]), TypeError);
  assert.throws(() => computeInvoiceTotal([{ unitPriceCents: -100, quantity: 1 }]), TypeError);
  assert.throws(() => computeInvoiceTotal([{ unitPriceCents: 100, quantity: -1 }]), TypeError);
  assert.throws(() => computeInvoiceTotal([{ unitPriceCents: "100", quantity: 1 }]), TypeError);
});

test("the public behaviour still holds", () => {
  const result = computeInvoiceTotal([{ unitPriceCents: 10000, quantity: 1 }], { discountPct: 10, taxPct: 20 });
  assert.equal(result.totalCents, 10800);
});
