import {
  useContext,
  useEffect,
  useRef,
} from 'react';
import { toast } from 'react-toastify';
import { UserContext } from '../context/user/User';
import { PresentationContext } from '../room/presntation';
import { useSocketEvent } from '../room/useSocketEvent';

export function usePresentation() {
  const canvasRef = useRef();
  const userCanvasRef = useRef();
  const containerRef = useRef();
  const scaleRef = useRef(1);
  const {
    pdf,
    presentation: {
      pageNum,
      totalPages,
      peerId,
      lines,
      pensColors,
    } = {
      pageNum: 0,
      totalPages: 0,
      peerId: '',
      lines: [],
    },
    drawline,
  } = useContext(PresentationContext);
  const { user } = useContext(UserContext);

  async function renderPage() {
    if (pageNum && pageNum <= totalPages && pdf && canvasRef.current) {
      const { current: canvas = new HTMLCanvasElement() } = canvasRef;
      const { current: userCanvas = new HTMLCanvasElement() } = userCanvasRef;

      const page = await pdf.getPage(pageNum);

      const viewport = page.getViewport({ scale: 1 });

      scaleRef.current = (
        Math.min(
          (containerRef.current.clientWidth / viewport.width) * 0.9,
          (containerRef.current.clientHeight / viewport.height) * 0.9,
          1,
        )
      );

      const canvases = [
        userCanvasRef.current,
        canvas,
      ].filter((item) => !!item);

      for (const element of canvases) {
        element.width = viewport.width;
        element.height = viewport.height;

        element.style.transform = `scale(${scaleRef.current})`;
      }

      page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
      });

      const ctx = userCanvas.getContext('2d');
      ctx.clearRect(0, 0, 2000, 2000);

      for (const { start, end, color } of lines.filter((point) => point.page === pageNum)) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
  }

  useEffect(() => {
    renderPage();
  }, [totalPages, pageNum, pdf]);

  useEffect(() => {
    if (!lines.length) {
      renderPage();
    }
  }, [peerId, lines.length]);

  useEffect(() => {
    toast.info('Если презентация отображается не корректно, нажмите на неё', { position: 'top-left' });
  }, [peerId]);

  useSocketEvent('peer draw line', async (line) => {
    const { current: userCanvas = new HTMLCanvasElement() } = userCanvasRef;
    const ctx = userCanvas.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 3;
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
  }, [totalPages, pageNum, pdf, userCanvasRef.current]);

  useEffect(() => {
    const { current: userCanvas = new HTMLCanvasElement() } = userCanvasRef;

    let prevPoint = null;

    const draw = (e) => {
      if (e.buttons === 1) {
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scaleRef.current;
        const y = (e.clientY - rect.top) / scaleRef.current;

        const end = { x, y };

        const start = prevPoint || end;

        const line = drawline(start, end);

        const ctx = userCanvas.getContext('2d');

        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        prevPoint = end;
      } else {
        prevPoint = null;
      }
    };

    userCanvas.addEventListener('mousemove', draw);

    return () => {
      userCanvas.removeEventListener('mousemove', draw);
    };
  }, [pensColors[user.peerId]]);

  return {
    userCanvasRef,
    canvasRef,
    containerRef,
    peerId,
    renderPage,
  };
}
