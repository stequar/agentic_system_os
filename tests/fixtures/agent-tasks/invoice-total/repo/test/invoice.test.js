import { test } from "node:test";
import assert from "node:assert/strict";
import { computeInvoiceTotal } from "../src/invoice.js";

test("sums line items", () => {
  const result = computeInvoiceTotal(
    [
      { unitPriceCents: 1000, quantity: 2 },
      { unitPriceCents: 250, quantity: 1 },
    ],
    { discountPct: 0, taxPct: 0 }
  );
  assert.equal(result.subtotalCents, 2250);
  assert.equal(result.totalCents, 2250);
});

test("tax is applied after the discount", () => {
  const result = computeInvoiceTotal([{ unitPriceCents: 10000, quantity: 1 }], {
    discountPct: 10,
    taxPct: 20,
  });
  assert.equal(result.discountCents, 1000);
  assert.equal(result.taxCents, 1800);
  assert.equal(result.totalCents, 10800);
});
