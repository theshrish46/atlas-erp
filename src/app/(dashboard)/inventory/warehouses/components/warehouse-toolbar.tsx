"use client";

import {
    Hand,
    MousePointer2,
    Plus,
    Minus,
    RotateCcw,
    Maximize2,
    ChevronDown,
    Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
    WarehouseElementType,
    WarehouseToolCategory,
} from "./warehouse-types";

import {
    WAREHOUSE_TOOL_DEFINITIONS,
    WAREHOUSE_TOOL_CATEGORIES,
} from "./warehouse-types";

/* =============================================================================
 * TYPES
 * ============================================================================= */

export type WarehouseTool =
    | "select"
    | "hand"
    | WarehouseElementType;

type WarehouseToolboxProps = {
    activeTool: WarehouseTool;

    onToolChange: (
        tool: WarehouseTool,
    ) => void;

    zoom: number;

    onZoomIn: () => void;

    onZoomOut: () => void;

    onResetView: () => void;

    onExpand: () => void;
};

/* =============================================================================
 * MAIN TOOLBAR
 * ============================================================================= */

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
        <div className="absolute left-4 top-4 z-40 flex items-center gap-2 rounded-xl border bg-background/95 p-1.5 shadow-xl backdrop-blur-md">
            {/* -----------------------------------------------------------------
             * SELECT
             * ----------------------------------------------------------------- */}

            <ToolButton
                label="Select"
                shortcut="V"
                active={activeTool === "select"}
                onClick={() =>
                    onToolChange("select")
                }
            >
                <MousePointer2 className="h-4 w-4" />
            </ToolButton>

            {/* -----------------------------------------------------------------
             * HAND
             * ----------------------------------------------------------------- */}

            <ToolButton
                label="Hand / Pan"
                shortcut="H"
                active={activeTool === "hand"}
                onClick={() =>
                    onToolChange("hand")
                }
            >
                <Hand className="h-4 w-4" />
            </ToolButton>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* -----------------------------------------------------------------
             * CATEGORY MENUS
             * ----------------------------------------------------------------- */}

            {WAREHOUSE_TOOL_CATEGORIES.map(
                (category) => (
                    <ToolCategory
                        key={category}
                        category={category}
                        activeTool={activeTool}
                        onToolChange={
                            onToolChange
                        }
                    />
                ),
            )}

            <div className="mx-1 h-6 w-px bg-border" />

            {/* -----------------------------------------------------------------
             * ZOOM CONTROLS
             * ----------------------------------------------------------------- */}

            <ToolButton
                label="Zoom out"
                onClick={onZoomOut}
            >
                <Minus className="h-4 w-4" />
            </ToolButton>

            <span className="min-w-[48px] text-center text-xs font-medium tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
            </span>

            <ToolButton
                label="Zoom in"
                onClick={onZoomIn}
            >
                <Plus className="h-4 w-4" />
            </ToolButton>

            <ToolButton
                label="Reset view"
                onClick={onResetView}
            >
                <RotateCcw className="h-4 w-4" />
            </ToolButton>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* -----------------------------------------------------------------
             * EXPAND
             * ----------------------------------------------------------------- */}

            <ToolButton
                label="Expand warehouse"
                onClick={onExpand}
            >
                <Maximize2 className="h-4 w-4" />
            </ToolButton>
        </div>
    );
}

/* =============================================================================
 * CATEGORY
 * ============================================================================= */

function ToolCategory({
    category,
    activeTool,
    onToolChange,
}: {
    category: WarehouseToolCategory;

    activeTool: WarehouseTool;

    onToolChange: (
        tool: WarehouseTool,
    ) => void;
}) {
    const tools =
        WAREHOUSE_TOOL_DEFINITIONS.filter(
            (tool) =>
                tool.category === category,
        );

    if (tools.length === 0) {
        return null;
    }

    const hasActiveTool = tools.some(
        (tool) =>
            tool.type === activeTool,
    );

    return (
        <div className="group relative">
            <Button
                type="button"
                variant={
                    hasActiveTool
                        ? "secondary"
                        : "ghost"
                }
                className="h-8 gap-1 px-2 text-xs"
            >
                {category}

                <ChevronDown className="h-3 w-3" />
            </Button>

            {/* -------------------------------------------------------------
             * Dropdown
             * ------------------------------------------------------------- */}

            <div className="invisible absolute left-0 top-full mt-1 w-64 rounded-xl border bg-background p-1.5 opacity-0 shadow-2xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
                {tools.map((tool) => (
                    <button
                        key={tool.type}
                        type="button"
                        onClick={() =>
                            onToolChange(
                                tool.type,
                            )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeTool ===
                            tool.type
                            ? "bg-muted"
                            : "hover:bg-muted"
                            }`}
                    >
                        {/* -------------------------------------------------
                         * Tool preview
                         * ------------------------------------------------- */}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                            <ToolPreview
                                type={
                                    tool.type
                                }
                            />
                        </div>

                        {/* -------------------------------------------------
                         * Tool information
                         * ------------------------------------------------- */}

                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                                {tool.label}
                            </div>

                            <div className="truncate text-xs text-muted-foreground">
                                {
                                    tool.description
                                }
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

/* =============================================================================
 * TOOL BUTTON
 * ============================================================================= */

function ToolButton({
    children,
    label,
    shortcut,
    active,
    onClick,
}: {
    children: React.ReactNode;

    label: string;

    shortcut?: string;

    active?: boolean;

    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant={
                active
                    ? "secondary"
                    : "ghost"
            }
            size="icon"
            className="relative h-8 w-8"
            title={
                shortcut
                    ? `${label} (${shortcut})`
                    : label
            }
            onClick={onClick}
        >
            {children}

            {shortcut && (
                <span className="absolute -bottom-1 -right-1 rounded border bg-background px-0.5 text-[8px] leading-none text-muted-foreground">
                    {shortcut}
                </span>
            )}
        </Button>
    );
}

/* =============================================================================
 * TOOL PREVIEW
 * ============================================================================= */

function ToolPreview({
    type,
}: {
    type: WarehouseElementType;
}) {
    /*
     * These are deliberately simple visual previews.
     *
     * The actual warehouse objects will later get their detailed rendering
     * inside warehouse-canvas.tsx.
     */

    switch (type) {
        case "rack-single":
            return (
                <div className="flex h-5 w-6 flex-col justify-between">
                    <div className="h-1 rounded bg-blue-500" />
                    <div className="h-1 rounded bg-blue-500" />
                    <div className="h-1 rounded bg-blue-500" />
                </div>
            );

        case "rack-double":
            return (
                <div className="flex gap-1">
                    <div className="flex h-5 w-2 flex-col justify-between">
                        <div className="h-1 bg-blue-500" />
                        <div className="h-1 bg-blue-500" />
                        <div className="h-1 bg-blue-500" />
                    </div>

                    <div className="flex h-5 w-2 flex-col justify-between">
                        <div className="h-1 bg-blue-500" />
                        <div className="h-1 bg-blue-500" />
                        <div className="h-1 bg-blue-500" />
                    </div>
                </div>
            );

        case "rack-heavy":
            return (
                <div className="flex h-5 w-7 flex-col justify-between">
                    <div className="h-1.5 rounded bg-indigo-500" />
                    <div className="h-1.5 rounded bg-indigo-500" />
                    <div className="h-1.5 rounded bg-indigo-500" />
                </div>
            );

        case "shelf":
            return (
                <div className="flex h-5 w-6 flex-col justify-between border-x border-emerald-500 px-0.5">
                    <div className="h-1 bg-emerald-500" />
                    <div className="h-1 bg-emerald-500" />
                    <div className="h-1 bg-emerald-500" />
                </div>
            );

        case "pallet-area":
            return (
                <div className="grid h-6 w-6 grid-cols-2 gap-0.5 rounded border border-amber-500 p-0.5">
                    <div className="rounded-sm bg-amber-300" />
                    <div className="rounded-sm bg-amber-300" />
                    <div className="rounded-sm bg-amber-300" />
                    <div className="rounded-sm bg-amber-300" />
                </div>
            );

        case "cold-storage":
            return (
                <div className="h-6 w-6 rounded border-2 border-cyan-500 bg-cyan-100" />
            );

        case "loading-dock":
            return (
                <div className="flex h-5 w-7 items-center justify-center rounded border-2 border-orange-500">
                    <div className="h-1 w-4 bg-orange-500" />
                </div>
            );

        case "loading-area":
            return (
                <div className="h-6 w-7 rounded border-2 border-orange-400 border-dashed" />
            );

        case "staging-area":
            return (
                <div className="h-6 w-7 rounded border-2 border-purple-500 border-dashed" />
            );

        case "inspection-zone":
            return (
                <div className="h-6 w-7 rounded border-2 border-pink-500" />
            );

        case "forklift-zone":
            return (
                <div className="h-6 w-6 rotate-45 border-2 border-orange-600 border-dashed" />
            );

        case "workstation":
            return (
                <div className="h-5 w-6 rounded border-2 border-green-500">
                    <div className="mx-auto mt-1 h-1 w-4 bg-green-500" />
                </div>
            );

        case "packing-station":
            return (
                <div className="flex h-5 w-7 items-center justify-center rounded border-2 border-green-600">
                    <div className="h-3 w-4 border border-green-600" />
                </div>
            );

        case "office":
            return (
                <div className="h-6 w-7 rounded border-2 border-sky-500 bg-sky-50" />
            );

        case "aisle":
            return (
                <div className="h-6 w-2 rounded bg-muted-foreground/30" />
            );

        case "column":
            return (
                <div className="h-5 w-5 rounded-sm bg-muted-foreground" />
            );

        case "wall":
            return (
                <div className="h-2 w-7 rounded bg-foreground" />
            );

        case "door":
            return (
                <div className="h-5 w-6 rounded-b-full border-2 border-slate-500 border-t-0" />
            );

        case "fire-exit":
            return (
                <div className="flex h-6 w-6 items-center justify-center rounded border-2 border-red-500">
                    <span className="text-[9px] font-bold text-red-500">
                        EXIT
                    </span>
                </div>
            );

        case "container":
            return (
                <div className="h-5 w-7 rounded border-2 border-slate-500 bg-slate-100" />
            );

        case "bench":
            return (
                <div className="flex h-5 w-7 flex-col justify-between">
                    <div className="h-1.5 rounded bg-amber-700" />
                    <div className="flex justify-around">
                        <div className="h-3 w-1 bg-amber-700" />
                        <div className="h-3 w-1 bg-amber-700" />
                    </div>
                </div>
            );

        default:
            return (
                <Warehouse className="h-4 w-4 text-muted-foreground" />
            );
    }
}
