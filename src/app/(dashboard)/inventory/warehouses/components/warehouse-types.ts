/* =============================================================================
 * WAREHOUSE DESIGNER TYPES
 * =============================================================================
 *
 * This file contains the definitions for everything that can exist inside
 * the warehouse designer.
 *
 * IMPORTANT:
 * - This file contains NO React code.
 * - This file contains NO canvas logic.
 * - This file contains NO database logic.
 *
 * It is simply the single source of truth for warehouse objects.
 * ============================================================================= */

/* =============================================================================
 * ELEMENT TYPES
 * ============================================================================= */

export type WarehouseElementType =
    /* -------------------------------------------------------------------------
     * Storage
     * ---------------------------------------------------------------------- */
    | "rack-single"
    | "rack-double"
    | "rack-heavy"
    | "shelf"
    | "pallet-area"
    | "cold-storage"

    /* -------------------------------------------------------------------------
     * Material Handling / Operations
     * ---------------------------------------------------------------------- */
    | "loading-dock"
    | "loading-area"
    | "staging-area"
    | "inspection-zone"
    | "forklift-zone"

    /* -------------------------------------------------------------------------
     * Work Areas
     * ---------------------------------------------------------------------- */
    | "workstation"
    | "packing-station"
    | "office"

    /* -------------------------------------------------------------------------
     * Infrastructure
     * ---------------------------------------------------------------------- */
    | "aisle"
    | "column"
    | "wall"
    | "door"
    | "fire-exit"

    /* -------------------------------------------------------------------------
     * Future / General
     * ---------------------------------------------------------------------- */
    | "container"
    | "bench";


/* =============================================================================
 * TOOL CATEGORIES
 * ============================================================================= */

export type WarehouseToolCategory =
    | "Storage"
    | "Operations"
    | "Work Areas"
    | "Infrastructure"
    | "General";


/* =============================================================================
 * TOOL DEFINITION
 * =============================================================================
 *
 * This describes what appears in the warehouse toolbox.
 *
 * Example:
 *
 * {
 *     type: "rack-single",
 *     label: "Single Rack",
 *     category: "Storage",
 *     defaultWidth: 160,
 *     defaultHeight: 50,
 * }
 *
 * The actual warehouse object will be created from this definition.
 * ============================================================================= */

export interface WarehouseToolDefinition {
    type: WarehouseElementType;

    label: string;

    description: string;

    category: WarehouseToolCategory;

    /**
     * Short text/icon identifier.
     *
     * We deliberately keep this as a string for now.
     * The toolbar can decide which Lucide icon to render.
     */
    icon: string;

    /**
     * Default canvas dimensions.
     *
     * These are logical canvas units, NOT database dimensions.
     */
    defaultWidth: number;

    defaultHeight: number;

    /**
     * Minimum allowed dimensions when resizing.
     */
    minWidth: number;

    minHeight: number;

    /**
     * Whether this object can be freely resized.
     */
    resizable: boolean;

    /**
     * Whether the object can be rotated.
     */
    rotatable: boolean;
}


/* =============================================================================
 * WAREHOUSE ELEMENT
 * =============================================================================
 *
 * This is the actual object placed on the warehouse canvas.
 * ============================================================================= */

export interface WarehouseElement {
    id: string;

    type: WarehouseElementType;

    x: number;
    y: number;

    width: number;
    height: number;

    rotation: number;

    label?: string;

    assignedWork?: string;

    sku?: string;

    quantity?: number;

    unit?: string;

    locationCode?: string;

    notes?: string;

    properties?: Record<string, unknown>;
}

/* =============================================================================
 * TOOL DEFINITIONS
 * ============================================================================= */

export const WAREHOUSE_TOOL_DEFINITIONS: WarehouseToolDefinition[] = [
    /* =========================================================================
     * STORAGE
     * ========================================================================= */

    {
        type: "rack-single",
        label: "Single Rack",
        description: "Single-sided storage rack",
        category: "Storage",
        icon: "rack-single",
        defaultWidth: 180,
        defaultHeight: 60,
        minWidth: 100,
        minHeight: 40,
        resizable: true,
        rotatable: true,
    },

    {
        type: "rack-double",
        label: "Double Rack",
        description: "Back-to-back double-sided storage rack",
        category: "Storage",
        icon: "rack-double",
        defaultWidth: 180,
        defaultHeight: 90,
        minWidth: 100,
        minHeight: 60,
        resizable: true,
        rotatable: true,
    },

    {
        type: "rack-heavy",
        label: "Heavy Duty Rack",
        description: "Industrial heavy-duty storage rack",
        category: "Storage",
        icon: "rack-heavy",
        defaultWidth: 200,
        defaultHeight: 100,
        minWidth: 120,
        minHeight: 70,
        resizable: true,
        rotatable: true,
    },

    {
        type: "shelf",
        label: "Shelf Unit",
        description: "Open shelving unit",
        category: "Storage",
        icon: "shelf",
        defaultWidth: 140,
        defaultHeight: 70,
        minWidth: 80,
        minHeight: 40,
        resizable: true,
        rotatable: true,
    },

    {
        type: "pallet-area",
        label: "Pallet Area",
        description: "Floor-level pallet storage area",
        category: "Storage",
        icon: "pallet-area",
        defaultWidth: 180,
        defaultHeight: 180,
        minWidth: 100,
        minHeight: 100,
        resizable: true,
        rotatable: true,
    },

    {
        type: "cold-storage",
        label: "Cold Storage",
        description: "Temperature-controlled storage area",
        category: "Storage",
        icon: "cold-storage",
        defaultWidth: 220,
        defaultHeight: 220,
        minWidth: 120,
        minHeight: 120,
        resizable: true,
        rotatable: true,
    },

    /* =========================================================================
     * OPERATIONS
     * ========================================================================= */

    {
        type: "loading-dock",
        label: "Loading Dock",
        description: "Truck loading and unloading dock",
        category: "Operations",
        icon: "loading-dock",
        defaultWidth: 180,
        defaultHeight: 120,
        minWidth: 100,
        minHeight: 70,
        resizable: true,
        rotatable: true,
    },

    {
        type: "loading-area",
        label: "Loading Area",
        description: "Open loading and unloading area",
        category: "Operations",
        icon: "loading-area",
        defaultWidth: 240,
        defaultHeight: 180,
        minWidth: 120,
        minHeight: 100,
        resizable: true,
        rotatable: true,
    },

    {
        type: "staging-area",
        label: "Staging Area",
        description: "Order staging and consolidation area",
        category: "Operations",
        icon: "staging-area",
        defaultWidth: 240,
        defaultHeight: 180,
        minWidth: 120,
        minHeight: 100,
        resizable: true,
        rotatable: true,
    },

    {
        type: "inspection-zone",
        label: "Inspection Zone",
        description: "Quality inspection area",
        category: "Operations",
        icon: "inspection-zone",
        defaultWidth: 180,
        defaultHeight: 120,
        minWidth: 100,
        minHeight: 70,
        resizable: true,
        rotatable: true,
    },

    {
        type: "forklift-zone",
        label: "Forklift Zone",
        description: "Forklift operating area",
        category: "Operations",
        icon: "forklift-zone",
        defaultWidth: 220,
        defaultHeight: 220,
        minWidth: 120,
        minHeight: 120,
        resizable: true,
        rotatable: true,
    },

    /* =========================================================================
     * WORK AREAS
     * ========================================================================= */

    {
        type: "workstation",
        label: "Workstation",
        description: "Warehouse worker workstation",
        category: "Work Areas",
        icon: "workstation",
        defaultWidth: 120,
        defaultHeight: 100,
        minWidth: 80,
        minHeight: 60,
        resizable: true,
        rotatable: true,
    },

    {
        type: "packing-station",
        label: "Packing Station",
        description: "Order packing and processing station",
        category: "Work Areas",
        icon: "packing-station",
        defaultWidth: 180,
        defaultHeight: 120,
        minWidth: 100,
        minHeight: 70,
        resizable: true,
        rotatable: true,
    },

    {
        type: "office",
        label: "Office",
        description: "Office or administrative area",
        category: "Work Areas",
        icon: "office",
        defaultWidth: 220,
        defaultHeight: 180,
        minWidth: 120,
        minHeight: 100,
        resizable: true,
        rotatable: true,
    },

    /* =========================================================================
     * INFRASTRUCTURE
     * ========================================================================= */

    {
        type: "aisle",
        label: "Aisle",
        description: "Warehouse travel and walking aisle",
        category: "Infrastructure",
        icon: "aisle",
        defaultWidth: 80,
        defaultHeight: 360,
        minWidth: 50,
        minHeight: 150,
        resizable: true,
        rotatable: true,
    },

    {
        type: "column",
        label: "Column",
        description: "Structural building column",
        category: "Infrastructure",
        icon: "column",
        defaultWidth: 40,
        defaultHeight: 40,
        minWidth: 20,
        minHeight: 20,
        resizable: true,
        rotatable: false,
    },

    {
        type: "wall",
        label: "Wall",
        description: "Warehouse interior wall",
        category: "Infrastructure",
        icon: "wall",
        defaultWidth: 360,
        defaultHeight: 20,
        minWidth: 60,
        minHeight: 10,
        resizable: true,
        rotatable: true,
    },

    {
        type: "door",
        label: "Door",
        description: "Warehouse access door",
        category: "Infrastructure",
        icon: "door",
        defaultWidth: 80,
        defaultHeight: 20,
        minWidth: 50,
        minHeight: 10,
        resizable: true,
        rotatable: true,
    },

    {
        type: "fire-exit",
        label: "Fire Exit",
        description: "Emergency fire exit",
        category: "Infrastructure",
        icon: "fire-exit",
        defaultWidth: 80,
        defaultHeight: 80,
        minWidth: 50,
        minHeight: 50,
        resizable: true,
        rotatable: true,
    },

    /* =========================================================================
     * GENERAL
     * ========================================================================= */

    {
        type: "container",
        label: "Container",
        description: "General warehouse container",
        category: "General",
        icon: "container",
        defaultWidth: 110,
        defaultHeight: 90,
        minWidth: 60,
        minHeight: 50,
        resizable: true,
        rotatable: true,
    },

    {
        type: "bench",
        label: "Workbench",
        description: "Warehouse workbench",
        category: "General",
        icon: "bench",
        defaultWidth: 160,
        defaultHeight: 70,
        minWidth: 100,
        minHeight: 40,
        resizable: true,
        rotatable: true,
    },
];


/* =============================================================================
 * TOOL MAP
 * =============================================================================
 *
 * Allows us to quickly retrieve a definition:
 *
 * TOOL_MAP["rack-single"]
 *
 * instead of searching the entire array.
 * ============================================================================= */

export const WAREHOUSE_TOOL_MAP = Object.fromEntries(
    WAREHOUSE_TOOL_DEFINITIONS.map((tool) => [
        tool.type,
        tool,
    ]),
) as Record<
    WarehouseElementType,
    WarehouseToolDefinition
>;


/* =============================================================================
 * CATEGORY MAP
 * ============================================================================= */

export const WAREHOUSE_TOOL_CATEGORIES: WarehouseToolCategory[] = [
    "Storage",
    "Operations",
    "Work Areas",
    "Infrastructure",
    "General",
];


/* =============================================================================
 * CREATE ELEMENT
 * =============================================================================
 *
 * This is the only function the canvas needs to create a new object.
 * ============================================================================= */

export function createWarehouseElement(
    type: WarehouseElementType,
    x: number,
    y: number,
): WarehouseElement {
    const definition =
        WAREHOUSE_TOOL_MAP[type];

    return {
        id: crypto.randomUUID(),
        type,

        x:
            x -
            definition.defaultWidth / 2,

        y:
            y -
            definition.defaultHeight / 2,

        width: definition.defaultWidth,

        height: definition.defaultHeight,

        rotation: 0,

        label: "",

        assignedWork: "",

        sku: "",

        locationCode: "",

        properties: {},
    };
}


/* =============================================================================
 * TYPE HELPERS
 * ============================================================================= */

export function isStorageElement(
    type: WarehouseElementType,
): boolean {
    return [
        "rack-single",
        "rack-double",
        "rack-heavy",
        "shelf",
        "pallet-area",
        "cold-storage",
    ].includes(type);
}


export function isOperationElement(
    type: WarehouseElementType,
): boolean {
    return [
        "loading-dock",
        "loading-area",
        "staging-area",
        "inspection-zone",
        "forklift-zone",
    ].includes(type);
}


export function isInfrastructureElement(
    type: WarehouseElementType,
): boolean {
    return [
        "aisle",
        "column",
        "wall",
        "door",
        "fire-exit",
    ].includes(type);
}