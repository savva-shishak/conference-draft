/* eslint-disable no-async-promise-executor */
export async function getPdf(path) {
  return new Promise(async (res) => {
    const pdfjs = await import('pdfjs-dist/build/pdf');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    pdfjs.getDocument(path).promise.then((pdf) => {
      res(pdf);
    });
  });
}
