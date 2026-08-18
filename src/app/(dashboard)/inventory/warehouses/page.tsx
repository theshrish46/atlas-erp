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

export default function WarehousePage() {
    const canvasRef =
        useRef<HTMLCanvasElement | null>(null);

    const [isFullscreen, setIsFullscreen] =
        useState(false);

    const [zoom, setZoom] = useState(1);

    const [offsetX, setOffsetX] =
        useState(0);

    const [offsetY, setOffsetY] =
        useState(0);

    const [isSpacePressed, setIsSpacePressed] =
        useState(false);

    const [isDragging, setIsDragging] =
        useState(false);

    /* ---------------------------------------------------------------------- */
    /* Drag state                                                             */
    /* ---------------------------------------------------------------------- */

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        offsetX: 0,
        offsetY: 0,
    });

    /* ---------------------------------------------------------------------- */
    /* Escape + Space                                                         */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                event.key === "Escape" &&
                isFullscreen
            ) {
                setIsFullscreen(false);
                setIsDragging(false);
                return;
            }

            if (
                event.code === "Space" &&
                !event.repeat
            ) {
                /*
                 * Prevent the browser from scrolling
                 * when Space is being used as the
                 * canvas hand tool.
                 */
                event.preventDefault();

                setIsSpacePressed(true);
            }
        }

        function handleKeyUp(
            event: KeyboardEvent,
        ) {
            if (event.code === "Space") {
                event.preventDefault();

                setIsSpacePressed(false);
                setIsDragging(false);
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

    /* ---------------------------------------------------------------------- */
    /* Canvas wheel interaction                                               */
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
             * --------------------------------------------------------------
             * Horizontal canvas movement.
             */

            if (event.shiftKey) {
                setOffsetX((current) => {
                    const next =
                        current +
                        event.deltaY;

                    return Math.max(
                        -2000,
                        Math.min(
                            2000,
                            next,
                        ),
                    );
                });

                return;
            }

            /*
             * Ctrl + Scroll
             * --------------------------------------------------------------
             * Vertical canvas movement.
             */

            if (event.ctrlKey) {
                setOffsetY((current) => {
                    const next =
                        current +
                        event.deltaY;

                    return Math.max(
                        -2000,
                        Math.min(
                            2000,
                            next,
                        ),
                    );
                });

                return;
            }

            /*
             * Normal Scroll
             * --------------------------------------------------------------
             * Canvas zoom.
             */

            const zoomSpeed = 0.0015;

            setZoom((current) => {
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
            });
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
    /* Canvas mouse interaction                                               */
    /* ---------------------------------------------------------------------- */

    function handleMouseDown(
        event: React.MouseEvent<HTMLCanvasElement>,
    ) {
        /*
         * Space + mouse button = hand/pan tool.
         */

        if (!isSpacePressed) {
            return;
        }

        event.preventDefault();

        dragStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            offsetX,
            offsetY,
        };

        setIsDragging(true);
    }

    function handleMouseMove(
        event: React.MouseEvent<HTMLCanvasElement>,
    ) {
        if (
            !isDragging ||
            !isSpacePressed
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

    function stopDragging() {
        setIsDragging(false);
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
            {/* -------------------------------------------------------------- */}
            {/* Expand / Minimize                                               */}
            {/* -------------------------------------------------------------- */}

            <div className="absolute right-4 top-4 z-20">
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

            {/* -------------------------------------------------------------- */}
            {/* Canvas                                                          */}
            {/* -------------------------------------------------------------- */}

            <canvas
                ref={canvasRef}
                className="block h-full w-full"
                style={{
                    cursor: isSpacePressed
                        ? isDragging
                            ? "grabbing"
                            : "grab"
                        : "default",
                }}
                onMouseDown={
                    handleMouseDown
                }
                onMouseMove={
                    handleMouseMove
                }
                onMouseUp={
                    stopDragging
                }
                onMouseLeave={
                    stopDragging
                }
            />

            {/* -------------------------------------------------------------- */}
            {/* Test Rectangle                                                  */}
            {/* -------------------------------------------------------------- */}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                    className="h-32 w-48 rounded-lg border-2 border-border bg-muted/50"
                    style={{
                        transform: `
translate(
    ${offsetX}px,
    ${offsetY}px
)
scale(${zoom})
    `,
                    }}
                />
            </div>
        </main>
    );
}
