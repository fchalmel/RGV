// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
export declare class BodyDropPivotTarget {
    private columnController;
    private gridOptionsWrapper;
    private columnsToAggregate;
    private columnsToGroup;
    private columnsToPivot;
    private pinned;
    constructor(pinned: string);
    /** Callback for when drag enters */
    onDragEnter(draggingEvent: DraggingEvent): void;
    getIconName(): string;
    /** Callback for when drag leaves */
    onDragLeave(draggingEvent: DraggingEvent): void;
    private clearColumnsList();
    /** Callback for when dragging */
    onDragging(draggingEvent: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop(draggingEvent: DraggingEvent): void;
}
