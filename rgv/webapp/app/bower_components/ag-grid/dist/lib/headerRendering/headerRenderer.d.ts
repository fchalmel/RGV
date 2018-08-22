// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
export declare class HeaderRenderer {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private context;
    private eventService;
    private scrollVisibleService;
    private pinnedLeftContainer;
    private pinnedRightContainer;
    private centerContainer;
    private childContainers;
    private eHeaderViewport;
    private eRoot;
    private eHeaderOverlay;
    private init();
    private onScrollVisibilityChanged();
    forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void;
    private destroy();
    private onGridColumnsChanged();
    refreshHeader(): void;
    private setHeight();
    setPinnedColContainerWidth(): void;
}
