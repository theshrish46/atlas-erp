"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Maximize2,
    Minimize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import WarehouseToolbox, {
    type WarehouseTool,
} from "./components/warehouse-toolbar";

type WarehouseObjectType =
    | "rack"
    | "shelf"
    | "container"
    | "bench";

type WarehouseObject = {
    id: string;
    type: WarehouseObjectType;
    x: number;
    y: number;
    width: number;
    height: number;
};

const OBJECT_SIZES: Record<
    WarehouseObjectType,
    {
        width: number;
        height: number;
    }
> = {
    rack: {
        width: 180,
        height: 90,
    },

    shelf: {
        width: 160,
        height: 70,
    },

    container: {
        width: 110,
        height: 90,
    },

    bench: {
        width: 160,
        height: 55,
    },
};

export default function WarehousePage() {
    const canvasRef =
        useRef<HTMLCanvasElement | null>(null);

    const [isFullscreen, setIsFullscreen] =
        useState(false);

    const [zoom, setZoom] =
        useState(1);

    const [offsetX, setOffsetX] =
        useState(0);

    const [offsetY, setOffsetY] =
        useState(0);

    const [isSpacePressed, setIsSpacePressed] =
        useState(false);

    const [isDraggingCanvas, setIsDraggingCanvas] =
        useState(false);

    const [activeTool, setActiveTool] =
        useState<WarehouseTool>("select");

    const [warehouseObjects, setWarehouseObjects] =
        useState<WarehouseObject[]>([]);

    const [selectedObjectId, setSelectedObjectId] =
        useState<string | null>(null);

    const [draggingObjectId, setDraggingObjectId] =
        useState<string | null>(null);

    const [isResizing, setIsResizing] =
        useState(false);

    const [hoveredObjectId, setHoveredObjectId] =
        useState<string | null>(null);

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        offsetX: 0,
        offsetY: 0,
    });

    const objectDragRef = useRef({
        mouseX: 0,
        mouseY: 0,
        objectX: 0,
        objectY: 0,
    });

    const resizeRef = useRef({
        mouseX: 0,
        mouseY: 0,
        width: 0,
        height: 0,
    });

    /* ---------------------------------------------------------------------- */
    /* Canvas coordinates                                                     */
    /* ---------------------------------------------------------------------- */

    function getCanvasPosition(
        event: React.MouseEvent<HTMLCanvasElement>,
    ) {
        const rect =
            canvasRef.current?.getBoundingClientRect();

        if (!rect) {
            return {
                x: 0,
                y: 0,
            };
        }

        return {
            x:
                (event.clientX -
                    rect.left -
                    offsetX) /
                zoom,

            y:
                (event.clientY -
                    rect.top -
                    offsetY) /
                zoom,
        };
    }

    /* ---------------------------------------------------------------------- */
    /* Keyboard shortcuts                                                     */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            /*
             * Escape
             * -------------------------------------------------------------- */

            if (
                event.key === "Escape" &&
                isFullscreen
            ) {
                setIsFullscreen(false);
                setIsDraggingCanvas(false);
                setDraggingObjectId(null);
                setIsResizing(false);

                return;
            }

            /*
             * Don't steal shortcuts while typing.
             * -------------------------------------------------------------- */

            const target =
                event.target as HTMLElement | null;

            const isTyping =
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.tagName === "SELECT" ||
                target?.isContentEditable;

            if (isTyping) {
                return;
            }

            /*
             * Space = temporary hand tool
             * -------------------------------------------------------------- */

            if (
                event.code === "Space" &&
                !event.repeat
            ) {
                event.preventDefault();

                setIsSpacePressed(true);

                return;
            }

            /*
             * V = Select
             * -------------------------------------------------------------- */

            if (
                event.key.toLowerCase() === "v"
            ) {
                event.preventDefault();

                setActiveTool("select");

                return;
            }

            /*
             * H = Hand
             * -------------------------------------------------------------- */

            if (
                event.key.toLowerCase() === "h"
            ) {
                event.preventDefault();

                setActiveTool("hand");

                return;
            }

            /*
             * 1 = Rack
             * -------------------------------------------------------------- */

            if (event.key === "1") {
                event.preventDefault();

                setActiveTool("rack");

                return;
            }

            /*
             * 2 = Shelf
             * -------------------------------------------------------------- */

            if (event.key === "2") {
                event.preventDefault();

                setActiveTool("shelf");

                return;
            }

            /*
             * 3 = Container
             * -------------------------------------------------------------- */

            if (event.key === "3") {
                event.preventDefault();

                setActiveTool("container");

                return;
            }

            /*
             * 4 = Bench
             * -------------------------------------------------------------- */

            if (event.key === "4") {
                event.preventDefault();

                setActiveTool("bench");

                return;
            }

            /*
             * Delete selected object
             * -------------------------------------------------------------- */

            if (
                event.key === "Delete" ||
                event.key === "Backspace"
            ) {
                if (!selectedObjectId) {
                    return;
                }

                event.preventDefault();

                setWarehouseObjects(
                    (current) =>
                        current.filter(
                            (object) =>
                                object.id !==
                                selectedObjectId,
                        ),
                );

                setSelectedObjectId(null);
            }
        }

        function handleKeyUp(
            event: KeyboardEvent,
        ) {
            if (event.code === "Space") {
                event.preventDefault();

                setIsSpacePressed(false);
                setIsDraggingCanvas(false);
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        window.addEventListener(
            "keyup",
            handleKeyUp,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            window.removeEventListener(
                "keyup",
                handleKeyUp,
            );
        };
    }, [
        isFullscreen,
        selectedObjectId,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Wheel interaction                                                      */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const canvas =
            canvasRef.current;

        if (!canvas) {
            return;
        }

        function handleWheel(
            event: WheelEvent,
        ) {
            event.preventDefault();

            /*
             * Shift + Scroll
             * Horizontal movement
             */

            if (event.shiftKey) {
                setOffsetX(
                    (current) =>
                        Math.max(
                            -2000,
                            Math.min(
                                2000,
                                current +
                                event.deltaY,
                            ),
                        ),
                );

                return;
            }

            /*
             * Ctrl + Scroll
             * Vertical movement
             */

            if (event.ctrlKey) {
                setOffsetY(
                    (current) =>
                        Math.max(
                            -2000,
                            Math.min(
                                2000,
                                current +
                                event.deltaY,
                            ),
                        ),
                );

                return;
            }

            /*
             * Normal Scroll
             * Zoom
             */

            const zoomSpeed = 0.0015;

            setZoom(
                (current) => {
                    const next =
                        current -
                        event.deltaY *
                        zoomSpeed;

                    return Math.max(
                        0.25,
                        Math.min(
                            3,
                            next,
                        ),
                    );
                },
            );
        }

        canvas.addEventListener(
            "wheel",
            handleWheel,
            {
                passive: false,
            },
        );

        return () => {
            canvas.removeEventListener(
                "wheel",
                handleWheel,
            );
        };
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Canvas mouse down                                                      */
    /* ---------------------------------------------------------------------- */

    function handleMouseDown(
        event: React.MouseEvent<HTMLCanvasElement>,
    ) {
        /*
         * Space + mouse = pan canvas
         */

        if (isSpacePressed) {
            event.preventDefault();

            dragStartRef.current = {
                mouseX: event.clientX,
                mouseY: event.clientY,
                offsetX,
                offsetY,
            };

            setIsDraggingCanvas(true);

            return;
        }

        /*
         * Hand tool = pan canvas
         */

        if (activeTool === "hand") {
            event.preventDefault();

            dragStartRef.current = {
                mouseX: event.clientX,
                mouseY: event.clientY,
                offsetX,
                offsetY,
            };

            setIsDraggingCanvas(true);

            return;
        }

        /*
         * Select tool on empty canvas
         */

        if (activeTool === "select") {
            setSelectedObjectId(null);

            return;
        }

        /*
         * Object creation
         */

        const position =
            getCanvasPosition(event);

        const size =
            OBJECT_SIZES[
            activeTool as WarehouseObjectType
            ];

        if (!size) {
            return;
        }

        const newObject: WarehouseObject = {
            id: crypto.randomUUID(),

            type:
                activeTool as WarehouseObjectType,

            x:
                position.x -
                size.width / 2,

            y:
                position.y -
                size.height / 2,

            width:
                size.width,

            height:
                size.height,
        };

        setWarehouseObjects(
            (current) => [
                ...current,
                newObject,
            ],
        );

        setSelectedObjectId(
            newObject.id,
        );

        /*
         * Automatically return to select mode
         * after placing an object.
         */

        setActiveTool("select");
    }

    /* ---------------------------------------------------------------------- */
    /* Canvas movement                                                        */
    /* ---------------------------------------------------------------------- */

    function handleCanvasMouseMove(
        event: React.MouseEvent<HTMLCanvasElement>,
    ) {
        if (
            !isDraggingCanvas
        ) {
            return;
        }

        const deltaX =
            event.clientX -
            dragStartRef.current.mouseX;

        const deltaY =
            event.clientY -
            dragStartRef.current.mouseY;

        const nextX =
            dragStartRef.current.offsetX +
            deltaX;

        const nextY =
            dragStartRef.current.offsetY +
            deltaY;

        setOffsetX(
            Math.max(
                -2000,
                Math.min(
                    2000,
                    nextX,
                ),
            ),
        );

        setOffsetY(
            Math.max(
                -2000,
                Math.min(
                    2000,
                    nextY,
                ),
            ),
        );
    }

    function stopCanvasDragging() {
        setIsDraggingCanvas(false);
    }

    /* ---------------------------------------------------------------------- */
    /* Object dragging                                                        */
    /* ---------------------------------------------------------------------- */

    function handleObjectMouseDown(
        event: React.MouseEvent<HTMLDivElement>,
        object: WarehouseObject,
    ) {
        event.stopPropagation();

        if (
            activeTool !== "select" ||
            isSpacePressed
        ) {
            return;
        }

        setSelectedObjectId(
            object.id,
        );

        objectDragRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            objectX: object.x,
            objectY: object.y,
        };

        setDraggingObjectId(
            object.id,
        );
    }

    function handleObjectMouseMove(
        event: React.MouseEvent<HTMLDivElement>,
    ) {
        if (!draggingObjectId) {
            return;
        }

        event.stopPropagation();

        const deltaX =
            (event.clientX -
                objectDragRef.current.mouseX) /
            zoom;

        const deltaY =
            (event.clientY -
                objectDragRef.current.mouseY) /
            zoom;

        setWarehouseObjects(
            (current) =>
                current.map(
                    (object) =>
                        object.id ===
                            draggingObjectId
                            ? {
                                ...object,
                                x:
                                    objectDragRef
                                        .current
                                        .objectX +
                                    deltaX,

                                y:
                                    objectDragRef
                                        .current
                                        .objectY +
                                    deltaY,
                            }
                            : object,
                ),
        );
    }

    function stopObjectDragging() {
        setDraggingObjectId(null);
    }

    /* ---------------------------------------------------------------------- */
    /* Resize                                                                 */
    /* ---------------------------------------------------------------------- */

    function handleResizeStart(
        event: React.MouseEvent<HTMLDivElement>,
        object: WarehouseObject,
    ) {
        event.stopPropagation();

        setSelectedObjectId(
            object.id,
        );

        setIsResizing(true);

        resizeRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            width: object.width,
            height: object.height,
        };
    }

    function handleResizeMove(
        event: React.MouseEvent<HTMLDivElement>,
        object: WarehouseObject,
    ) {
        if (!isResizing) {
            return;
        }

        event.stopPropagation();

        const deltaX =
            (event.clientX -
                resizeRef.current.mouseX) /
            zoom;

        const deltaY =
            (event.clientY -
                resizeRef.current.mouseY) /
            zoom;

        setWarehouseObjects(
            (current) =>
                current.map(
                    (currentObject) =>
                        currentObject.id ===
                            object.id
                            ? {
                                ...currentObject,

                                width:
                                    Math.max(
                                        50,
                                        resizeRef
                                            .current
                                            .width +
                                        deltaX,
                                    ),

                                height:
                                    Math.max(
                                        35,
                                        resizeRef
                                            .current
                                            .height +
                                        deltaY,
                                    ),
                            }
                            : currentObject,
                ),
        );
    }

    function stopResize() {
        setIsResizing(false);
    }

    /* ---------------------------------------------------------------------- */
    /* Render warehouse object                                                */
    /* ---------------------------------------------------------------------- */

    function renderWarehouseObject(
        object: WarehouseObject,
    ) {
        if (object.type === "rack") {
            return (
                <div className="relative h-full w-full">
                    <div className="absolute inset-x-2 top-2 h-2 rounded-sm bg-slate-400 shadow-sm" />

                    <div className="absolute inset-x-2 top-1/2 h-2 -translate-y-1/2 rounded-sm bg-slate-400 shadow-sm" />

                    <div className="absolute inset-x-2 bottom-2 h-2 rounded-sm bg-slate-400 shadow-sm" />

                    <div className="absolute bottom-0 left-2 top-0 w-2 rounded-sm bg-slate-500" />

                    <div className="absolute bottom-0 right-2 top-0 w-2 rounded-sm bg-slate-500" />

                    <div className="absolute inset-x-5 top-3 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Rack</span>
                        <span>R1</span>
                    </div>

                    <div className="absolute bottom-3 left-5 right-5 flex justify-between">
                        <span className="h-1.5 w-5 rounded-full bg-slate-400" />
                        <span className="h-1.5 w-5 rounded-full bg-slate-400" />
                    </div>
                </div>
            );
        }

        if (object.type === "shelf") {
            return (
                <div className="relative h-full w-full overflow-hidden rounded-md">
                    <div className="absolute inset-x-2 top-2 h-1.5 rounded bg-amber-700/70" />

                    <div className="absolute inset-x-2 top-[33%] h-1.5 rounded bg-amber-700/70" />

                    <div className="absolute inset-x-2 top-[66%] h-1.5 rounded bg-amber-700/70" />

                    <div className="absolute inset-x-2 bottom-2 h-1.5 rounded bg-amber-700/70" />

                    <div className="absolute bottom-0 left-2 top-0 w-1.5 rounded bg-amber-800/70" />

                    <div className="absolute bottom-0 right-2 top-0 w-1.5 rounded bg-amber-800/70" />

                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Shelf
                    </div>
                </div>
            );
        }

        if (object.type === "container") {
            return (
                <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-slate-500/60 bg-slate-100 shadow-inner dark:bg-slate-900">
                    <div className="absolute inset-x-3 top-3 h-2 rounded-full border border-slate-500/50 bg-slate-300 dark:bg-slate-700" />

                    <div className="absolute bottom-0 left-0 right-0 h-[58%] bg-blue-500/15" />

                    <div className="absolute bottom-3 left-3 right-3 h-1 rounded-full bg-slate-400/60" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Container
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative h-full w-full">
                <div className="absolute inset-x-2 top-1/4 h-2/4 rounded-md border bg-amber-100 shadow-sm dark:bg-amber-950/40" />

                <div className="absolute bottom-1 left-5 h-3 w-3 rounded-sm bg-slate-500" />

                <div className="absolute bottom-1 right-5 h-3 w-3 rounded-sm bg-slate-500" />

                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Bench
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <main
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-background"
                    : "relative h-[calc(100vh-8rem)] min-h-[600px] overflow-hidden rounded-xl border bg-background"
            }
        >
            {/* Fullscreen button */}

            <div className="absolute right-4 top-4 z-40">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        setIsFullscreen(
                            (current) =>
                                !current,
                        )
                    }
                    title={
                        isFullscreen
                            ? "Exit fullscreen"
                            : "Enter fullscreen"
                    }
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                    ) : (
                        <Maximize2 className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Toolbar */}

            <WarehouseToolbox
                activeTool={activeTool}
                onToolChange={setActiveTool}
                zoom={zoom}
                onZoomIn={() =>
                    setZoom(
                        (current) =>
                            Math.min(
                                3,
                                current + 0.1,
                            ),
                    )
                }
                onZoomOut={() =>
                    setZoom(
                        (current) =>
                            Math.max(
                                0.25,
                                current - 0.1,
                            ),
                    )
                }
                onResetView={() => {
                    setZoom(1);
                    setOffsetX(0);
                    setOffsetY(0);
                }}
                onExpand={() =>
                    setIsFullscreen(true)
                }
            />

            {/* Canvas */}

            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full"
                style={{
                    cursor:
                        isSpacePressed ||
                            activeTool === "hand"
                            ? isDraggingCanvas
                                ? "grabbing"
                                : "grab"
                            : activeTool === "select"
                                ? "default"
                                : "crosshair",
                }}
                onMouseDown={
                    handleMouseDown
                }
                onMouseMove={
                    handleCanvasMouseMove
                }
                onMouseUp={
                    stopCanvasDragging
                }
                onMouseLeave={
                    stopCanvasDragging
                }
            />

            {/* Canvas background */}

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, hsl(var(--muted-foreground) / 0.14) 1px, transparent 1px)",
                    backgroundSize:
                        `${24 * zoom}px ${24 * zoom}px`,
                    backgroundPosition:
                        `${offsetX}px ${offsetY}px`,
                }}
            />

            {/* Warehouse world */}

            <div
                className="absolute inset-0"
                style={{
                    transform: `
                        translate(${offsetX}px, ${offsetY}px)
                        scale(${zoom})
                    `,
                    transformOrigin:
                        "0 0",
                    pointerEvents:
                        "none",
                }}
            >
                {/* Existing test rectangle */}

                <div
                    className="pointer-events-none absolute flex items-center justify-center"
                    style={{
                        left:
                            "50%",
                        top:
                            "50%",
                        transform:
                            "translate(-50%, -50%)",
                    }}
                >
                    <div className="h-32 w-48 rounded-lg border-2 border-border bg-muted/50" />
                </div>

                {/* Objects */}

                {warehouseObjects.map(
                    (object) => {
                        const isSelected =
                            selectedObjectId ===
                            object.id;

                        const isHovered =
                            hoveredObjectId ===
                            object.id;

                        const isBeingDragged =
                            draggingObjectId ===
                            object.id;

                        return (
                            <div
                                key={
                                    object.id
                                }
                                className={`
                                    pointer-events-auto
                                    absolute
                                    rounded-lg
                                    border
                                    bg-background/95
                                    shadow-sm
                                    transition-[box-shadow,transform]
                                    duration-200
                                    select-none
                                    ${isSelected
                                        ? "z-30 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl"
                                        : "z-10"
                                    }
                                    ${isHovered
                                        ? "shadow-lg"
                                        : ""
                                    }
                                    ${isBeingDragged
                                        ? "cursor-grabbing"
                                        : activeTool ===
                                            "select"
                                            ? "cursor-grab"
                                            : "cursor-default"
                                    }
                                `}
                                style={{
                                    left:
                                        object.x,
                                    top:
                                        object.y,
                                    width:
                                        object.width,
                                    height:
                                        object.height,

                                    transform:
                                        isHovered &&
                                            !isBeingDragged
                                            ? "translateY(-2px)"
                                            : "translateY(0)",

                                    animation:
                                        "warehouseObjectEnter 240ms ease-out",
                                }}
                                onMouseEnter={() =>
                                    setHoveredObjectId(
                                        object.id,
                                    )
                                }
                                onMouseLeave={() =>
                                    setHoveredObjectId(
                                        null,
                                    )
                                }
                                onMouseDown={(
                                    event,
                                ) =>
                                    handleObjectMouseDown(
                                        event,
                                        object,
                                    )
                                }
                                onMouseMove={(
                                    event,
                                ) =>
                                    handleObjectMouseMove(
                                        event,
                                    )
                                }
                                onMouseUp={
                                    stopObjectDragging
                                }
                            >
                                {renderWarehouseObject(
                                    object,
                                )}

                                {/* Selection label */}

                                {isSelected && (
                                    <>
                                        <div className="absolute -top-7 left-0 rounded-md border bg-background px-2 py-1 text-[10px] font-medium shadow-sm">
                                            {object.type
                                                .charAt(
                                                    0,
                                                )
                                                .toUpperCase() +
                                                object.type.slice(
                                                    1,
                                                )}
                                        </div>

                                        {/* Resize handle */}

                                        <div
                                            className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-se-resize rounded-sm border-2 border-background bg-primary shadow"
                                            onMouseDown={(
                                                event,
                                            ) =>
                                                handleResizeStart(
                                                    event,
                                                    object,
                                                )
                                            }
                                            onMouseMove={(
                                                event,
                                            ) =>
                                                handleResizeMove(
                                                    event,
                                                    object,
                                                )
                                            }
                                            onMouseUp={
                                                stopResize
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        );
                    },
                )}
            </div>

            {/* Resize movement layer */}

            {isResizing && (
                <div
                    className="absolute inset-0 z-50 cursor-se-resize"
                    onMouseMove={(event) => {
                        if (
                            !selectedObjectId
                        ) {
                            return;
                        }

                        const object =
                            warehouseObjects.find(
                                (item) =>
                                    item.id ===
                                    selectedObjectId,
                            );

                        if (
                            object
                        ) {
                            handleResizeMove(
                                event,
                                object,
                            );
                        }
                    }}
                    onMouseUp={
                        stopResize
                    }
                />
            )}

            <style jsx global>{`
                @keyframes warehouseObjectEnter {
                    from {
                        opacity: 0;
                        transform: translateY(6px)
                            scale(0.96);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0)
                            scale(1);
                    }
                }
            `}</style>
        </main>
    );
}