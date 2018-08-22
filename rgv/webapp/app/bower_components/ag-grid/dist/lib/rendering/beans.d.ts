// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Context } from "../context/context";
import { ColumnApi, ColumnController } from "../columnController/columnController";
import { GridApi } from "../gridApi";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ExpressionService } from "../valueService/expressionService";
import { RowRenderer } from "./rowRenderer";
import { TemplateService } from "../templateService";
import { ValueService } from "../valueService/valueService";
import { EventService } from "../eventService";
import { ColumnAnimationService } from "./columnAnimationService";
import { IRangeController } from "../interfaces/iRangeController";
import { FocusedCellController } from "../focusedCellController";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { CellEditorFactory } from "./cellEditorFactory";
import { CellRendererFactory } from "./cellRendererFactory";
import { PopupService } from "../widgets/popupService";
import { CellRendererService } from "./cellRendererService";
import { ValueFormatterService } from "./valueFormatterService";
import { StylingService } from "../styling/stylingService";
import { ColumnHoverService } from "./columnHoverService";
import { GridPanel } from "../gridPanel/gridPanel";
import { PaginationProxy } from "../rowModels/paginationProxy";
import { AnimationFrameService } from "../misc/animationFrameService";
import { ComponentResolver } from "../components/framework/componentResolver";
export declare class Beans {
    paginationProxy: PaginationProxy;
    gridPanel: GridPanel;
    context: Context;
    columnApi: ColumnApi;
    gridApi: GridApi;
    gridOptionsWrapper: GridOptionsWrapper;
    expressionService: ExpressionService;
    rowRenderer: RowRenderer;
    $compile: any;
    templateService: TemplateService;
    valueService: ValueService;
    eventService: EventService;
    columnController: ColumnController;
    columnAnimationService: ColumnAnimationService;
    rangeController: IRangeController;
    focusedCellController: FocusedCellController;
    contextMenuFactory: IContextMenuFactory;
    cellEditorFactory: CellEditorFactory;
    cellRendererFactory: CellRendererFactory;
    popupService: PopupService;
    cellRendererService: CellRendererService;
    valueFormatterService: ValueFormatterService;
    stylingService: StylingService;
    columnHoverService: ColumnHoverService;
    enterprise: boolean;
    componentResolver: ComponentResolver;
    taskQueue: AnimationFrameService;
    forPrint: boolean;
    doingMasterDetail: boolean;
    private postConstruct();
}
