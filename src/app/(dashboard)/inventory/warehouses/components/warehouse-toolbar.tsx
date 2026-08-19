"use client";

import {
    ArrowRight,
    Box,
    ChevronDown,
    Container,
    Hand,
    MousePointer2,
    Package,
    RectangleHorizontal,
    RotateCcw,
    Rows3,
    Ruler,
    LibraryBig,
    SquareDashed,
    Warehouse,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type WarehouseTool =
    | "select"
    | "hand"
    | "rack"
    | "shelf"
    | "storage"
    | "container"
    | "bench"
    | "zone"
    | "wall"
    | "measure";

type WarehouseToolboxProps = {
    activeTool: WarehouseTool;
    onToolChange: (tool: WarehouseTool) => void;

    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;

    onExpand?: () => void;
};

type ToolButtonProps = {
    label: string;
    shortcut?: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick: () => void;
};

function ToolButton({
    label,
    shortcut,
    icon,
    active,
    onClick,
}: ToolButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClick}
                    className={[
                        "relative h-9 w-9 shrink-0 rounded-lg",
                        "transition-all duration-150",
                        active
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                >
                    {icon}

                    {shortcut && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] leading-none text-muted-foreground/60">
                            {shortcut}
                        </span>
                    )}
                </Button>
            </TooltipTrigger>

            <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                    <span>{label}</span>

                    {shortcut && (
                        <span className="text-xs text-muted-foreground">
                            {shortcut}
                        </span>
                    )}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

function Divider() {
    return <div className="mx-1 h-7 w-px bg-border" />;
}

export default function WarehouseToolbox({
    activeTool,
    onToolChange,
    zoom,
    onZoomIn,
    onZoomOut,
    onResetView,
    onExpand,
}: WarehouseToolboxProps) {
    return (
        <TooltipProvider delayDuration={350}>
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center">
                <div
                    className={[
                        "pointer-events-auto",
                        "flex items-center gap-0.5",
                        "rounded-2xl border bg-background/95 p-1.5",
                        "shadow-2xl shadow-black/15",
                        "backdrop-blur-xl",
                        "ring-1 ring-black/5",
                    ].join(" ")}
                >
                    {/* -------------------------------------------------- */}
                    {/* Navigation tools                                  */}
                    {/* -------------------------------------------------- */}

                    <ToolButton
                        label="Select"
                        shortcut="V"
                        icon={
                            <MousePointer2 className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "select"}
                        onClick={() =>
                            onToolChange("select")
                        }
                    />

                    <ToolButton
                        label="Hand / Pan"
                        shortcut="H"
                        icon={
                            <Hand className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "hand"}
                        onClick={() =>
                            onToolChange("hand")
                        }
                    />

                    <Divider />

                    {/* -------------------------------------------------- */}
                    {/* Basic drawing                                      */}
                    {/* -------------------------------------------------- */}

                    <ToolButton
                        label="Wall / Rectangle"
                        shortcut="R"
                        icon={
                            <RectangleHorizontal className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "wall"}
                        onClick={() =>
                            onToolChange("wall")
                        }
                    />

                    <ToolButton
                        label="Zone"
                        shortcut="Z"
                        icon={
                            <SquareDashed className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "zone"}
                        onClick={() =>
                            onToolChange("zone")
                        }
                    />

                    <ToolButton
                        label="Measure"
                        shortcut="M"
                        icon={
                            <Ruler className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "measure"}
                        onClick={() =>
                            onToolChange("measure")
                        }
                    />

                    <Divider />

                    {/* -------------------------------------------------- */}
                    {/* Warehouse objects                                  */}
                    {/* -------------------------------------------------- */}

                    <ToolButton
                        label="Storage Rack"
                        shortcut="1"
                        icon={
                            <Rows3 className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "rack"}
                        onClick={() =>
                            onToolChange("rack")
                        }
                    />

                    <ToolButton
                        label="Shelf"
                        shortcut="2"
                        icon={
                            <LibraryBig className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "shelf"}
                        onClick={() =>
                            onToolChange("shelf")
                        }
                    />

                    <ToolButton
                        label="Storage Area"
                        shortcut="3"
                        icon={
                            <Warehouse className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "storage"}
                        onClick={() =>
                            onToolChange("storage")
                        }
                    />

                    <ToolButton
                        label="Container"
                        shortcut="4"
                        icon={
                            <Container className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "container"}
                        onClick={() =>
                            onToolChange("container")
                        }
                    />

                    <ToolButton
                        label="Bench"
                        shortcut="5"
                        icon={
                            <Box className="h-[18px] w-[18px]" />
                        }
                        active={activeTool === "bench"}
                        onClick={() =>
                            onToolChange("bench")
                        }
                    />

                    <Divider />

                    {/* -------------------------------------------------- */}
                    {/* View controls                                      */}
                    {/* -------------------------------------------------- */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-lg"
                                onClick={onZoomOut}
                            >
                                <ZoomOut className="h-[17px] w-[17px]" />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Zoom out
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={onResetView}
                                className="flex h-10 min-w-[58px] items-center justify-center rounded-lg px-2 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {Math.round(
                                    zoom * 100,
                                )}
                                %
                            </button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Reset zoom
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-lg"
                                onClick={onZoomIn}
                            >
                                <ZoomIn className="h-[17px] w-[17px]" />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            Zoom in
                        </TooltipContent>
                    </Tooltip>

                    <Divider />

                    {/* -------------------------------------------------- */}
                    {/* More                                                */}
                    {/* -------------------------------------------------- */}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-lg"
                            >
                                <ChevronDown className="h-[17px] w-[17px]" />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent side="bottom">
                            More tools
                        </TooltipContent>
                    </Tooltip>

                    {/* -------------------------------------------------- */}
                    {/* Expand                                              */}
                    {/* -------------------------------------------------- */}

                    {onExpand && (
                        <>
                            <Divider />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-lg"
                                        onClick={
                                            onExpand
                                        }
                                    >
                                        <ArrowRight className="h-[17px] w-[17px]" />
                                    </Button>
                                </TooltipTrigger>

                                <TooltipContent side="bottom">
                                    Expand canvas
                                </TooltipContent>
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}