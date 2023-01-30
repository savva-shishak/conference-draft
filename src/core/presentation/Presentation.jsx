/* eslint-disable jsx-a11y/media-has-caption */
import './Presentation.scss';

import { usePresentation } from './usePresentation';

export function Presentation() {
  const {
    userCanvasRef,
    canvasRef,
    containerRef,
    renderPage,
  } = usePresentation();

  return (
    <div className="presentation">
      <div ref={containerRef} className="presentation__container">
        <canvas ref={canvasRef} />
      </div>
      <div onClick={renderPage} className="presentation__container">
        <canvas ref={userCanvasRef} />
      </div>
    </div>
  );
}
