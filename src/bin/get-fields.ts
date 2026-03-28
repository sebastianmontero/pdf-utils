#!/usr/bin/env node
import { PDFDocument, PDFRef, PDFWidgetAnnotation } from 'pdf-lib';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: ts-node get-form-fields.ts <pdf-file>');
    process.exit(1);
  }

  const pdfPath = args[0];
  let pdfBytes: Buffer;
  try {
    pdfBytes = fs.readFileSync(pdfPath);
  } catch (e) {
    console.error(`Cannot read file: ${pdfPath}`);
    process.exit(1);
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // Create a mapping from widget reference to page number
  const widgetToPageMap = new Map<PDFRef, number>();
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const annots = page.node.Annots();
    if (annots) {
      for (let j = 0; j < annots.size(); j++) {
        const ref = annots.get(j);
        if (ref instanceof PDFRef) {
          widgetToPageMap.set(ref, i + 1);
        }
      }
    }
  }

  console.log(`Analyzing PDF: ${pdfPath}`);
  console.log(`Total fields found: ${fields.length}\n`);

  for (const field of fields) {
    const name = field.getName();
    const type = field.constructor.name.replace('PDF', ''); 
    // Types like PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList, PDFButton, PDFSignature
    
    // Find pages the field widgets are on
    const widgets = field.acroField.getWidgets();
    const pagesFound = new Set<number>();
    for (const widget of widgets) {
      // Find the ref for this widget.
      // pdf-lib's PDFWidgetAnnotation exposes dict, which has a reference inside the document structure?
      // Wait, let's try to match by comparing widget.dict or searching through the map
      // Actually widget is a PDFWidgetAnnotation which wraps a PDFDict. It doesn't store its own PDFRef natively except in context context?
      // We can also check widget.P() which is the page ref, then find which page has that ref.
      const pRef = widget.P();
      if (pRef instanceof PDFRef) {
         const pageIndex = pages.findIndex(p => p.ref === pRef);
         if (pageIndex !== -1) {
            pagesFound.add(pageIndex + 1);
         }
      } else {
         // fallback: search our widgetToPageMap if we can find the ref
         // But we don't know the widget's ref directly.
         // Let's rely on widget.P() first. 
         // Most well-formed PDFs have widget.P()
      }
    }

    let pageStr = pagesFound.size > 0 ? Array.from(pagesFound).join(', ') : 'Unknown';

    console.log(`-------------------------------------------------`);
    console.log(`Field Name: ${name}`);
    console.log(`Retrieve Key (form.getField(...)): "${name}"`);
    console.log(`Type: ${type}`);
    console.log(`Page(s): ${pageStr}`);

    if (type === 'Dropdown' || type === 'OptionList') {
      console.log(`Options (Value to select -> Display text if different):`);
      const opt = (field as any).acroField.dict.get(pdfDoc.context.obj('Opt'));
      if (opt && typeof opt.size === 'function') {
         for (let i = 0; i < opt.size(); i++) {
            const item = opt.get(i);
            if (item && item.constructor.name === 'PDFArray') {
               const exportVal = item.get(0)?.decodeText() || item.get(0)?.toString() || '';
               const displayVal = item.get(1)?.decodeText() || item.get(1)?.toString() || '';
               console.log(`  - "${exportVal}" -> "${displayVal}"`);
            } else if (item) {
               const val = item.decodeText ? item.decodeText() : item.toString();
               console.log(`  - "${val}"`);
            }
         }
      } else {
         // Fallback
         const options = (field as any).getOptions ? (field as any).getOptions() : [];
         options.forEach((opt: string) => {
           console.log(`  - "${opt}"`);
         });
      }
    } else if (type === 'RadioGroup') {
      const options = (field as any).getOptions ? (field as any).getOptions() : [];
      console.log(`Options (Value to select):`);
      options.forEach((opt: string) => {
        console.log(`  - "${opt}"`);
      });
      console.log(`  (Note: The physical text like "Producto A" next to the radio button is just drawn text on the PDF and cannot be read natively by pdf-lib)`);
    } else if (type === 'CheckBox') {
      // For checkboxes, typically valid values are the "on" value and "Off"
      // But let's show how to find its on value
      // pdf-lib CheckBox doesn't directly expose getOnValue() without going to acroField
      let onValue = 'Unknown';
      try {
          if ((field as any).acroField && (field as any).acroField.getOnValue) {
              const onValObj = (field as any).acroField.getOnValue();
              onValue = onValObj ? onValObj.decodeText() || onValObj.toString() : 'Unknown';
          }
      } catch (e) {
          // ignore
      }
      console.log(`Options (Value to select):`);
      console.log(`  - Checked: true or "${onValue}"`);
      console.log(`  - Unchecked: false`);
    } else if (type === 'Button') {
       console.log(`Options: This is an action button, no value to select.`);
    }

  }
  console.log(`-------------------------------------------------\nFinished.`);
}

main().catch(console.error);
