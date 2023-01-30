import { MutableRefObject } from "react";
import React, { useVideo } from "./useVideo";

export type VideoParams = {
  peerId: string,
  mediaTag: 'cam-video' | 'screen-video',
  render?: (ref: MutableRefObject<HTMLVideoElement>, transform: string) => JSX.Element
}

export function Video({ 
  peerId,
  mediaTag,
  render = (ref, transform) => <video ref={ref} style={{ transform }} autoPlay />
}: VideoParams) {
  const videRef = useVideo(mediaTag, peerId);
  return render(videRef, mediaTag === 'cam-video' ? 'scaleX(-1)' : 'scaleX(1)');
}