import { RectShape } from "./Shapes";
import { shapeStore } from "./ShapeStore";
type ResizeHandle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se"
type selectionBox = {
  x: number,
  y: number,
  width: number,
  height: number
}
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  //for draggin
  private lastX = 0;
  private lastY = 0;
  //for resizing

private draftShape:RectShape|null=null
  private resizing:
    | {
      handle: ResizeHandle;
      startBox: selectionBox;
      startRects: RectShape[];
      startMouse: { x: number; y: number };
    }
    | null = null;
  // for zoom and panning
  private camera = {
    zoom: 1,
    x: 0, y: 0
  }
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
    this.initKeyboardEvents()
  }

  private initEvents() {
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false })
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
  }
  private initKeyboardEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (this.selectedIds.size === 0) return;

        shapeStore.deleteByIds(this.selectedIds);
        this.selectedIds.clear();
        this.render();
      }
    });
  }

  setTool(tool: "rect" | "select") {
    console.log('tool', tool)
    this.tool = tool;
  }
  private onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(
      Math.max(this.camera.zoom * zoomFactor, 0.1),
      5
    );

    const worldX = mouseX / this.camera.zoom + this.camera.x;
    const worldY = mouseY / this.camera.zoom + this.camera.y;

    this.camera.zoom = newZoom;

    this.camera.x = worldX - mouseX / this.camera.zoom;
    this.camera.y = worldY - mouseY / this.camera.zoom;

    this.render();
  };
  private setZoom(newZoom:number){
    this.camera.zoom=Math.min(Math.max(newZoom,0.1),5);
    this.render()
  }
    public zoomIn(){
      this.setZoom(this.camera.zoom*1.1)
  }
  public zoomOut(){
      this.setZoom(this.camera.zoom*0.9)
  }
  public resetZoom(){
      this.setZoom(1);
  }
  public getZoom(){
      return this.camera.zoom;
  }
  render() {
    this.clear();
    this.ctx.save();

    this.ctx.translate(
      -this.camera.x * this.camera.zoom,
      -this.camera.y * this.camera.zoom
    );
    
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    
    const shapes = shapeStore.getAllShapes();
    for (const shape of shapes) {
      if (shape.type === "rect") {
        this.drawRect(shape);
      }
    }
    if (this.selectionBox) {
      this.drawSelectionMarquee();
    }
    if (this.draftShape) {
      this.ctx.setLineDash([4, 4]);
      this.drawRect(this.draftShape);
      this.ctx.setLineDash([]);
    }
  
    this.drawSelectionBoundingBox();
    this.drawResizeHandles();
  
    this.ctx.restore();
  }

  //function which can handle neg drags -> positive drags
  private normalizeRect(r: { x: number, y: number; width: number; height: number }) {
    const x = Math.min(r.x, r.x + r.width);
    const y = Math.min(r.y, r.y + r.height);
    const width = Math.abs(r.width)
    const height = Math.abs(r.height)
    return { x, y, width, height }
  }

  private getResizeHandleAt(x: number, y: number): ResizeHandle | null {
    const box = this.getSelectionBoundingBox();
    if (!box) return null;

    const size = 20;
    const half = size / 2;

    const handles: { id: ResizeHandle; x: number; y: number }[] = [
      { id: "nw", x: box.x - half, y: box.y - half },
      { id: "n", x: box.x + box.width / 2 - half, y: box.y - half },
      { id: "ne", x: box.x + box.width - half, y: box.y - half },

      { id: "w", x: box.x - half, y: box.y + box.height / 2 - half },
      { id: "e", x: box.x + box.width - half, y: box.y + box.height / 2 - half },

      { id: "sw", x: box.x - half, y: box.y + box.height - half },
      { id: "s", x: box.x + box.width / 2 - half, y: box.y + box.height - half },
      { id: "se", x: box.x + box.width - half, y: box.y + box.height - half },
    ];

    for (const h of handles) {
      if (
        x >= h.x &&
        x <= h.x + size &&
        y >= h.y &&
        y <= h.y + size
      ) {
        return h.id;
      }
    }

    return null;
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
  private drawSelectionBoundingBox() {
    const box = this.getSelectionBoundingBox();
    if (!box) return;

    this.ctx.setLineDash([6, 4]);
    this.ctx.strokeStyle = "cyan";
    this.ctx.lineWidth = 1;

    this.ctx.strokeRect(
      box.x,
      box.y,
      box.width,
      box.height
    );

    this.ctx.setLineDash([]);
  }

  private drawResizeHandles() {
    const box = this.getSelectionBoundingBox();
    if (!box) return;

    const handles = this.getResizeHandles(box);

    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "black";

    for (const h of handles) {
      this.ctx.fillRect(h.x, h.y, 8, 8);
      this.ctx.strokeRect(h.x, h.y, 8, 8);
    }
  }

  private getSelectionBoundingBox() {
    if (this.selectedIds.size === 0) return null;

    const shapes = shapeStore.getAllShapes()
      .filter(s => this.selectedIds.has(s.id));

    if (shapes.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const shape of shapes) {
      const box = this.getBoundingBox(shape);

      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);

    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private getBoundingBox(shape: RectShape) {
    const x1 = Math.min(shape.x, shape.x + shape.width);
    const y1 = Math.min(shape.y, shape.y + shape.height);
    const x2 = Math.max(shape.x, shape.x + shape.width);
    const y2 = Math.max(shape.y, shape.y + shape.height);

    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  }

  private moveRect(shape: RectShape, dx: number, dy: number) {
    shape.x += dx;
    shape.y += dy;
  }
  private screenToWorld(x: number, y: number) {
    return {
      x: x / this.camera.zoom + this.camera.x,
      y: y / this.camera.zoom + this.camera.y
    };
  }
  
  private getMousePos(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
  
    return this.screenToWorld(screenX, screenY);
  }
  
  private onMouseUp = (e: MouseEvent) => {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.tool === "rect" && this.draftShape) {
      shapeStore.addShape({
        ...this.draftShape,
        id: crypto.randomUUID(),
      });
      this.draftShape = null;
      this.render();
      return;
    }
    if (this.resizing) {
      this.resizing = null;
      return;
    }

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

  

    this.render();
  };

  private drawSelectionMarquee() {
    if (!this.selectionBox) return;

    const r = this.normalizeRect(this.selectionBox);

    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeStyle = "cyan";
    this.ctx.strokeRect(r.x, r.y, r.width, r.height);
    this.ctx.setLineDash([4/this.camera.zoom,4/this.camera.zoom]);
  }
  private getResizeHandles(box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    const size = 8;
    const half = size / 2;

    const x = box.x;
    const y = box.y;
    const w = box.width;
    const h = box.height;

    return [
      { x: x - half, y: y - half },         // TL
      { x: x + w - half, y: y - half },         // TR
      { x: x - half, y: y + h - half },     // BL
      { x: x + w - half, y: y + h - half },     // BR

      { x: x + w / 2 - half, y: y - half },       // TM
      { x: x + w / 2 - half, y: y + h - half },   // BM
      { x: x - half, y: y + h / 2 - half }, // ML
      { x: x + w - half, y: y + h / 2 - half }, // MR
    ];
  }


  private hitTestRect(shape: RectShape, x: number, y: number): boolean {
    return (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height)
  }


  private onMouseDown = (e: MouseEvent) => {
    const { x, y } = this.getMousePos(e);
    if (this.tool === "rect") {
      this.isDrawing = true;
      this.startX = x;
      this.startY = y;
  
      this.draftShape = {
        id: "draft",
        type: "rect",
        x,
        y,
        width: 0,
        height: 0,
      };
      return;
    }
  
    if (this.tool === "select") {
      const handle = this.getResizeHandleAt(x, y);

      if (handle) {
        const box = this.getSelectionBoundingBox()!;
        const shapes = shapeStore
          .getAllShapes()
          .filter(s => this.selectedIds.has(s.id))
          .map(s => ({ ...s }));

        this.resizing = {
          handle,
          startBox: { ...box },
          startRects: shapes,
          startMouse: { x, y },
        };

        this.isDrawing = true;
        return;
      }
    }


    if (this.tool == 'select') {
      const shapes = shapeStore.getAllShapes();
      let hitSelected = false;
      for (const shape of shapes) {
        if (this.selectedIds.has(shape.id) && this.hitTestRect(shape, x, y)) {
          hitSelected = true;
          break;
        }
      }
      if (hitSelected) {
        console.log('hit')
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;
        this.selectionBox = null;
        return;
      }

      this.isDrawing = true;
      this.startX = x;
      this.startY = y;
      this.selectionBox = { x, y, width: 0, height: 0 }
      return
    }
    this.isDrawing = true;
    this.startX = x;
    this.startY = y
    console.log("DOWN", x, y);
  }
  private performResize(e: MouseEvent) {
    if (!this.resizing) return;

    const { x, y } = this.getMousePos(e);
    const { handle, startBox, startRects, startMouse } = this.resizing;

    let newBox = { ...startBox };

    const dx = x - startMouse.x;
    const dy = y - startMouse.y;

    if (handle.includes("e")) newBox.width += dx;
    if (handle.includes("s")) newBox.height += dy;

    if (handle.includes("w")) {
      newBox.x += dx;
      newBox.width -= dx;
    }

    if (handle.includes("n")) {
      newBox.y += dy;
      newBox.height -= dy;
    }

    // Prevent inversion
    if (newBox.width <= 1 || newBox.height <= 1) return;

    const scaleX = newBox.width / startBox.width;
    const scaleY = newBox.height / startBox.height;

    const shapes = shapeStore.getAllShapes();

    for (const start of startRects) {
      const shape = shapes.find(s => s.id === start.id)!;

      const relX = start.x - startBox.x;
      const relY = start.y - startBox.y;

      shape.x = newBox.x + relX * scaleX;
      shape.y = newBox.y + relY * scaleY;
      shape.width = start.width * scaleX;
      shape.height = start.height * scaleY;
    }
  }


  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing && !this.resizing) return;
    const { x, y } = this.getMousePos(e);
    if (this.tool === "rect" && this.draftShape) {
      this.draftShape.width = x - this.startX;
      this.draftShape.height = y - this.startY;
      this.render();
      return;
    }
    console.log("MOVE", x, y);
    if (this.resizing) {
      this.performResize(e);
      this.render();
      return;
    }

    if (this.tool === "select" && this.selectionBox) {
      this.selectionBox.width = x - this.startX;
      this.selectionBox.height = y - this.startY;

      this.render();
      return;
    }
    if (this.tool === "select" && this.selectedIds.size > 0 &&
      !this.selectionBox
    ) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;

      const shapes = shapeStore.getAllShapes();

      for (const shape of shapes) {
        if (this.selectedIds.has(shape.id)) {
          this.moveRect(shape, dx, dy);
        }
      }

      this.lastX = x;
      this.lastY = y;

      this.render();
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
  private setStrokeStyle(color = "white") {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1 / this.camera.zoom;
  }
  
  private drawRect(shape: RectShape) {
    this.setStrokeStyle("white")
    this.ctx.strokeRect(
      shape.x,
      shape.y,
      shape.width,
      shape.height
    )
  }
}