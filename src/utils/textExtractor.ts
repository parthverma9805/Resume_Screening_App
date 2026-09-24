import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if available in browser
try {
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // Ignore worker init error
}

/**
 * Extracts clean, structured plain text from an uploaded file (PDF, TXT, MD, DOCX, etc.)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. Text files (.txt, .md, .csv, .json, .rtf)
  if (
    file.type.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.rtf') ||
    fileName.endsWith('.json')
  ) {
    return await file.text();
  }

  // 2. PDF files (.pdf)
  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item?.str ? item.str : ''))
          .join(' ');
        textParts.push(pageText);
      }

      const extracted = textParts.join('\n\n').trim();
      if (extracted.length > 30) {
        return extracted;
      }
    } catch (pdfErr) {
      console.warn('PDF.js in-browser parsing failed, attempting fallback text scan:', pdfErr);
    }
  }

  // 3. Binary Fallback (extract printable ASCII words)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      const charCode = bytes[i];
      if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
        str += String.fromCharCode(charCode);
      }
    }
    const cleanWords = str.replace(/[^\w\s@.+/():,-]/g, ' ').replace(/\s+/g, ' ');
    if (cleanWords.length > 50) {
      return cleanWords;
    }
  } catch {
    // Ignore fallback errors
  }

  return '';
}

/**
 * Converts a file to base64 reliably without stack limits
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
