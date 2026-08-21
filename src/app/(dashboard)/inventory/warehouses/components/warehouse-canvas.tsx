"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    WarehouseElement,
    WarehouseElementType,
} from "./warehouse-types";

import {
    WAREHOUSE_TOOL_MAP,
    createWarehouseElement,
} from "./warehouse-types";

import type { WarehouseTool } from "./warehouse-toolbar";

type WarehouseCanvasProps = {
    activeTool: WarehouseTool;
    zoom: number;
    offsetX: number;
    offsetY: number;
    isSpacePressed: boolean;

    onOffsetChange: (
        x: number,
        y: number,
    ) => void;
};

type ResizeHandle =
    | "nw"
    | "n"
    | "ne"
    | "e"
    | "se"
    | "s"
    | "sw"
    | "w";

type Interaction =
    | {
        type: "move";
        id: string;
        startMouseX: number;
        startMouseY: number;
        startX: number;
        startY: number;
    }
    | {
        type: "resize";
        id: string;
        handle: ResizeHandle;
        startMouseX: number;
        startMouseY: number;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    }
    | null;

/* =============================================================================
 * KEYBOARD SHORTCUTS
 * ============================================================================= */

const SHORTCUT_TO_ELEMENT: Record<
    string,
    WarehouseElementType | undefined
> = {
    "1": "rack-single",
    "2": "rack-double",
    "3": "rack-heavy",
    "4": "shelf",
    "5": "pallet-area",
    "6": "cold-storage",
};

/* =============================================================================
 * HELPERS
 * ============================================================================= */

function getElementName(
    element: WarehouseElement,
): string {
    const properties =
        element.properties ?? {};

    return (
        element.elementName ||
        element.label ||
        String(
            properties.elementName ??
            "",
        ) ||
        WAREHOUSE_TOOL_MAP[
            element.type
        ]?.label ||
        element.type
    );
}

function getAssignment(
    element: WarehouseElement,
): string {
    const properties =
        element.properties ?? {};

    return String(
        properties.assignment ??
        properties.assignedItem ??
        "",
    );
}

function getSku(
    element: WarehouseElement,
): string {
    const properties =
        element.properties ?? {};

    return String(
        properties.sku ?? "",
    );
}

function getNextElementName(
    type: WarehouseElementType,
    elements: WarehouseElement[],
): string {
    const definition =
        WAREHOUSE_TOOL_MAP[type];

    const baseName =
        definition?.label ??
        type;

    const normalizedBase =
        baseName
            .replace(/\s+/g, "-")
            .toLowerCase();

    const matchingNumbers =
        elements
            .filter(
                (element) =>
                    element.type === type,
            )
            .map((element) => {
                const name =
                    getElementName(
                        element,
                    );

                const match =
                    name.match(
                        /-(\d+)$/,
                    );

                return match
                    ? Number(match[1])
                    : 0;
            });

    const nextNumber =
        Math.max(
            0,
            ...matchingNumbers,
        ) + 1;

    return `${normalizedBase}-${String(
        nextNumber,
    ).padStart(3, "0")}`;
}

/* =============================================================================
 * CANVAS
 * ============================================================================= */

export default function WarehouseCanvas({
    activeTool,
    zoom,
    offsetX,
    offsetY,
    isSpacePressed,
    onOffsetChange,
}: WarehouseCanvasProps) {
    const canvasRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const [elements, setElements] =
        useState<WarehouseElement[]>(
            [],
        );

    const [selectedId, setSelectedId] =
        useState<string | null>(null);

    const [interaction, setInteraction] =
        useState<Interaction>(null);

    const [history, setHistory] =
        useState<WarehouseElement[][]>(
            [],
        );

    const [future, setFuture] =
        useState<WarehouseElement[][]>(
            [],
        );

    const panStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        offsetX: 0,
        offsetY: 0,
    });

    const isPanning =
        useRef(false);

    const [isDraggingCanvas, setIsDraggingCanvas] =
        useState(false);

    /* =========================================================================
     * HISTORY
     * ========================================================================= */

    const commit = useCallback(
        (
            nextElements: WarehouseElement[],
        ) => {
            setHistory(
                (current) => [
                    ...current,
                    elements,
                ],
            );

            setFuture([]);

            setElements(
                nextElements,
            );
        },
        [elements],
    );

    const undo = useCallback(() => {
        if (history.length === 0) {
            return;
        }

        const previous =
            history[
            history.length - 1
            ];

        setHistory(
            (current) =>
                current.slice(0, -1),
        );

        setFuture(
            (current) => [
                ...current,
                elements,
            ],
        );

        setElements(previous);

        setSelectedId(null);
    }, [
        elements,
        history,
    ]);

    const redo = useCallback(() => {
        if (future.length === 0) {
            return;
        }

        const next =
            future[
            future.length - 1
            ];

        setFuture(
            (current) =>
                current.slice(0, -1),
        );

        setHistory(
            (current) => [
                ...current,
                elements,
            ],
        );

        setElements(next);
    }, [
        elements,
        future,
    ]);

    /* =========================================================================
     * KEYBOARD SHORTCUTS
     * ========================================================================= */

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            const target =
                event.target as HTMLElement | null;

            const isTyping =
                target?.tagName ===
                "INPUT" ||
                target?.tagName ===
                "TEXTAREA" ||
                target?.isContentEditable;

            /*
             * Undo / redo should still work while the user is not typing.
             */
            if (
                !isTyping &&
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "z"
            ) {
                event.preventDefault();

                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }

                return;
            }

            if (
                !isTyping &&
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "y"
            ) {
                event.preventDefault();

                redo();

                return;
            }

            /*
             * Never hijack keyboard input while editing
             * a property.
             */
            if (isTyping) {
                return;
            }

            /*
             * Delete selected element.
             */
            if (
                event.key === "Delete" ||
                event.key === "Backspace"
            ) {
                if (!selectedId) {
                    return;
                }

                event.preventDefault();

                commit(
                    elements.filter(
                        (element) =>
                            element.id !==
                            selectedId,
                    ),
                );

                setSelectedId(null);

                return;
            }

            /*
             * V = Select
             */
            if (
                event.key.toLowerCase() ===
                "v"
            ) {
                event.preventDefault();

                window.dispatchEvent(
                    new CustomEvent(
                        "warehouse-tool-change",
                        {
                            detail: "select",
                        },
                    ),
                );

                return;
            }

            /*
             * H = Hand
             */
            if (
                event.key.toLowerCase() ===
                "h"
            ) {
                event.preventDefault();

                window.dispatchEvent(
                    new CustomEvent(
                        "warehouse-tool-change",
                        {
                            detail: "hand",
                        },
                    ),
                );

                return;
            }

            /*
             * Number shortcuts.
             */
            const elementType =
                SHORTCUT_TO_ELEMENT[
                event.key
                ];

            if (elementType) {
                event.preventDefault();

                window.dispatchEvent(
                    new CustomEvent(
                        "warehouse-tool-change",
                        {
                            detail:
                                elementType,
                        },
                    ),
                );

                return;
            }

            /*
             * Zoom.
             */
            if (
                event.key === "+" ||
                event.key === "="
            ) {
                event.preventDefault();

                window.dispatchEvent(
                    new CustomEvent(
                        "warehouse-zoom",
                        {
                            detail: "in",
                        },
                    ),
                );

                return;
            }

            if (
                event.key === "-" ||
                event.key === "_"
            ) {
                event.preventDefault();

                window.dispatchEvent(
                    new CustomEvent(
                        "warehouse-zoom",
                        {
                            detail: "out",
                        },
                    ),
                );
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        commit,
        elements,
        redo,
        selectedId,
        undo,
    ]);

    /* =========================================================================
     * CANVAS COORDINATES
     * ========================================================================= */

    function getCanvasPosition(
        event: React.MouseEvent,
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

    /* =========================================================================
     * PAN
     * ========================================================================= */

    function startPan(
        event: React.MouseEvent,
    ) {
        panStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            offsetX,
            offsetY,
        };

        isPanning.current = true;

        setIsDraggingCanvas(true);
    }

    function movePan(
        event: React.MouseEvent,
    ) {
        if (!isPanning.current) {
            return;
        }

        const deltaX =
            event.clientX -
            panStartRef.current.mouseX;

        const deltaY =
            event.clientY -
            panStartRef.current.mouseY;

        onOffsetChange(
            panStartRef.current.offsetX +
            deltaX,
            panStartRef.current.offsetY +
            deltaY,
        );
    }

    function stopPan() {
        isPanning.current = false;

        setIsDraggingCanvas(false);
    }

    /* =========================================================================
     * MOUSE DOWN
     * ========================================================================= */

    function handleMouseDown(
        event: React.MouseEvent,
    ) {
        if (
            isSpacePressed ||
            activeTool === "hand"
        ) {
            startPan(event);

            return;
        }

        const position =
            getCanvasPosition(event);

        /*
         * SELECT MODE
         */
        if (activeTool === "select") {
            const clickedElement =
                [...elements]
                    .reverse()
                    .find(
                        (element) =>
                            position.x >=
                            element.x &&
                            position.x <=
                            element.x +
                            element.width &&
                            position.y >=
                            element.y &&
                            position.y <=
                            element.y +
                            element.height,
                    );

            if (!clickedElement) {
                setSelectedId(null);

                return;
            }

            setSelectedId(
                clickedElement.id,
            );

            setInteraction({
                type: "move",
                id: clickedElement.id,
                startMouseX:
                    event.clientX,
                startMouseY:
                    event.clientY,
                startX:
                    clickedElement.x,
                startY:
                    clickedElement.y,
            });

            return;
        }

        /*
         * PLACE NEW OBJECT
         */
        const definition =
            WAREHOUSE_TOOL_MAP[
            activeTool
            ];

        if (!definition) {
            return;
        }

        const newElement =
            createWarehouseElement(
                activeTool,
                position.x,
                position.y,
            );

        /*
         * Automatically assign a readable
         * default name.
         */
        const defaultName =
            getNextElementName(
                activeTool,
                elements,
            );

        const elementWithName = {
            ...newElement,

            elementName:
                defaultName,

            label:
                defaultName,

            properties: {
                ...(newElement.properties ??
                    {}),
                elementName:
                    defaultName,
            },
        };

        commit([
            ...elements,
            newElement,
        ]);

        setSelectedId(newElement.id);

        /*
         * After placing one object, automatically switch
         * back to the Select tool so the user can move/edit
         * the newly created object instead of continuously
         * placing more objects.
         */
        window.dispatchEvent(
            new CustomEvent("warehouse-tool-change", {
                detail: "select",
            }),
        );
    }

    /* =========================================================================
     * RESIZE
     * ========================================================================= */

    function startResize(
        event: React.MouseEvent,
        element: WarehouseElement,
        handle: ResizeHandle,
    ) {
        event.stopPropagation();

        setSelectedId(
            element.id,
        );

        setInteraction({
            type: "resize",
            id: element.id,
            handle,
            startMouseX:
                event.clientX,
            startMouseY:
                event.clientY,
            startX: element.x,
            startY: element.y,
            startWidth:
                element.width,
            startHeight:
                element.height,
        });
    }

    /* =========================================================================
     * MOUSE MOVE
     * ========================================================================= */

    function handleMouseMove(
        event: React.MouseEvent,
    ) {
        if (isPanning.current) {
            movePan(event);

            return;
        }

        if (!interaction) {
            return;
        }

        const deltaX =
            (event.clientX -
                interaction.startMouseX) /
            zoom;

        const deltaY =
            (event.clientY -
                interaction.startMouseY) /
            zoom;

        setElements(
            (current) =>
                current.map(
                    (element) => {
                        if (
                            element.id !==
                            interaction.id
                        ) {
                            return element;
                        }

                        /*
                         * MOVE
                         */
                        if (
                            interaction.type ===
                            "move"
                        ) {
                            return {
                                ...element,

                                x:
                                    interaction.startX +
                                    deltaX,

                                y:
                                    interaction.startY +
                                    deltaY,
                            };
                        }

                        /*
                         * RESIZE
                         */
                        const definition =
                            WAREHOUSE_TOOL_MAP[
                            element.type
                            ];

                        let x =
                            interaction.startX;

                        let y =
                            interaction.startY;

                        let width =
                            interaction.startWidth;

                        let height =
                            interaction.startHeight;

                        const minWidth =
                            definition?.minWidth ??
                            20;

                        const minHeight =
                            definition?.minHeight ??
                            20;

                        if (
                            interaction.handle.includes(
                                "e",
                            )
                        ) {
                            width =
                                Math.max(
                                    minWidth,
                                    interaction.startWidth +
                                    deltaX,
                                );
                        }

                        if (
                            interaction.handle.includes(
                                "s",
                            )
                        ) {
                            height =
                                Math.max(
                                    minHeight,
                                    interaction.startHeight +
                                    deltaY,
                                );
                        }

                        if (
                            interaction.handle.includes(
                                "w",
                            )
                        ) {
                            width =
                                Math.max(
                                    minWidth,
                                    interaction.startWidth -
                                    deltaX,
                                );

                            x =
                                interaction.startX +
                                interaction.startWidth -
                                width;
                        }

                        if (
                            interaction.handle.includes(
                                "n",
                            )
                        ) {
                            height =
                                Math.max(
                                    minHeight,
                                    interaction.startHeight -
                                    deltaY,
                                );

                            y =
                                interaction.startY +
                                interaction.startHeight -
                                height;
                        }

                        return {
                            ...element,
                            x,
                            y,
                            width,
                            height,
                        };
                    },
                ),
        );
    }

    /* =========================================================================
     * MOUSE UP
     * ========================================================================= */

    function handleMouseUp() {
        if (isPanning.current) {
            stopPan();

            return;
        }

        if (!interaction) {
            return;
        }

        /*
         * Save the state from before the
         * interaction into history.
         */
        setHistory(
            (current) => [
                ...current,
                elements,
            ],
        );

        setFuture([]);

        setInteraction(null);
    }

    /* =========================================================================
     * PROPERTY UPDATE
     * ========================================================================= */

    function updateElement(
        id: string,
        patch: Partial<WarehouseElement>,
    ) {
        setElements(
            (current) =>
                current.map(
                    (element) => {
                        if (
                            element.id !==
                            id
                        ) {
                            return element;
                        }

                        return {
                            ...element,
                            ...patch,
                        };
                    },
                ),
        );
    }

    function updateProperty(
        id: string,
        key: string,
        value: unknown,
    ) {
        setElements(
            (current) =>
                current.map(
                    (element) => {
                        if (
                            element.id !==
                            id
                        ) {
                            return element;
                        }

                        return {
                            ...element,

                            properties: {
                                ...(element.properties ??
                                    {}),
                                [key]: value,
                            },
                        };
                    },
                ),
        );
    }

    function deleteSelected() {
        if (!selectedId) {
            return;
        }

        commit(
            elements.filter(
                (element) =>
                    element.id !==
                    selectedId,
            ),
        );

        setSelectedId(null);
    }

    const selectedElement =
        elements.find(
            (element) =>
                element.id ===
                selectedId,
        );

    /* =========================================================================
     * RENDER
     * ========================================================================= */

    return (
        <div
            ref={canvasRef}
            className={`relative h-full w-full overflow-hidden bg-[#f8fafc] ${isDraggingCanvas
                ? "cursor-grabbing"
                : isSpacePressed ||
                    activeTool ===
                    "hand"
                    ? "cursor-grab"
                    : activeTool ===
                        "select"
                        ? "cursor-default"
                        : "cursor-crosshair"
                }`}
            onMouseDown={
                handleMouseDown
            }
            onMouseMove={
                handleMouseMove
            }
            onMouseUp={
                handleMouseUp
            }
            onMouseLeave={
                handleMouseUp
            }
        >
            {/* =================================================================
             * GRID
             * ================================================================= */}

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(
                            to right,
                            rgba(148,163,184,0.16) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(148,163,184,0.16) 1px,
                            transparent 1px
                        )
                    `,

                    backgroundSize: `${24 * zoom
                        }px ${24 * zoom
                        }px`,

                    backgroundPosition: `${offsetX}px ${offsetY}px`,
                }}
            />

            {/* =================================================================
             * WAREHOUSE OBJECTS
             * ================================================================= */}

            <div
                className="pointer-events-none absolute left-0 top-0"
                style={{
                    transform: `
                        translate(
                            ${offsetX}px,
                            ${offsetY}px
                        )
                        scale(${zoom})
                    `,

                    transformOrigin:
                        "0 0",
                }}
            >
                {elements.map(
                    (element) => (
                        <WarehouseObject
                            key={
                                element.id
                            }
                            element={
                                element
                            }
                            selected={
                                selectedId ===
                                element.id
                            }
                            onSelect={() =>
                                setSelectedId(
                                    element.id,
                                )
                            }
                            onResize={
                                startResize
                            }
                        />
                    ),
                )}
            </div>

            {/* =================================================================
             * PROPERTY PANEL
             * ================================================================= */}

            {selectedElement && (
                <div
                    className="absolute right-4 top-20 z-30"
                    onMouseDown={(event) => {
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <ElementProperties
                        element={
                            selectedElement
                        }
                        onChange={
                            updateElement
                        }
                        onPropertyChange={
                            updateProperty
                        }
                        onDelete={
                            deleteSelected
                        }
                    />
                </div>
            )}

            {/* =================================================================
             * EMPTY STATE
             * ================================================================= */}

            {elements.length ===
                0 && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-xl border bg-background/90 px-6 py-4 text-center shadow-sm">
                            <p className="text-sm font-medium">
                                Start
                                designing
                                your
                                warehouse
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Choose
                                an
                                object
                                from
                                the
                                toolbar
                                and
                                click
                                anywhere
                                on
                                the
                                canvas.
                            </p>
                        </div>
                    </div>
                )}
        </div>
    );
}

/* =============================================================================
 * WAREHOUSE OBJECT
 * ============================================================================= */

function WarehouseObject({
    element,
    selected,
    onSelect,
    onResize,
}: {
    element: WarehouseElement;

    selected: boolean;

    onSelect: () => void;

    onResize: (
        event: React.MouseEvent,
        element: WarehouseElement,
        handle: ResizeHandle,
    ) => void;
}) {
    const definition =
        WAREHOUSE_TOOL_MAP[
        element.type
        ];

    const assignment =
        getAssignment(element);

    const name =
        getElementName(element);

    return (
        <div
            className="pointer-events-auto absolute"
            style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,

                transform: `rotate(${element.rotation}deg)`,

                transformOrigin:
                    "center center",
            }}
            onMouseDown={(event) => {
                event.stopPropagation();

                onSelect();
            }}
        >
            <div
                className={`relative h-full w-full overflow-hidden rounded-md border-2 bg-white shadow-sm transition-shadow ${selected
                    ? "border-blue-600 shadow-lg ring-2 ring-blue-500/20"
                    : "border-slate-400"
                    }`}
            >
                <ObjectVisual
                    type={element.type}
                />

                {/* =========================================================
                 * LABEL
                 * ========================================================= */}

                <div className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1 backdrop-blur-sm">
                    <div className="truncate text-[10px] font-semibold text-slate-700">
                        {name ||
                            definition?.label ||
                            element.type}
                    </div>

                    {assignment ? (
                        <div className="truncate text-[9px] text-slate-500">
                            {assignment}
                        </div>
                    ) : (
                        <div className="truncate text-[9px] text-slate-400">
                            Click to assign
                            item / work
                        </div>
                    )}
                </div>

                {/* =========================================================
                 * RESIZE HANDLES
                 * ========================================================= */}

                {selected && (
                    <>
                        {(
                            [
                                "nw",
                                "n",
                                "ne",
                                "e",
                                "se",
                                "s",
                                "sw",
                                "w",
                            ] as ResizeHandle[]
                        ).map(
                            (position) => (
                                <ResizeHandle
                                    key={
                                        position
                                    }
                                    position={
                                        position
                                    }
                                    onMouseDown={
                                        onResize
                                    }
                                    element={
                                        element
                                    }
                                />
                            ),
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/* =============================================================================
 * RESIZE HANDLE
 * ============================================================================= */

function ResizeHandle({
    position,
    onMouseDown,
    element,
}: {
    position: ResizeHandle;

    onMouseDown: (
        event: React.MouseEvent,
        element: WarehouseElement,
        handle: ResizeHandle,
    ) => void;

    element: WarehouseElement;
}) {
    const positionClasses: Record<
        ResizeHandle,
        string
    > = {
        nw: "-left-1.5 -top-1.5 cursor-nwse-resize",
        n: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",
        ne: "-right-1.5 -top-1.5 cursor-nesw-resize",
        e: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
        se: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
        s: "bottom-[-6px] left-1/2 -translate-x-1/2 cursor-ns-resize",
        sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
        w: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
    };

    return (
        <div
            className={`absolute z-20 h-3 w-3 rounded-sm border border-blue-600 bg-white ${positionClasses[position]}`}
            onMouseDown={(event) =>
                onMouseDown(
                    event,
                    element,
                    position,
                )
            }
        />
    );
}

/* =============================================================================
 * PROPERTY PANEL
 * ============================================================================= */

function ElementProperties({
    element,
    onChange,
    onPropertyChange,
    onDelete,
}: {
    element: WarehouseElement;

    onChange: (
        id: string,
        patch: Partial<WarehouseElement>,
    ) => void;

    onPropertyChange: (
        id: string,
        key: string,
        value: unknown,
    ) => void;

    onDelete: () => void;
}) {
    const name =
        getElementName(element);

    const assignment =
        getAssignment(element);

    const sku =
        getSku(element);

    return (
        <div className="w-72 rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur-mdj">
            {/* =============================================================
             * HEADER
             * ============================================================= */}

            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                        {name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {element.type}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        onDelete
                    }
                    className="shrink-0 text-xs text-destructive hover:underline"
                >
                    Delete
                </button>
            </div>

            {/* =============================================================
             * NAME
             * ============================================================= */}

            <PropertyInput
                label="Element Name"
                value={name}
                placeholder="e.g. Rack A-01"
                onChange={(value) => {
                    onChange(
                        element.id,
                        {
                            elementName:
                                value,

                            label:
                                value,
                        },
                    );

                    onPropertyChange(
                        element.id,
                        "elementName",
                        value,
                    );
                }}
            />

            {/* =============================================================
             * ASSIGNMENT
             * ============================================================= */}

            <PropertyInput
                label="Assigned Item / Work"
                placeholder="e.g. Screws / Packaging of Drivers"
                value={
                    assignment
                }
                onChange={(value) =>
                    onPropertyChange(
                        element.id,
                        "assignment",
                        value,
                    )
                }
            />

            {/* =============================================================
             * SKU
             * ============================================================= */}

            <PropertyInput
                label="SKU"
                placeholder="e.g. SCR-001"
                value={sku}
                onChange={(value) =>
                    onPropertyChange(
                        element.id,
                        "sku",
                        value,
                    )
                }
            />

            {/* =============================================================
             * LOCATION
             * ============================================================= */}

            <PropertyInput
                label="Location Code"
                placeholder="e.g. A-01"
                value={
                    element.locationCode ??
                    ""
                }
                onChange={(value) =>
                    onChange(
                        element.id,
                        {
                            locationCode:
                                value,
                        },
                    )
                }
            />

            {/* =============================================================
             * POSITION
             * ============================================================= */}

            <div className="grid grid-cols-2 gap-2">
                <NumberInput
                    label="X"
                    value={
                        element.x
                    }
                    onChange={(value) =>
                        onChange(
                            element.id,
                            {
                                x: value,
                            },
                        )
                    }
                />

                <NumberInput
                    label="Y"
                    value={
                        element.y
                    }
                    onChange={(value) =>
                        onChange(
                            element.id,
                            {
                                y: value,
                            },
                        )
                    }
                />
            </div>

            {/* =============================================================
             * DIMENSIONS
             * ============================================================= */}

            <div className="mt-3 grid grid-cols-2 gap-2">
                <NumberInput
                    label="Width"
                    value={
                        element.width
                    }
                    onChange={(value) =>
                        onChange(
                            element.id,
                            {
                                width: Math.max(
                                    1,
                                    value,
                                ),
                            },
                        )
                    }
                />

                <NumberInput
                    label="Height"
                    value={
                        element.height
                    }
                    onChange={(value) =>
                        onChange(
                            element.id,
                            {
                                height: Math.max(
                                    1,
                                    value,
                                ),
                            },
                        )
                    }
                />
            </div>

            {/* =============================================================
             * ROTATION
             * ============================================================= */}

            <div className="mt-3">
                <NumberInput
                    label="Rotation"
                    value={
                        element.rotation
                    }
                    onChange={(value) =>
                        onChange(
                            element.id,
                            {
                                rotation:
                                    value,
                            },
                        )
                    }
                />
            </div>
        </div>
    );
}

/* =============================================================================
 * TEXT INPUT
 * ============================================================================= */

function PropertyInput({
    label,
    value,
    placeholder,
    onChange,
}: {
    label: string;

    value: string;

    placeholder?: string;

    onChange: (
        value: string,
    ) => void;
}) {
    return (
        <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                {label}
            </span>

            <input
                value={value}
                placeholder={
                    placeholder
                }
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none transition focus:ring-2 focus:ring-ring"
            />
        </label>
    );
}

/* =============================================================================
 * NUMBER INPUT
 * ============================================================================= */

function NumberInput({
    label,
    value,
    onChange,
}: {
    label: string;

    value: number;

    onChange: (
        value: number,
    ) => void;
}) {
    return (
        <label>
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                {label}
            </span>

            <input
                type="number"
                value={
                    Number.isFinite(
                        value,
                    )
                        ? Math.round(
                            value,
                        )
                        : 0
                }
                onChange={(event) =>
                    onChange(
                        Number(
                            event.target.value,
                        ),
                    )
                }
                className="h-8 w-full rounded-md border bg-background px-2 text-xs outline-none transition focus:ring-2 focus:ring-ring"
            />
        </label>
    );
}

/* =============================================================================
 * OBJECT VISUALS
 * ============================================================================= */

function ObjectVisual({
    type,
}: {
    type: WarehouseElementType;
}) {
    switch (type) {
        case "rack-single":
            return (
                <div className="absolute inset-3 flex flex-col justify-between border-x-2 border-slate-500">
                    <div className="h-2 bg-blue-500" />
                    <div className="h-2 bg-blue-500" />
                    <div className="h-2 bg-blue-500" />
                </div>
            );

        case "rack-double":
            return (
                <div className="absolute inset-3 flex items-center justify-center gap-2">
                    <div className="h-full flex-1 border-y-2 border-blue-600">
                        <div className="mt-3 h-2 bg-blue-500" />
                        <div className="mt-3 h-2 bg-blue-500" />
                    </div>

                    <div className="h-full w-1 bg-blue-700" />

                    <div className="h-full flex-1 border-y-2 border-blue-600">
                        <div className="mt-3 h-2 bg-blue-500" />
                        <div className="mt-3 h-2 bg-blue-500" />
                    </div>
                </div>
            );

        case "rack-heavy":
            return (
                <div className="absolute inset-3 flex flex-col justify-between">
                    <div className="h-3 rounded bg-indigo-600" />
                    <div className="h-3 rounded bg-indigo-600" />
                    <div className="h-3 rounded bg-indigo-600" />
                    <div className="h-3 rounded bg-indigo-600" />
                </div>
            );

        case "shelf":
            return (
                <div className="absolute inset-3 flex flex-col justify-between">
                    <div className="h-1.5 bg-emerald-600" />
                    <div className="h-1.5 bg-emerald-600" />
                    <div className="h-1.5 bg-emerald-600" />
                    <div className="h-1.5 bg-emerald-600" />
                </div>
            );

        case "pallet-area":
            return (
                <div className="absolute inset-3 grid grid-cols-2 gap-2">
                    {[
                        1,
                        2,
                        3,
                        4,
                    ].map(
                        (item) => (
                            <div
                                key={
                                    item
                                }
                                className="rounded border border-amber-500 bg-amber-100"
                            />
                        ),
                    )}
                </div>
            );

        case "cold-storage":
            return (
                <div className="absolute inset-3 rounded border-2 border-cyan-500 bg-cyan-50">
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-cyan-700">
                        COLD
                    </div>
                </div>
            );

        case "wall":
            return (
                <div className="absolute inset-0 bg-slate-700" />
            );

        case "column":
            return (
                <div className="absolute inset-1 rounded bg-slate-600 shadow-inner" />
            );

        case "door":
            return (
                <div className="absolute inset-3 rounded-b-full border-2 border-slate-500 border-t-0" />
            );

        case "fire-exit":
            return (
                <div className="absolute inset-3 flex items-center justify-center rounded border-2 border-red-500">
                    <span className="text-xs font-bold text-red-600">
                        EXIT
                    </span>
                </div>
            );

        case "aisle":
            return (
                <div className="absolute inset-2 border border-dashed border-slate-400 bg-slate-100/70" />
            );

        case "loading-dock":
        case "loading-area":
            return (
                <div className="absolute inset-3 rounded border-2 border-dashed border-orange-500 bg-orange-50" />
            );

        case "staging-area":
            return (
                <div className="absolute inset-3 rounded border-2 border-dashed border-purple-500 bg-purple-50" />
            );

        case "inspection-zone":
            return (
                <div className="absolute inset-3 rounded border-2 border-dashed border-pink-500 bg-pink-50" />
            );

        case "forklift-zone":
            return (
                <div className="absolute inset-3 rounded border-2 border-dashed border-orange-600 bg-orange-50" />
            );

        case "workstation":
        case "packing-station":
            return (
                <div className="absolute inset-3 rounded border-2 border-green-600 bg-green-50" />
            );

        case "office":
            return (
                <div className="absolute inset-3 rounded border-2 border-sky-600 bg-sky-50" />
            );

        case "container":
            return (
                <div className="absolute inset-3 rounded border-2 border-slate-500 bg-slate-100" />
            );

        case "bench":
            return (
                <div className="absolute inset-4">
                    <div className="h-3 rounded bg-amber-700" />

                    <div className="flex justify-between px-2">
                        <div className="h-8 w-2 bg-amber-700" />
                        <div className="h-8 w-2 bg-amber-700" />
                    </div>
                </div>
            );

        default:
            return null;
    }
}