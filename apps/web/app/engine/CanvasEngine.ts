import { CircleShape, LineShape, PencilShape, Point, RectShape, Shape, TextShape } from "./Shapes"
import { shapeStore } from "./ShapeStore"

export class CanvasEngine {
  
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D


  private drawing = false
  private startX = 0
  private startY = 0
  private lastX=0
  private lastY=0
  tool: string = "rect" //by default
  
  private pencilPoints: Point[] = []
  private editingShape: TextShape | null = null;
  
  private selectionBox:{
    x:number;
    y:number;
    width:number;
    height:number
  } | null= null
  
  private selectedShapes: Shape[] = [];
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error("Canvas not supported")
      }
      this.ctx = ctx
      this.initEvents()
      this.renderAll()
      this.initKeyboardEvents()
    }
  
  startTextEditing(shape: TextShape) {
    this.editingShape = shape
    window.addEventListener('keydown', this.handleKeyDown)
  }
  
  handleKeyDown = (e: KeyboardEvent) => {
    
    //not editable
    if (!this.editingShape) return
    
    e.preventDefault();
    
    if (e.key == 'Escape') {
      console.log('this editing shape', this.editingShape)
      this.editingShape.text = this.editingShape.text.slice(0, 1)
      this.updateTextLayout();
      this.renderAll()
      return;
    }
    
    if (e.key === "Enter") {
      this.editingShape.text += "\n";
      this.updateTextLayout();
      this.renderAll();
      return;
    }
    if(e.key === 'Backspace'){
      this.editingShape.text = this.editingShape.text.slice(0, -1);
      this.updateTextLayout();
      this.renderAll();
    }
    if (e.key.length === 1 || e.key === ' ') {
      this.editingShape.text += e.key;
      this.updateTextLayout();
      this.renderAll();
    }


    console.log(this.editingShape.text)

  }

  updateTextLayout() {
    
    const shape = this.editingShape;
    if (!shape) return;

    const ctx = this.ctx;
    ctx.font = `${shape.fontSize}px sans-serif`;

    const text = shape.text;
    const maxWidth = shape.width;

    const wrappedLines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      let currentLine = '';

      for (const char of paragraph) {
        const testLine = currentLine + char;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          wrappedLines.push(currentLine);
          currentLine = char;
        }
      }

      if (currentLine !== '') {
        wrappedLines.push(currentLine);
      }
    }

    const lineHeight = shape.fontSize * 1.4;
    shape.height = Math.max(wrappedLines.length * lineHeight, lineHeight);

    shape.lines = wrappedLines;
  }


  stopEditing() {
    
    if (this.editingShape) {
      this.editingShape!.isEditing = false;
    }
    
    this.editingShape = null;
    window.removeEventListener("keydown", this.handleKeyDown);
    
  }

  private pos(e: MouseEvent) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top
    };
  }
  
  private initEvents() {
    
    this.canvas.addEventListener("mousedown", e => this.onDown(e));
    
    this.canvas.addEventListener("mousemove", e => this.onMove(e));
    
    this.canvas.addEventListener("mouseup", e => this.onUp(e));
  }
  
  setTool(tool: string) {
    this.tool = tool
  }

  private onMove(e: MouseEvent) {
    const { x, y } = this.pos(e);
  
    if (this.tool === "select") {
      if (this.drawing && this.selectionBox) {
        const width = x - this.startX;
        const height = y - this.startY;
        this.selectionBox.width = width;
        this.selectionBox.height = height;
  
        this.renderAll();
        this.drawSelectionMarquee();
        return;
      }
  
      if (this.drawing && this.selectedShapes.length > 0 && !this.selectionBox) {
        const dx = x - this.lastX;
        const dy = y - this.lastY;
  
        for (const s of this.selectedShapes) {
          this.moveShape(s, dx, dy);
        }
  
        this.lastX = x;
        this.lastY = y;
  
        this.renderAll();
        return;
      }
  
      return;
    }
  
    if (!this.drawing) return;
  
    this.renderAll();
    this.ctx.strokeStyle = "white";
  
    const width = x - this.startX;
    const height = y - this.startY;
  
    if (this.tool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
      return;
    }
  
    if (this.tool === "circle") {
      const dx = x - this.startX;
      const dy = y - this.startY;
      const rx = Math.abs(dx) / 2;
      const ry = Math.abs(dy) / 2;
      const cx = this.startX + dx / 2;
      const cy = this.startY + dy / 2;
  
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      return;
    }
  
    if (this.tool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      return;
    }
  
    if (this.tool === "pencil") {
      this.pencilPoints.push({ x, y });
  
      this.ctx.beginPath();
      this.ctx.moveTo(this.pencilPoints[0].x, this.pencilPoints[0].y);
      for (let i = 1; i < this.pencilPoints.length; i++) {
        this.ctx.lineTo(this.pencilPoints[i].x, this.pencilPoints[i].y);
      }
      this.ctx.stroke();
      return;
    }
  
    if (this.tool === "text") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
      return;
    }
  }
  

  private moveShape(s: Shape, dx: number, dy: number) {
    if (s.type === "rect" || s.type === "text") {
      s.x += dx;
      s.y += dy;
    }
  
    if (s.type === "circle") {
      s.cx += dx;
      s.cy += dy;
    }
  
    if (s.type === "line") {
      s.start.x += dx;
      s.start.y += dy;
      s.end.x += dx;
      s.end.y += dy;
    }
  
    if (s.type === "pencil") {
      s.points = s.points.map(p => ({
        x: p.x + dx,
        y: p.y + dy
      }));
    }
  }
  private initKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (this.selectedShapes.length > 0 && !this.editingShape) {
          for (const s of this.selectedShapes) {
            shapeStore.remove(s);
          }
          this.selectedShapes = [];
          this.renderAll();
        }
      }
    });
  }
  
  private drawSelectionMarquee() {
    const box = this.selectionBox;
    if (!box) return;

    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeStyle = "cyan";
    this.ctx.strokeRect(box.x, box.y, box.width, box.height);
    this.ctx.setLineDash([]);
}

  private onUp(e: MouseEvent) {
    if (!this.drawing) return
    this.drawing = false
    const { x, y } = this.pos(e);
    if (this.tool === 'rect') {

      const rect: RectShape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: x - this.startX,
        height: y - this.startY,
      }
      shapeStore.add(rect)
    }
    else if (this.tool === "circle") {
      const dx = x - this.startX;
      const dy = y - this.startY;

      const rx = Math.abs(dx) / 2;
      const ry = Math.abs(dy) / 2;

      const cx = this.startX + dx / 2;
      const cy = this.startY + dy / 2;

      const circle: CircleShape = {
        type: "circle",
        cx,
        cy,
        rx,
        ry
      };

      shapeStore.add(circle);
    } else if (this.tool == 'line') {
      const l: LineShape = {
        type: "line",
        start: {
          x: this.startX,
          y: this.startY
        },
        end: {
          x,
          y
        }
      }
      shapeStore.add(l)
    } else if (this.tool === "pencil") {
      const pencil: PencilShape = {
        type: "pencil",
        points: this.pencilPoints
      };
      shapeStore.add(pencil);
      this.pencilPoints = [];
    } else if (this.tool === 'text') {
      const width = Number(x - this.startX)
      const height = Number(y - this.startY)
      const t: TextShape = {
        type: 'text',
        x: this.startX,
        y: this.startY,
        width,
        height: 20 * 1.4,
        text: "",
        isEditing: true,
        fontSize: 20

      }
      shapeStore.add(t)
      this.startTextEditing(t)
      this.renderAll()
      return
    }
    if(this.tool==='select'){
    this.drawing=false
        if (!this.selectionBox || (Math.abs(this.selectionBox.width) < 5 && Math.abs(this.selectionBox.height) < 5)) {
        this.handleClickSelection(x, y);
    } else {
        this.handleMarqueeSelection();
    }

    this.selectionBox = null;
    this.renderAll();
    return;
    }
    this.renderAll()


  }
  private handleMarqueeSelection() {
    if (!this.selectionBox) return;

    const { x, y, width, height } = this.selectionBox;

    const x1 = Math.min(x, x + width);
    const y1 = Math.min(y, y + height);
    const x2 = Math.max(x, x + width);
    const y2 = Math.max(y, y + height);

    const selected: Shape[] = [];

    for (const s of shapeStore.getAll()) {
        const box = this.getBoundingBox(s);
        if (!box) continue;

        if (
            box.x > x1 &&
            box.y > y1 &&
            box.x + box.width <x2 &&
            box.y + box.height <y2
        ) {
          console.log('slecting',s)
            selected.push(s);
        }
    }

    this.selectedShapes = selected;
}
private getBoundingBox(s: Shape) {
    if (s.type === "rect" || s.type === "text") {
        return { x: s.x, y: s.y, width: s.width, height: s.height };
    }
    if (s.type === "circle") {
        return { x: s.cx - s.rx, y: s.cy - s.ry, width: s.rx*2, height: s.ry*2 };
    }
    if (s.type === "line") {
        const x1 = Math.min(s.start.x, s.end.x);
        const y1 = Math.min(s.start.y, s.end.y);
        return { x: x1, y: y1, width: Math.abs(s.end.x - s.start.x), height: Math.abs(s.end.y - s.start.y) };
    }
    if (s.type === "pencil") {
        const xs = s.points.map(p => p.x);
        const ys = s.points.map(p => p.y);
        return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
        };
    }
}

  private handleClickSelection(x: number, y: number) {
    const hit = this.hitTest(x, y);

    if (hit) {
        this.selectedShapes = [hit];
    } else {
        this.selectedShapes = [];
    }
}

  
private onDown(e: MouseEvent) {
  const { x, y } = this.pos(e);

  if (this.editingShape && this.tool !== "text") {
    this.stopEditing();
  }

  this.startX = x;
  this.startY = y;
  this.lastX = x;
  this.lastY = y;
  this.drawing = true;

  if (this.tool === "pencil") {
    this.pencilPoints = [{ x, y }];
    return;
  }

  if (this.tool === "text") {
    return;
  }

  if (this.tool === "select") {

    const clickedShape = this.hitTest(x, y);
  
    if (clickedShape) {
      if (!this.selectedShapes.includes(clickedShape)) {
        this.selectedShapes = [clickedShape];
      }
  
      this.selectionBox = null;     
      this.lastX = x;
      this.lastY = y;
      return;
    }
  
    this.selectedShapes = [];
    this.selectionBox = { x, y, width: 0, height: 0 };
    this.lastX = x;
    this.lastY = y;
    return;
  }
  

  }
private hitTest(x: number, y: number): Shape | null {
  const shapes = shapeStore.getAll();
  if(!shapes) return null
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i]!;

    if (s.type === "rect") {
      if (
        x >= s.x &&
        x <= s.x + s.width &&
        y >= s.y &&
        y <= s.y + s.height
      ) return s;
    }

    if (s.type === "circle") {
      const dx = x - s.cx;
      const dy = y - s.cy;
      if ((dx*dx) / (s.rx*s.rx) + (dy*dy) / (s.ry*s.ry) <= 1) return s;
    }

    if (s.type === "line") {
      const dist =
        Math.abs((s.end.y - s.start.y)*x - (s.end.x - s.start.x)*y + s.end.x*s.start.y - s.end.y*s.start.x) /
        Math.hypot(s.end.x - s.start.x, s.end.y - s.start.y);
      if (dist < 6) return s;
    }

    if (s.type === "pencil") {
      for (let j = 0; j < s.points.length - 1; j++) {
        const p1 = s.points[j];
        const p2 = s.points[j+1];
        if(!p1 || !p2) return null
        const dist =
          Math.abs((p2.y - p1.y)*x - (p2.x - p1.x)*y + p2.x*p1.y - p2.y*p1.x) /
          Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (dist < 6) return s;
      }
    }

    if (s.type === "text") {
      if (
        x >= s.x &&
        x <= s.x + s.width &&
        y >= s.y &&
        y <= s.y + s.height
      ) return s;
    }
  }

  return null;
}


  renderAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    shapeStore.getAll().forEach((shape) => {
      
      if (shape.type === 'rect') {
        
        this.drawRect(shape as RectShape)
        
      } else if (shape.type === "circle") {
        
        this.ctx.beginPath();
        this.ctx.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        
      } else if (shape.type == 'line') {
        
        this.ctx.beginPath();
        this.ctx.moveTo(shape.start.x, shape.start.y);
        this.ctx.lineTo(shape.end.x, shape.end.y);
        this.ctx.stroke();
        
      } if (shape.type === "pencil") {
        
        this.ctx.beginPath();
        
        this.ctx.moveTo(shape.points[0]?.x!, shape.points[0]?.y!);
        for (let i = 1; i < shape.points.length; i++) {
          
          this.ctx.lineTo(shape.points[i]?.x!, shape.points[i]?.y!);
        }
        
        this.ctx.stroke();
        
      } if (shape.type === "text") {
        
        this.ctx.font = `${shape.fontSize}px sans-serif`;
        
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

        const lines = shape.lines || shape.text.split("\n");
        const lineHeight = shape.fontSize * 1.4;

        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i] ?? "";
          this.ctx.fillText(
            lineText,
            shape.x,
            shape.y + shape.fontSize + i * lineHeight
          );
        }
      }
      
     
    }
  )
  if (this.selectedShapes.length > 0) {
    this.ctx.save();
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeStyle = "white";
    for (const s of this.selectedShapes) {
      const box = this.getBoundingBox(s);
      if (!box) continue;
      this.ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }
  

  }

  private drawRect(shape: RectShape) {
    this.ctx.strokeStyle = "white"
    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
  }

}