'use client'

import { useEffect, useRef, useState } from "react"
import { CanvasRenderer } from "../../engine/CanvasEngine"

type Tool = "select" | "rect"

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasRenderer | null>(null)
  const [tool, setTool] = useState<Tool>("select")
const [zoom,setZoom]=useState(100);
  useEffect(() => {
    if (!canvasRef.current) return
    engineRef.current = new CanvasRenderer(canvasRef.current)
    engineRef.current.setTool(tool)
    setZoom(100)
  }, [])

  useEffect(() => {
    engineRef.current?.setTool(tool)
  }, [tool])
  const zoomIn = () => {
    engineRef.current?.zoomIn();
    setZoom(Math.round((engineRef.current?.getZoom() ?? 1) * 100));
  };

  const zoomOut = () => {
    engineRef.current?.zoomOut();
    setZoom(Math.round((engineRef.current?.getZoom() ?? 1) * 100));
  };
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] overflow-hidden">

      <canvas
        ref={canvasRef}
        width={3000}
        height={3000}
        className="absolute inset-0 bg-[#121212]"
      />

      <div className="fixed top-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-xl bg-[#1c1c1c] px-2 py-1 shadow-lg border border-[#2a2a2a]">
          <ToolButton label="Select" active={tool === "select"} onClick={() => setTool("select")} />
          <ToolButton label="Rect" active={tool === "rect"} onClick={() => setTool("rect")} />
          <Divider />
          <ToolButton label="Circle" />
          <ToolButton label="Line" />
          <ToolButton label="Text" />
        </div>
      </div>

      <div className="fixed top-4 right-4 flex gap-2">
        <button className="rounded-lg bg-[#1c1c1c] px-3 py-2 text-sm text-gray-200 border border-[#2a2a2a]">
          Excalidraw+
        </button>
        <button className="rounded-lg bg-[#6c6cff] px-3 py-2 text-sm text-white">
          Share
        </button>
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-[#2a2b2f] rounded-xl px-3 py-2 shadow-lg">
        <button
          onClick={zoomOut}
          className="text-white text-xl px-2 hover:bg-[#3a3b40] rounded"
        >
          −
        </button>

        <span className="text-white text-sm w-14 text-center">
          {zoom}%
        </span>

        <button
          onClick={zoomIn}
          className="text-white text-xl px-2 hover:bg-[#3a3b40] rounded"
        >
          +
        </button>
      </div>

      <div className="fixed bottom-4 right-4 flex items-center gap-2">
        <button className="rounded-lg bg-[#1c1c1c] px-3 py-2 text-gray-300 border border-[#2a2a2a]">
          ?
        </button>
      </div>
    </div>
  )
}


function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg text-xs font-medium
        transition-colors
        ${active
          ? "bg-[#6c6cff] text-white"
          : "text-gray-300 hover:bg-[#2a2a2a]"
        }
      `}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-[#2a2a2a]" />
}
