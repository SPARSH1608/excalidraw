
'use client'
import { useEffect, useRef } from "react"
import { CanvasRenderer } from "../../engine/CanvasEngine";
import { shapeStore } from "../../engine/ShapeStore";

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<CanvasRenderer | null>(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        console.log('ref', canvasRef)
        console.log('current', canvasRef.current)
        engineRef.current = new CanvasRenderer(canvasRef.current)


    }, [])
    return ((
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={800}
                style={{ background: "#1e1e1e" }}
            />
            <button onClick={() => engineRef.current?.setTool("select")}>
                Select
            </button>

            <button onClick={() => engineRef.current?.setTool("rect")}>
                Rectangle
            </button>


        </div>
    )
    )
}