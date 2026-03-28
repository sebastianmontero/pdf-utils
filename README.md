# @smontero/pdf-utils

A lightweight Node.js utility and library for identifying and filling form fields in PDF documents, powered by [pdf-lib](https://pdf-lib.js.org/).

## Features

- **Field Extraction**: Identify all form fields in a PDF, including their names, types, and possible values (for dropdowns, radio groups, etc.).
- **Form Filling**: Programmatically populate PDF forms using a simple JSON mapping.
- **Support for Multiple Field Types**: Works with Text Fields, Checkboxes, Radio Groups, Dropdowns, and Option Lists.
- **Form Flattening**: Optionally flatten forms after filling to make them non-editable.

## Installation

```bash
npm install @smontero/pdf-utils
```

## CLI Usage

The package provides two main CLI tools: `get-fields` and `fill-pdf`.

### 1. Identify Form Fields

Use `get-fields` to analyze a PDF and see what fields are available to fill.

```bash
npx get-fields my-form.pdf
```

**Example Output:**
```text
Analyzing PDF: my-form.pdf
Total fields found: 2

-------------------------------------------------
Field Name: full_name
Retrieve Key (form.getField(...)): "full_name"
Type: TextField
Page(s): 1
-------------------------------------------------
Field Name: country
Type: Dropdown
Options:
  - "US" -> "United States"
  - "MX" -> "Mexico"
...
```

### 2. Fill a PDF Form

Create a JSON file with your data and use `fill-pdf` to generate a populated PDF.

**data.json:**
```json
{
  "full_name": "John Doe",
  "country": "US"
}
```

**Run the command:**
```bash
npx fill-pdf input.pdf data.json output.pdf
```

To flatten the PDF (make it non-editable), add `flatten` at the end:
```bash
npx fill-pdf input.pdf data.json output.pdf flatten
```

## Library Usage

You can also use the core logic in your own TypeScript/JavaScript projects.

```typescript
import { fillPDFForm } from '@smontero/pdf-utils';
import * as fs from 'fs';

async function main() {
  const pdfBytes = fs.readFileSync('form.pdf');
  const values = {
    "first_name": "Jane",
    "is_subscribed": true
  };

  const pdfDoc = await fillPDFForm(pdfBytes, values, { flatten: true });
  const outputBytes = await pdfDoc.save();
  
  fs.writeFileSync('filled.pdf', outputBytes);
}

main();
```

## Development

### Build
To compile the TypeScript source into the `dist/` directory:
```bash
npm run build
```

### Test
(Tests are not yet implemented in this version)
```bash
npm test
```

## License

ISC
