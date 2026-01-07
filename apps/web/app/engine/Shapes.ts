// this file will only contain my data definitions

export type ShapeId=string;


export type RectShape={
    id:ShapeId,
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
}

export type Shape=RectShape;