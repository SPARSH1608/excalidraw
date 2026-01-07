import { RectShape } from "./Shapes";
import { shapeStore } from "./ShapeStore";

export class CanvasRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isDrawing = false;
    private startX = 0;
    private startY = 0;

    private tool: "rect" | "select" = "rect";
    private selectedIds = new Set<string>()
    private selectionBox: { x: number; y: number; width: number; height: number } | null = null

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Canvas not supported");
        }
        this.ctx = ctx;
        this.initEvents();
    }

    private initEvents() {
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    }
    setTool(tool: "rect" | "select") {
        console.log('tool', tool)
        this.tool = tool;
    }

    render() {
        this.clear();

        const shapes = shapeStore.getAllShapes();
        for (const shape of shapes) {
            if (shape.type == "rect") {
                this.drawRect(shape)
            }
            if (this.selectedIds.has(shape.id)) {
                this.ctx.setLineDash([4, 4]);
                this.ctx.strokeStyle = "cyan";
                this.ctx.strokeRect(
                    shape.x - 4,
                    shape.y - 4,
                    shape.width + 8,
                    shape.height + 8
                );
                this.ctx.setLineDash([]);
            }

        }

    }
    //function which can handle neg drags -> positive drags
    private normalizeRect(r:{x:number,y:number;width:number;height:number}){
        const x=Math.min(r.x,r.x+r.width);
        const y=Math.min(r.y,r.y+r.height);
        const width=Math.abs(r.width)
        const height=Math.abs(r.height)
        return {x,y,width,height}
    }
    private rectsIntersect(
        a: { x: number; y: number; width: number; height: number },
        b: { x: number; y: number; width: number; height: number }
      ) {
        return !(
          a.x + a.width < b.x ||
          a.x > b.x + b.width ||
          a.y + a.height < b.y ||
          a.y > b.y + b.height
        );
      }
      private getBoundingBox(shape: RectShape) {
        return {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height
        };
      }
      
    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }
    private onMouseUp = (e: MouseEvent) => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
      
        const { x, y } = this.getMousePos(e);
      
        if (this.tool === "select" && this.selectionBox) {
          this.selectedIds.clear();
      
          const sel = this.normalizeRect(this.selectionBox);
          const shapes = shapeStore.getAllShapes();
      
          for (const shape of shapes) {
            const box = this.getBoundingBox(shape);
            if (this.rectsIntersect(box, sel)) {
              this.selectedIds.add(shape.id);
            }
          }
      
          this.selectionBox = null;
          this.render();
          return;
        }
      
        if (this.tool === "rect") {
          const rect: RectShape = {
            id: crypto.randomUUID(),
            type: "rect",
            x: this.startX,
            y: this.startY,
            width: x - this.startX,
            height: y - this.startY
          };
          shapeStore.addShape(rect);
        }
      
        this.render();
      };
      
    private drawSelectionMarquee() {
        if (!this.selectionBox) return;
      
        const r = this.normalizeRect(this.selectionBox);
      
        this.ctx.setLineDash([4, 4]);
        this.ctx.strokeStyle = "cyan";
        this.ctx.strokeRect(r.x, r.y, r.width, r.height);
        this.ctx.setLineDash([]);
      }
      
    private hitTestRect(shape: RectShape, x: number, y: number): boolean {
        return (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height)
    }
    private onMouseDown = (e: MouseEvent) => {
        const { x, y } = this.getMousePos(e);

        if (this.tool == 'select') {
            this.isDrawing=true;
            this.startX=x;
            this.startY=y;
            this.selectionBox={x,y,width:0,height:0}
            return
        }
        this.isDrawing = true;
        this.startX = x;
        this.startY = y
        console.log("DOWN", x, y);
    }
    private onMouseMove = (e: MouseEvent) => {
        if (!this.isDrawing) return;
        const { x, y } = this.getMousePos(e);
        console.log("MOVE", x, y);
        if (this.tool === "select" && this.selectionBox) {
            this.selectionBox.width = x - this.startX;
            this.selectionBox.height = y - this.startY;
        
            this.render();
            this.drawSelectionMarquee();
            return;
          }
        const widht = x - this.startX;
        const height = y - this.startY;
        this.render()

        this.ctx.strokeStyle = "white"
        this.ctx.strokeRect(this.startX, this.startY, widht, height)
    }
    private clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    private drawRect(shape: RectShape) {
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(
            shape.x,
            shape.y,
            shape.width,
            shape.height
        )
    }
}