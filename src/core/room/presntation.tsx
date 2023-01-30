import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import React, { createContext, SetStateAction, useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/auth/Auth";
import { FilesContext } from "../context/files";
import { getPdf } from "../context/files/getPdf";
import { UserContext } from "../context/user/User";
import { Line, Presentation as PresentationType } from "./types"
import { LoadedDataContext } from "./Room";
import { useSocketEvent } from "./useSocketEvent";

export const PresentationContext = createContext({
  presentation: null as PresentationType | null,
  setPresentation: (() => {}) as React.Dispatch<SetStateAction<PresentationType | null>>,
  openPresentation: (() => {}) as () => Promise<any>,
  closePresentation: () => {},
  pdf: null as PDFDocumentProxy | null,
  setPdf: (() => {}) as React.Dispatch<SetStateAction<PDFDocumentProxy | null>>,
  drawline: (() => {}) as any as ((start: { x: number, y: number }, end: { x: number, y: number}) => Line | null),
  clearPresentation: () => {},
  setColorsPens: (colors: PresentationType['pensColors']) => {},
  setPage: (page: number) => {},
});

export function Presentation({ children }: any) {
  const { user } = useContext(UserContext);
  const [presentation, setPresentation] = useState(useContext(LoadedDataContext).presentation);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const { http, socket } = useContext(AuthContext);
  const { sendFileAsPdf, getClientFile } = useContext(FilesContext);

  useEffect(() => {
    if (presentation) {
      getPdf(presentation.url).then(setPdf);
    } else {
      setPdf(null);
    }
  }, [presentation?.id]);

  useSocketEvent('update pen', (color) => {
    setPresentation((presentation) => presentation && ({
      ...presentation,
      pensColors: {
        ...presentation.pensColors,
        [user.peerId]: color,
      },
    }))
  }, [setPresentation]);

  useSocketEvent('show presentation', async (presentation: PresentationType) => {
    setPresentation(presentation);
  }, [setPresentation]);

  useSocketEvent('peer draw line', async (line: Line) => {
    setPresentation((pres) => pres && { ...pres, lines: [...pres.lines, line] });
  }, [setPresentation]);

  useSocketEvent('hide presentation', () => {
    setPresentation(null);
  }, [setPresentation]);

  useSocketEvent('clear presentation', () => {
    setPresentation((pres) => pres && { ...pres, lines: [] });
  }, [setPresentation]);

  useSocketEvent('set page in presentation', (pageNum: number) => {
    setPresentation((pres) => pres && { ...pres, pageNum });
  }, [setPresentation]);

  return (
    <PresentationContext.Provider
      value={{
        presentation,
        setPresentation,
        pdf,
        setPdf,
        async openPresentation(tragetUrl?: string) {
          const url = tragetUrl || (await sendFileAsPdf(await getClientFile('.pdf,.pptx')));

          const pdf = await getPdf(url);

          setPdf(pdf);

          await http.post('/show-presentation', { url, totalPages: pdf.numPages  });   
        },
        closePresentation() {
          setPresentation(null);
          http.post('/hide-presentation'); 
        },
        drawline(start, end) {
          const color = presentation?.pensColors[user.peerId];

          if (!color || !presentation) {
            return null;
          }

          const line: Line = {
            start,
            end,
            color,
            page: presentation.pageNum,
            peerId: user.peerId,
          };

          socket.emit('draw line', { start, end });
          setPresentation((pres) => pres && { ...pres, lines: [...pres.lines, line] });

          return line;
        },
        clearPresentation() {
          socket.emit('clear presentation');
          setPresentation(presentation && { ...presentation, lines: [] });
        },
        setColorsPens(colors) {
          socket.emit('set pens', colors);
          setPresentation(presentation && { ...presentation, pensColors: colors })
        },
        async setPage(page) {
          await http.post('/set-page-presentation', { page });
          setPresentation(presentation && { ...presentation, pageNum: page });
        }
      }}
    >
      {children}
    </PresentationContext.Provider>
  )
}
