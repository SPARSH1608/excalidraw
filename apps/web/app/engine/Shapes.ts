// export type Point= {
//     x:number,
//     y:number
// }

// export type ShapeStyle={
//     stroke?:string,
//     strokeWidth?:number
//     fill?:string | null
//     opacity?:number
//     dash?:number[] | null
//     lineCap?:CanvasLineCap
//     lineJoin?:CanvasLineJoin
// }

// export type Transform= {
//     rotation?:number
//     scaleX?:number
//     scaleY:number
//     flipX?:boolean
//     flipY:boolean
// }
// export const ShapeTypes=[
//     "rect",
//     "circle",
//     "rhombus",
//     "line",
//     "arrow",
//     "pencil",
//     "text"
// ] as const;

// export type ShapeBase={
    
// }



export type Point={
    x:number;
    y:number
}

export type RectShape={
    type:"rect"
    x:number
    y:number
    width:number
    height:number
}

export type CircleShape = {
    type: "circle";
    cx: number;
    cy: number;
    rx: number;
    ry: number; 
  };
  

export type LineShape={
    type:"line"
    start:Point
    end:Point
}
export type PencilShape={
    type:"pencil"
    points:Point[]
}
export type TextShape={
    type:"text",
    x:number
    y:number
    text:string
    width:number
    height:number
    isEditing:boolean
    fontSize:number
    lines?:string[]
}

export type Shape= | RectShape | CircleShape | LineShape | PencilShape | TextShape

export type Tool="rect" | "circle" | "line" | "pencil" | "text"