#!/usr/bin/env node

import * as fs from 'fs';
import { fillPDFForm } from '../index'; // Will map to dist/index.js post-build

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: fill-pdf <input-pdf> <input-json> <output-pdf> [flatten]');
    process.exit(1);
  }

  const [inputPdfPath, inputJsonPath, outputPdfPath, flattenArg] = args;
  const shouldFlatten = flattenArg === 'true' || flattenArg === 'flatten' || flattenArg === '--flatten';

  let pdfBytes: Buffer;
  let jsonData: string;

  try {
    pdfBytes = fs.readFileSync(inputPdfPath);
  } catch (e: any) {
    console.error(`Error reading PDF file at ${inputPdfPath}: ${e.message}`);
    process.exit(1);
  }

  try {
    jsonData = fs.readFileSync(inputJsonPath, 'utf8');
  } catch (e: any) {
    console.error(`Error reading JSON file at ${inputJsonPath}: ${e.message}`);
    process.exit(1);
  }

  let formValues: Record<string, any>;
  try {
    formValues = JSON.parse(jsonData);
  } catch (e: any) {
    console.error(`Error parsing JSON file: ${e.message}`);
    process.exit(1);
  }

  console.log(`Filling form in ${inputPdfPath}...`);
  if (shouldFlatten) {
    console.log(`(Flattening output document)`);
  }

  try {
    const pdfDoc = await fillPDFForm(pdfBytes, formValues, { flatten: shouldFlatten });
    const outputBytes = await pdfDoc.save();
    fs.writeFileSync(outputPdfPath, outputBytes);
    console.log(`\nDone! Filled PDF saved to: ${outputPdfPath}`);
  } catch (err: any) {
    console.error(`\n[Fatal] Error processing PDF: ${err.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
