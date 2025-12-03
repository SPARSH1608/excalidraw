import { Shape } from "./Shapes";

class ShapeStore{
    
    shapes:Shape[]=[]
    add(shape:Shape){
        this.shapes.push(shape)
    }
    getAll(){
        return this.shapes
    }remove(shape: Shape) {
        this.shapes = this.shapes.filter(s => s !== shape);
      }
      
}

export const shapeStore=new ShapeStore()