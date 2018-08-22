// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { GridPanel } from "../gridPanel/gridPanel";
export declare class ColumnAnimationService {
    gridOptionsWrapper: GridOptionsWrapper;
    gridPanel: GridPanel;
    private executeNextFuncs;
    private executeLaterFuncs;
    private active;
    private animationThreadCount;
    isActive(): boolean;
    start(): void;
    finish(): void;
    executeNextVMTurn(func: Function): void;
    executeLaterVMTurn(func: Function): void;
    private ensureAnimationCssClassPresent();
    flush(): void;
}
