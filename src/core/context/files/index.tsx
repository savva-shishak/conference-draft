import React, { createContext, useContext } from "react";
import { v4 } from "uuid";
import { HttpContext } from "../http";

export type FileData = {
  type: string,
  id: string,
  name: string,
  size: number,
  url: string,
}

export const FilesContext = createContext({
  getClientFile: ((accept?: string) => {}) as (accept?: string) => Promise<File>,
  sendFile: ((acceptOrFile?: Blob | string) => {}) as (acceptOrFile?: Blob | string) => Promise<FileData>,
  sendFileAsPdf: ((file: File) => {}) as ((file: File) => Promise<string>),
  downloadFile: (() => {}) as (url: string, name: string) => any
});

export function Files({ children }: any) {
  const { http } = useContext(HttpContext);

  function getFile(accept?: string) {
    return new Promise<File>((res) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) {
        input.accept = accept;
      }
      input.onchange = () => {
        res((input.files || [])[0]);
      };
      input.style.display = 'none';
      document.body.append(input);
      input.click();
    });
  }

  return (
    <FilesContext.Provider
      value={{
        getClientFile: getFile,

        async sendFile(acceptOrFile) {
          const file = (typeof acceptOrFile === 'string' || !acceptOrFile)
            ? await getFile(acceptOrFile)
            : new File([acceptOrFile], 'file');
          
          const formData = new FormData();
          formData.set('file', file);
          
          return http.post('/static', formData).then(({ data: url }) => ({
            type: file.type,
            id: v4(),
            name: (file as any).name || '',
            size: file.size,
            url: url,
          }));
        },
        async sendFileAsPdf(file) {
          const formData = new FormData();
          formData.set('file', file);
          const url = file.name.endsWith('.pdf') ? '/static' : '/static/as-pdf';
          return http.post(url, formData).then(({ data: url }) => url);
        },
        downloadFile(url, name) {
          fetch(url).then(async (res) => {
            const a = document.createElement('a');
        
            a.href = URL.createObjectURL(await res.blob());
            a.target = '_blank';
            a.style.display = 'none';
            a.download = name;
        
            document.body.append(a);
            a.click();
          });
        }
      }}
    >
      {children}
    </FilesContext.Provider>
  )
}