"use client";

import { useEffect, useRef } from "react";
import type { GraphData } from "@/lib/types";
import { GraphScene } from "@/lib/GraphScene";

interface Props {
  graphData: GraphData;
  activeTermId: string;
  onTermSelect: (id: string) => void;
}

export default function GraphPanel({
  graphData,
  activeTermId,
  onTermSelect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const loadedRef = useRef(false);
  const renderedTermIdRef = useRef(activeTermId);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new GraphScene(canvas, w, h, onTermSelect);
    sceneRef.current = scene;
    scene.load(graphData.nodes, graphData.edges);
    // Centre the initial term too. GraphScene now orbits around the selected
    // node, so this gives a useful opening composition without oversized cubes.
    scene.setActiveTerm(activeTermId);
    renderedTermIdRef.current = activeTermId;
    loadedRef.current = true;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        scene.resize(width, height);
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      scene.destroy();
      sceneRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      sceneRef.current &&
      loadedRef.current &&
      renderedTermIdRef.current !== activeTermId
    ) {
      sceneRef.current.setActiveTerm(activeTermId);
      renderedTermIdRef.current = activeTermId;
    }
  }, [activeTermId]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
