import pdfjs from 'pdfjs-dist';

export const f = () => (pdfjs.getDocument('test').promise);