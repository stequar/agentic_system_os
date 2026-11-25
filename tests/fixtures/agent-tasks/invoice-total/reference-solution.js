// Reference solution: proves the task is solvable and the hidden tests are satisfiable.
// Never copied into a trial workspace.
function assertNonNegativeInteger(value, name) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
}

export function computeInvoiceTotal(lines, options = {}) {
  const { discountPct = 0, taxPct = 0 } = options;
  if (typeof discountPct !== "number" || discountPct < 0 || discountPct > 100) {
    throw new RangeError("discountPct must be between 0 and 100");
  }
  if (typeof taxPct !== "number" || taxPct < 0) {
    throw new RangeError("taxPct must not be negative");
  }

  let subtotalCents = 0;
  for (const line of lines) {
    assertNonNegativeInteger(line.unitPriceCents, "unitPriceCents");
    assertNonNegativeInteger(line.quantity, "quantity");
    subtotalCents += line.unitPriceCents * line.quantity;
  }

  const discountCents = Math.round((subtotalCents * discountPct) / 100);
  const taxCents = Math.round(((subtotalCents - discountCents) * taxPct) / 100);
  return { subtotalCents, discountCents, taxCents, totalCents: subtotalCents - discountCents + taxCents };
}
