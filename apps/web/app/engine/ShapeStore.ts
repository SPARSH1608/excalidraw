import { Shape, ShapeId } from "./Shapes";

class ShapeStore{
    private shapes:Shape[]=[]
    
    addShape(shape:Shape){
        this.shapes.push(shape)
    }
    removeShape(id:ShapeId){
        this.shapes=this.shapes.filter(s=>s.id!=id)
    }
    getAllShapes():Shape[]{
        return this.shapes
    }
    clear(){
        this.shapes=[]
    }
}

export const shapeStore=new ShapeStore()