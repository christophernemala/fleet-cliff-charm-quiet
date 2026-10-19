---
name: convergint-proforma-invoice
description: Create a single-page Convergint proforma invoice that preserves the approved Convergint letterhead layout, consolidates multiple legacy invoice balances into one transaction line, combines VAT into one amount, and uses the approved Bank of Sharjah Dubai beneficiary details.
version: 1.0.0
---

# Convergint Proforma Invoice Skill

## Purpose

Use this skill whenever a Convergint proforma invoice must be created from one or more source invoices, statements of account, LPOs, purchase orders, or customer balance data.

The output must look like an authentic Convergint business document and must preserve the approved letterhead structure. Do not redesign the document unless the user explicitly requests a new design.

## Authoritative visual reference

Use the approved Convergint proforma template PDF as the layout reference.

Preserve:

- A4 portrait page size.
- Convergint bilingual logo at the upper left.
- `PROFORMA INVOICE` title at the upper right.
- Thin horizontal divider below the header.
- Two-column supplier and customer information area.
- Full-width transaction table.
- Totals section immediately below the transaction table.
- Bank account details near the lower left.
- Dark navy footer bar with centered footer text.
- Original margins, spacing, alignment, and visual hierarchy.

## Fixed company information

### Supplier block

Use:

`CONVERGINT SYSTEMS INTEGRATION L.L.C`

`P.O. Box: 28239, Abu Dhabi`

`United Arab Emirates`

`TRN: 100436956500003`

Do not add `S.O.C` to the supplier block unless the user explicitly provides an updated legal document requiring it.

### Approved bank details

Use the following bank section unless the user supplies a newer official bank confirmation:

`Beneficiary Name: CONVERGINT SYSTEMS INTEGRATION L.L.C S.O.C`

`Account Number: 011-06-167751`

`Bank: BANK OF SHARJAH`

`Branch: Dubai, United Arab Emirates`

`IBAN: AE85 0120 0000 0110 6167 751`

`SWIFT: SHARAEAS`

The `S.O.C` suffix appears in the beneficiary name only.

Do not show MVP Tech as the beneficiary.

Do not show the old Abu Dhabi bank branch wording when this approved Dubai bank block is requested.

## Default customer block

For Winteriors, use:

`WINTERIORS DECOR LLC`

`P. O. Box 643859`

`Media City, Dubai`

`United Arab Emirates`

`TRN: 100226748000003`

Replace this block only when the user provides a different customer address or tax registration number.

## Consolidation rules

When multiple invoices are consolidated into one proforma:

1. Create one proforma page only.
2. Create one transaction row only.
3. Do not list the source invoice numbers in the transaction description.
4. Do not list invoice dates unless the user specifically requests them.
5. Do not create separate rows for each source invoice.
6. Show the LPO references once in the dedicated `LPO Ref` field, separated by commas.
7. Do not repeat LPO references inside the transaction description.
8. Use this default description:

   `100% PROJECT COMPLETION`

9. Use `Pc` as the UoM and `1` as the quantity unless the user specifies otherwise.
10. Combine all taxable balances into one net amount.
11. Combine all VAT into one VAT amount.
12. Show one grand total payable.
13. Use AED with comma separators and exactly two decimals.

## Required transaction table

Use these columns in this order:

1. S.No
2. Description
3. UoM
4. Qty
5. Unit Price AED
6. Gross Amount AED
7. Discount Value AED
8. Net Amount AED
9. VAT Rate (%)
10. VAT Amount AED
11. Net Amount incl. VAT AED

For a consolidated one-line proforma:

- S.No: `1`
- Description: `100% PROJECT COMPLETION`
- UoM: `Pc`
- Qty: `1`
- Unit Price: consolidated net amount excluding VAT
- Gross Amount: consolidated net amount excluding VAT
- Discount Value: `0.00`
- Net Amount: consolidated net amount excluding VAT
- VAT Rate: `5%`
- VAT Amount: consolidated VAT
- Net Amount incl. VAT: consolidated grand total

## Calculation rules

Use source data to calculate:

`Net amount excluding VAT = sum of all outstanding taxable base amounts`

`Combined VAT = sum of the source VAT amounts`

`Grand total = net amount excluding VAT + combined VAT`

Validation:

- Recalculate VAT independently.
- Confirm that the displayed total equals net amount plus VAT.
- When source balances are partial outstanding amounts, use the outstanding balances rather than original invoice totals.
- If the source statement does not separate VAT from outstanding balances, do not invent the VAT split. Ask for the VAT basis or use the user-approved consolidated values.
- Allow a rounding tolerance of AED 0.01 only.

Approved example:

- Amount excluding VAT: AED 79,496.77
- VAT at 5%: AED 3,974.84
- Grand total: AED 83,471.61

## Totals section

Show:

`SUB TOTAL EXCLUDING VAT (AED)`

`VAT @ 5% (AED)`

`GRAND TOTAL (AED)`

Then show the grand total in words.

Example:

`AED EIGHTY-THREE THOUSAND FOUR HUNDRED SEVENTY-ONE AND 61/100 ONLY`

## VAT breakup

Use one VAT breakup table only:

| VAT category | VAT % | Base Amount AED | VAT Amount AED |
|---|---:|---:|---:|
| Standard Rate | 5% | consolidated net amount | consolidated VAT |
| Zero Rate | 0% | 0.00 | 0.00 |
| Out of Scope | 0% | 0.00 | 0.00 |

Do not repeat the VAT breakup table.

## Typography and styling

- Use a professional sans-serif font such as Arial, Aptos, Helvetica, or an available metrically equivalent font.
- Main title: 20-22 pt bold.
- Section labels: 9-11 pt bold.
- Body text: 8.5-10 pt.
- Use Convergint dark navy for headings and table text.
- Recommended navy: `#0B3553`.
- Use white table header background when requested.
- Use bold navy header text on white.
- Use thin navy or dark grey table borders.
- Right-align monetary values.
- Center quantity, UoM, serial number, and VAT rate.
- Keep descriptions left-aligned.
- Do not use red boxes, red highlights, gradients, drop shadows, or decorative stamps.
- Do not fabricate an official company stamp or legal seal.

## Content restrictions

Never:

- Display MVP Tech branding in the final Convergint proforma.
- Show three transaction rows when the user requests a consolidated claim.
- Repeat invoice numbers inside the transaction description.
- Repeat LPO references inside the transaction description.
- Add dates when the user asks for no dates.
- Change bank details without a user instruction or official updated source.
- Infer an account holder name from an acquisition without user confirmation.
- Claim a PDF is visually verified unless it has been rendered and inspected.

## Output workflow

1. Read all source documents.
2. Extract customer details, LPO references, outstanding bases, VAT, and totals.
3. Reconcile the amounts.
4. Populate the JSON data contract.
5. Render the proforma using the approved layout.
6. Export to PDF.
7. Render the output PDF to PNG at 200 DPI.
8. Inspect the complete page for clipping, overlaps, broken glyphs, incorrect borders, and poor alignment.
9. Recalculate the totals one final time.
10. Deliver the PDF and the populated JSON used to generate it.

## Final quality checklist

- [ ] One A4 page only.
- [ ] Original Convergint letterhead preserved.
- [ ] Supplier name does not include S.O.C.
- [ ] Bank beneficiary includes S.O.C.
- [ ] Bank branch shows Dubai.
- [ ] No MVP Tech wording remains.
- [ ] Customer address is correct.
- [ ] Three LPOs appear once in the LPO field when applicable.
- [ ] No source invoice numbers appear unless explicitly requested.
- [ ] One transaction row only.
- [ ] Description reads `100% PROJECT COMPLETION` unless otherwise instructed.
- [ ] One combined net amount.
- [ ] One combined VAT amount.
- [ ] One combined grand total.
- [ ] One VAT breakup table only.
- [ ] All AED values contain two decimals.
- [ ] Totals reconcile within AED 0.01.
- [ ] No stamp, seal, or red box.
- [ ] PDF rendered and visually checked.
