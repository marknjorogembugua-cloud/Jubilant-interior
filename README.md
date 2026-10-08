# Jubilant Interior Solution — Elite Quotation Manager

PC-first Electron desktop software for creating premium interior-design quotations.

## Key features
- Professional A4 PDF quotation export using the Jubilant brand/logo
- Company logo watermark on exported quotations and PDF reports
- PDF reports for the dashboard, quotations, clients, projects, services/materials and business profile
- PDF reports follow the active search filter on list screens
- Branded quotation status, document number, date, validity and client reference
- Room/zone based quotation lines
- Optional quotation lines are shown in the PDF and excluded from the main total
- Scope line amounts can be edited directly; the unit price adjusts to match the quantity
- Quantity, unit, rate and automatic totals
- No VAT and no discounts
- Project overview, payment terms, assumptions/exclusions
- Client and project management, including editing records and synchronizing linked project/quotation details
- Editable reusable services/materials catalogue with one-click, searchable PDF export
- Business identity, tagline, website, payment instructions and PDF footer
- JSON backup and restore (JSON is retained for reliable full-data recovery; document and report exports are PDF)
- Local persistent data

## Run
```bash
npm install
npm start
```

## Windows installer
```bash
npm run build
```
The installer will be created in `dist/` as a Windows NSIS setup executable.
