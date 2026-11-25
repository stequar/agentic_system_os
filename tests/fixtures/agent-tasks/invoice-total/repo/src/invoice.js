/**
 * Computes the totals of an invoice, in integer cents.
 *
 * @param {Array<{unitPriceCents: number, quantity: number}>} lines
 * @param {{discountPct?: number, taxPct?: number}} [options]
 * @returns {{subtotalCents: number, discountCents: number, taxCents: number, totalCents: number}}
 */
export function computeInvoiceTotal(lines, options) {
  let subtotalCents = 0;
  for (const line of lines) {
    subtotalCents += line.unitPriceCents * line.quantity;
  }

  const taxCents = Math.floor((subtotalCents * options.taxPct) / 100);
  const discountCents = Math.floor((subtotalCents * options.discountPct) / 100);

  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents: subtotalCents + taxCents - discountCents,
  };
}
