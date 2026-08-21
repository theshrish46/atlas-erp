"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Maximize2,
    Minimize2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import WarehouseCanvas from "./components/warehouse-canvas";

import WarehouseToolbox, {
    type WarehouseTool,
} from "./components/warehouse-toolbar";

import type {
    WarehouseElement,
    WarehouseElementType,
} from "./components/warehouse-types";

/* =============================================================================

* PAGE
* ============================================================================= */

export default function WarehousePage() {

    /* -------------------------------------------------------------------------
     * Fullscreen
     * ---------------------------------------------------------------------- */

    const [isFullscreen, setIsFullscreen] =
        useState(false);


    /* -------------------------------------------------------------------------
     * Canvas view
     * ---------------------------------------------------------------------- */

    const [zoom, setZoom] =
        useState(1);

    const [offsetX, setOffsetX] =
        useState(0);

    const [offsetY, setOffsetY] =
        useState(0);


    /* -------------------------------------------------------------------------
     * Space / Hand tool
     * ---------------------------------------------------------------------- */

    const [isSpacePressed, setIsSpacePressed] =
        useState(false);


    /* -------------------------------------------------------------------------
     * Active tool
     * ---------------------------------------------------------------------- */

    const [activeTool, setActiveTool] =
        useState<
            WarehouseElementType |
            "select" |
            "hand"
        >("select");


    /* -------------------------------------------------------------------------
     * Warehouse elements
     * ---------------------------------------------------------------------- */

    const [elements, setElements] =
        useState<WarehouseElement[]>([]);


    /* -------------------------------------------------------------------------
     * Selected element
     * ---------------------------------------------------------------------- */

    const [selectedElementId, setSelectedElementId] =
        useState<string | null>(null);


    /* -------------------------------------------------------------------------
     * Selected element
     * ---------------------------------------------------------------------- */

    const selectedElement =
        elements.find(
            (element) =>
                element.id === selectedElementId,
        ) ?? null;


    /* =========================================================================
     * KEYBOARD
     * ========================================================================= */

    useEffect(() => {

        function handleKeyDown(
            event: KeyboardEvent,
        ) {

            /* -------------------------------------------------------------
             * Escape
             * ---------------------------------------------------------- */

            if (
                event.key === "Escape" &&
                isFullscreen
            ) {
                setIsFullscreen(false);
                return;
            }


            /* -------------------------------------------------------------
             * Space = temporary hand tool
             * ---------------------------------------------------------- */

            if (
                event.code === "Space" &&
                !event.repeat
            ) {
                event.preventDefault();

                setIsSpacePressed(true);
            }
        }


        function handleKeyUp(
            event: KeyboardEvent,
        ) {

            if (
                event.code === "Space"
            ) {
                event.preventDefault();

                setIsSpacePressed(false);
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

    }, [isFullscreen]);


    /* =========================================================================
     * TOOL EVENTS
     * ========================================================================= */

    useEffect(() => {

        function handleToolChange(
            event: Event,
        ) {

            const customEvent =
                event as CustomEvent<WarehouseTool>;

            setActiveTool(
                customEvent.detail,
            );
        }


        function handleZoom(
            event: Event,
        ) {

            const customEvent =
                event as CustomEvent<
                    "in" | "out"
                >;


            if (
                customEvent.detail ===
                "in"
            ) {

                setZoom(
                    (current) =>
                        Math.min(
                            3,
                            current + 0.1,
                        ),
                );
            }


            if (
                customEvent.detail ===
                "out"
            ) {

                setZoom(
                    (current) =>
                        Math.max(
                            0.25,
                            current - 0.1,
                        ),
                );
            }
        }


        window.addEventListener(
            "warehouse-tool-change",
            handleToolChange,
        );

        window.addEventListener(
            "warehouse-zoom",
            handleZoom,
        );


        return () => {

            window.removeEventListener(
                "warehouse-tool-change",
                handleToolChange,
            );

            window.removeEventListener(
                "warehouse-zoom",
                handleZoom,
            );
        };

    }, []);


    /* =========================================================================
     * TOOL CHANGE
     * ========================================================================= */

    function handleToolChange(
        tool: WarehouseTool,
    ) {

        setActiveTool(tool);

        /*
         * When changing to a placement tool,
         * remove the current selection.
         */

        if (
            tool !== "select" &&
            tool !== "hand"
        ) {
            setSelectedElementId(null);
        }
    }


    /* =========================================================================
     * ELEMENT SELECTION
     * ========================================================================= */

    function handleElementSelect(
        elementId: string | null,
    ) {

        setSelectedElementId(
            elementId,
        );
    }


    /* =========================================================================
     * ELEMENT UPDATE
     * ========================================================================= */

    function updateElement(
        elementId: string,
        updates: Partial<WarehouseElement>,
    ) {

        setElements(
            (current) =>
                current.map(
                    (element) =>
                        element.id ===
                            elementId
                            ? {
                                ...element,
                                ...updates,
                            }
                            : element,
                ),
        );
    }


    /* =========================================================================
     * DELETE ELEMENT
     * ========================================================================= */

    function deleteSelectedElement() {

        if (!selectedElementId) {
            return;
        }


        setElements(
            (current) =>
                current.filter(
                    (element) =>
                        element.id !==
                        selectedElementId,
                ),
        );


        setSelectedElementId(null);
    }


    /* =========================================================================
     * INPUT NUMBER HELPER
     * ========================================================================= */

    function updateNumber(
        field:
            | "x"
            | "y"
            | "width"
            | "height",
        value: string,
    ) {

        if (!selectedElement) {
            return;
        }


        const numericValue =
            Number(value);


        if (
            Number.isNaN(
                numericValue,
            )
        ) {
            return;
        }


        updateElement(
            selectedElement.id,
            {
                [field]:
                    numericValue,
            },
        );
    }


    /* =========================================================================
     * RENDER
     * ========================================================================= */

    return (
        <main
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-background"
                    : "relative h-[calc(100vh-8rem)] min-h-[600px] overflow-hidden rounded-xl border bg-background"
            }
        >

            {/* =================================================================
         * CANVAS
         * ================================================================= */}

            <WarehouseCanvas
                activeTool={
                    activeTool
                }

                zoom={
                    zoom
                }

                offsetX={
                    offsetX
                }

                offsetY={
                    offsetY
                }

                isSpacePressed={
                    isSpacePressed
                }

                elements={
                    elements
                }

                selectedElementId={
                    selectedElementId
                }

                onElementsChange={
                    setElements
                }

                onElementSelect={
                    handleElementSelect
                }

                onOffsetChange={
                    (
                        nextX,
                        nextY,
                    ) => {

                        setOffsetX(
                            nextX,
                        );

                        setOffsetY(
                            nextY,
                        );
                    }
                }
            />


            {/* =================================================================
         * FLOATING TOOLBOX
         * ================================================================= */}

            <WarehouseToolbox
                activeTool={
                    activeTool
                }

                onToolChange={
                    handleToolChange
                }

                zoom={
                    zoom
                }

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
                    setIsFullscreen(
                        true,
                    )
                }
            />


            {/* =================================================================
         * FULLSCREEN BUTTON
         * ================================================================= */}

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

                    <span className="sr-only">
                        {isFullscreen
                            ? "Exit fullscreen"
                            : "Enter fullscreen"}
                    </span>

                </Button>

            </div>


            {/* =================================================================
         * ELEMENT PROPERTIES PANEL
         * ================================================================= */}

            {selectedElement && (

                <aside
                    className="
                    absolute
                    right-4
                    top-16
                    z-40
                    w-72
                    rounded-xl
                    border
                    bg-background/95
                    p-4
                    shadow-2xl
                    backdrop-blur
                "
                >

                    {/* ---------------------------------------------------------
                 * Header
                 * ------------------------------------------------------ */}

                    <div
                        className="
                        mb-5
                        flex
                        items-start
                        justify-between
                    "
                    >

                        <div>

                            <p
                                className="
                                text-sm
                                font-semibold
                            "
                            >
                                Element Properties
                            </p>

                            <p
                                className="
                                mt-1
                                text-xs
                                text-muted-foreground
                            "
                            >
                                {selectedElement.type}
                            </p>

                        </div>


                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                                setSelectedElementId(
                                    null,
                                )
                            }
                        >
                            <X className="h-4 w-4" />

                            <span className="sr-only">
                                Close properties
                            </span>
                        </Button>

                    </div>


                    {/* ---------------------------------------------------------
                 * Element Name
                 * ------------------------------------------------------ */}

                    <div className="space-y-2">

                        <Label
                            htmlFor="element-name"
                        >
                            Name
                        </Label>

                        <Input
                            id="element-name"
                            value={
                                selectedElement.elementName ??
                                ""
                            }
                            placeholder={
                                "Enter element name"
                            }
                            onChange={(event) =>
                                updateElement(
                                    selectedElement.id,
                                    {
                                        elementName:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                        />

                    </div>


                    {/* ---------------------------------------------------------
                 * Position
                 * ------------------------------------------------------ */}

                    <div className="mt-5">

                        <p
                            className="
                            mb-3
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-muted-foreground
                        "
                        >
                            Position
                        </p>


                        <div
                            className="
                            grid
                            grid-cols-2
                            gap-3
                        "
                        >

                            <div className="space-y-2">

                                <Label
                                    htmlFor="element-x"
                                >
                                    X
                                </Label>

                                <Input
                                    id="element-x"
                                    type="number"
                                    value={
                                        selectedElement.x
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateNumber(
                                            "x",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />

                            </div>


                            <div className="space-y-2">

                                <Label
                                    htmlFor="element-y"
                                >
                                    Y
                                </Label>

                                <Input
                                    id="element-y"
                                    type="number"
                                    value={
                                        selectedElement.y
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateNumber(
                                            "y",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* ---------------------------------------------------------
                 * Dimensions
                 * ------------------------------------------------------ */}

                    <div className="mt-5">

                        <p
                            className="
                            mb-3
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                            text-muted-foreground
                        "
                        >
                            Dimensions
                        </p>


                        <div
                            className="
                            grid
                            grid-cols-2
                            gap-3
                        "
                        >

                            <div className="space-y-2">

                                <Label
                                    htmlFor="element-width"
                                >
                                    Width
                                </Label>

                                <Input
                                    id="element-width"
                                    type="number"
                                    min="1"
                                    value={
                                        selectedElement.width
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateNumber(
                                            "width",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />

                            </div>


                            <div className="space-y-2">

                                <Label
                                    htmlFor="element-height"
                                >
                                    Height
                                </Label>

                                <Input
                                    id="element-height"
                                    type="number"
                                    min="1"
                                    value={
                                        selectedElement.height
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateNumber(
                                            "height",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    {/* ---------------------------------------------------------
                 * Location Code
                 * ------------------------------------------------------ */}

                    <div className="mt-5 space-y-2">

                        <Label
                            htmlFor="location-code"
                        >
                            Location Code
                        </Label>

                        <Input
                            id="location-code"
                            value={
                                selectedElement.locationCode ??
                                ""
                            }
                            placeholder="e.g. A-01"
                            onChange={(event) =>
                                updateElement(
                                    selectedElement.id,
                                    {
                                        locationCode:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                        />

                    </div>


                    {/* ---------------------------------------------------------
                 * Delete
                 * ------------------------------------------------------ */}

                    <div
                        className="
                        mt-6
                        border-t
                        pt-4
                    "
                    >

                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={
                                deleteSelectedElement
                            }
                        >
                            Delete Element
                        </Button>

                    </div>

                </aside>

            )}

        </main>
    );

}