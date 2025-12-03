'use client'

import { useEffect, useRef, useState } from "react"
import { CanvasEngine } from "../../engine/CanvasEngine"

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [type, setType] = useState("")
    const engineRef = useRef<CanvasEngine | null>(null)
    useEffect(() => {
        if(!canvasRef.current) return
        engineRef.current = new CanvasEngine(canvasRef.current)
        engineRef.current.setTool(type)
    
    }, [])
    
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setTool(type)
        }
    }, [type])
    return (<div>
        <div>
            {
                type
            }
            <button
            onClick={()=>setType('text')}
            >Text</button>
             <button
            onClick={()=>setType('select')}
            >Select</button>
            <button
                onClick={() => setType('rect')}
            >Rectangle</button>
            <button
                onClick={() => setType('circle')}

            >Circle</button>
            <button
                onClick={() => setType('line')}

            >Line</button>
            <button
                onClick={() => setType('pencil')}

            >Pencil</button>

        </div>
     
        <canvas ref={canvasRef} height={1000} width={1000}></canvas>
    </div>)
}