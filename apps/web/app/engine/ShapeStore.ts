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
    deleteByIds(ids:Set<string>){
        this.shapes=this.shapes.filter(s=>!ids.has(s.id))
    }
   
    clear(){
        this.shapes=[]
    }
}

export const shapeStore=new ShapeStore()