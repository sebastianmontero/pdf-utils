import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib';

export interface FillPDFOptions {
  flatten?: boolean;
}

/**
 * Parses and fills a PDF form with the provided key-value mapping.
 * 
 * @param pdf - The PDF document buffer, ArrayBuffer, or base64 string.
 * @param formValues - A dictionary of values mapped to their respective PDF field retrieval keys.
 * @param options - Additional options, such as whether to flatten the form.
 * @returns The filled PDFDocument instance.
 */
export async function fillPDFForm(
  pdf: string | Uint8Array | ArrayBuffer,
  formValues: Record<string, any>,
  options: FillPDFOptions = {}
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.load(pdf);
  const form = pdfDoc.getForm();

  for (const [key, value] of Object.entries(formValues)) {
    const field = form.getFieldMaybe(key);
    
    if (!field) {
      console.warn(`[Warning] Form field "${key}" not found in the PDF. Skipping.`);
      continue;
    }

    try {
      if (field instanceof PDFTextField) {
        field.setText(value != null ? value.toString() : '');
      } else if (field instanceof PDFCheckBox) {
        if (value === true || String(value).toLowerCase() === 'true' || String(value) === '1') {
          field.check();
        } else {
          field.uncheck();
        }
      } else if (field instanceof PDFRadioGroup) {
        field.select(value.toString());
      } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
        if (Array.isArray(value)) {
           value.forEach(v => field.select(v.toString()));
        } else {
           field.select(value.toString());
        }
      } else {
        console.warn(`[Warning] Field "${key}" is of unsupported type (${field.constructor.name}) for automated filling. Skipping.`);
      }
    } catch (err: any) {
      console.error(`[Error] Failed to fill field "${key}": ${err.message}`);
    }
  }

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc;
}
