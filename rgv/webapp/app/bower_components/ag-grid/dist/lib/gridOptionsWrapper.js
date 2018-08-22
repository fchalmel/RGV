/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v15.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("./eventService");
var constants_1 = require("./constants");
var componentUtil_1 = require("./components/componentUtil");
var gridApi_1 = require("./gridApi");
var context_1 = require("./context/context");
var columnController_1 = require("./columnController/columnController");
var utils_1 = require("./utils");
var environment_1 = require("./environment");
var DEFAULT_ROW_HEIGHT = 25;
var DEFAULT_DETAIL_ROW_HEIGHT = 300;
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;
var legacyThemes = [
    'ag-fresh',
    'ag-bootstrap',
    'ag-blue',
    'ag-dark',
    'ag-material'
];
function isTrue(value) {
    return value === true || value === 'true';
}
function zeroOrGreater(value, defaultValue) {
    if (value >= 0) {
        return value;
    }
    else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}
function oneOrGreater(value, defaultValue) {
    if (value > 0) {
        return value;
    }
    else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}
var GridOptionsWrapper = (function () {
    function GridOptionsWrapper() {
        this.propertyEventService = new eventService_1.EventService();
        this.domDataKey = '__AG_' + Math.random().toString();
    }
    GridOptionsWrapper_1 = GridOptionsWrapper;
    GridOptionsWrapper.prototype.agWire = function (gridApi, columnApi) {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.checkForDeprecated();
    };
    GridOptionsWrapper.prototype.destroy = function () {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;
    };
    GridOptionsWrapper.prototype.init = function () {
        var async = this.useAsyncEvents();
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);
        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }
        if (this.isGroupSelectsChildren()) {
            if (!this.isRowSelectionMulti()) {
                console.warn("ag-Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
            if (this.isRowModelEnterprise()) {
                console.warn('ag-Grid: group selects children is NOT support for Enterprise Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.');
            }
        }
        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn('ag-Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don\'t ask us how to us these together on our support forum either you will get the same answer!');
        }
    };
    // returns the dom data, or undefined if not found
    GridOptionsWrapper.prototype.getDomData = function (element, key) {
        var domData = element[this.domDataKey];
        if (domData) {
            return domData[key];
        }
        else {
            return undefined;
        }
    };
    GridOptionsWrapper.prototype.setDomData = function (element, key, value) {
        var domData = element[this.domDataKey];
        if (utils_1.Utils.missing(domData)) {
            domData = {};
            element[this.domDataKey] = domData;
        }
        domData[key] = value;
    };
    GridOptionsWrapper.prototype.isEnterprise = function () { return this.enterprise; };
    GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
    GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
    GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
    GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
    GridOptionsWrapper.prototype.isPivotMode = function () { return isTrue(this.gridOptions.pivotMode); };
    GridOptionsWrapper.prototype.isPivotTotals = function () { return isTrue(this.gridOptions.pivotTotals); };
    GridOptionsWrapper.prototype.isRowModelInfinite = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE; };
    GridOptionsWrapper.prototype.isRowModelViewport = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT; };
    GridOptionsWrapper.prototype.isRowModelEnterprise = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE; };
    GridOptionsWrapper.prototype.isRowModelDefault = function () {
        return utils_1.Utils.missing(this.gridOptions.rowModelType) ||
            this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_IN_MEMORY ||
            this.gridOptions.rowModelType === constants_1.Constants.DEPRECATED_ROW_MODEL_TYPE_NORMAL;
    };
    GridOptionsWrapper.prototype.isFullRowEdit = function () { return this.gridOptions.editType === 'fullRow'; };
    GridOptionsWrapper.prototype.isSuppressFocusAfterRefresh = function () { return isTrue(this.gridOptions.suppressFocusAfterRefresh); };
    GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
    GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivots = function () {
        // we don't allow pivots when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressPivots) || this.isTreeData();
    };
    GridOptionsWrapper.prototype.isToolPanelSuppressRowGroups = function () {
        // we don't allow row grouping when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressRowGroups) || this.isTreeData();
    };
    GridOptionsWrapper.prototype.isToolPanelSuppressPivotMode = function () {
        return isTrue(this.gridOptions.toolPanelSuppressPivotMode) || this.isTreeData();
    };
    GridOptionsWrapper.prototype.isSuppressTouch = function () { return isTrue(this.gridOptions.suppressTouch); };
    GridOptionsWrapper.prototype.useAsyncEvents = function () { return !isTrue(this.gridOptions.suppressAsyncEvents); };
    GridOptionsWrapper.prototype.isEnableCellChangeFlash = function () { return isTrue(this.gridOptions.enableCellChangeFlash); };
    GridOptionsWrapper.prototype.isGroupSelectsChildren = function () {
        var result = isTrue(this.gridOptions.groupSelectsChildren);
        if (result && this.isTreeData()) {
            console.warn('ag-Grid: groupSelectsChildren does not work with tree data');
            return false;
        }
        else {
            return result;
        }
    };
    GridOptionsWrapper.prototype.isGroupSelectsFiltered = function () { return isTrue(this.gridOptions.groupSelectsFiltered); };
    GridOptionsWrapper.prototype.isGroupHideOpenParents = function () { return isTrue(this.gridOptions.groupHideOpenParents); };
    // if we are doing hideOpenParents, then we always have groupMultiAutoColumn, otherwise hideOpenParents would not work
    GridOptionsWrapper.prototype.isGroupMultiAutoColumn = function () { return isTrue(this.gridOptions.groupMultiAutoColumn) || isTrue(this.gridOptions.groupHideOpenParents); };
    GridOptionsWrapper.prototype.isGroupRemoveSingleChildren = function () { return isTrue(this.gridOptions.groupRemoveSingleChildren); };
    GridOptionsWrapper.prototype.isGroupRemoveLowestSingleChildren = function () { return isTrue(this.gridOptions.groupRemoveLowestSingleChildren); };
    GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
    GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
    GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
    GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
    GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
    GridOptionsWrapper.prototype.isSuppressDragLeaveHidesColumns = function () { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); };
    GridOptionsWrapper.prototype.isSuppressScrollOnNewData = function () { return isTrue(this.gridOptions.suppressScrollOnNewData); };
    GridOptionsWrapper.prototype.isForPrint = function () { return this.gridOptions.domLayout === 'forPrint'; };
    GridOptionsWrapper.prototype.isAutoHeight = function () { return this.gridOptions.domLayout === 'autoHeight'; };
    GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
    GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
    GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
    GridOptionsWrapper.prototype.isSuppressFieldDotNotation = function () { return isTrue(this.gridOptions.suppressFieldDotNotation); };
    GridOptionsWrapper.prototype.getPinnedTopRowData = function () { return this.gridOptions.pinnedTopRowData; };
    GridOptionsWrapper.prototype.getPinnedBottomRowData = function () { return this.gridOptions.pinnedBottomRowData; };
    GridOptionsWrapper.prototype.isFunctionsPassive = function () { return isTrue(this.gridOptions.functionsPassive); };
    GridOptionsWrapper.prototype.isSuppressTabbing = function () { return isTrue(this.gridOptions.suppressTabbing); };
    GridOptionsWrapper.prototype.isSuppressChangeDetection = function () { return isTrue(this.gridOptions.suppressChangeDetection); };
    GridOptionsWrapper.prototype.isSuppressAnimationFrame = function () { return isTrue(this.gridOptions.suppressAnimationFrame); };
    GridOptionsWrapper.prototype.getQuickFilterText = function () { return this.gridOptions.quickFilterText; };
    GridOptionsWrapper.prototype.isCacheQuickFilter = function () { return isTrue(this.gridOptions.cacheQuickFilter); };
    GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
    GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
    GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
    GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
    GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
    GridOptionsWrapper.prototype.rowClassRules = function () { return this.gridOptions.rowClassRules; };
    GridOptionsWrapper.prototype.getPostProcessPopupFunc = function () { return this.gridOptions.postProcessPopup; };
    GridOptionsWrapper.prototype.getDoesDataFlowerFunc = function () { return this.gridOptions.doesDataFlower; };
    GridOptionsWrapper.prototype.getPaginationNumberFormatterFunc = function () { return this.gridOptions.paginationNumberFormatter; };
    GridOptionsWrapper.prototype.getChildCountFunc = function () { return this.gridOptions.getChildCount; };
    GridOptionsWrapper.prototype.getIsFullWidthCellFunc = function () { return this.gridOptions.isFullWidthCell; };
    GridOptionsWrapper.prototype.getFullWidthCellRendererParams = function () { return this.gridOptions.fullWidthCellRendererParams; };
    GridOptionsWrapper.prototype.isEmbedFullWidthRows = function () {
        // if autoHeight, we always embed fullWidth rows, otherwise we let the user decide
        return this.isAutoHeight() || isTrue(this.gridOptions.embedFullWidthRows);
    };
    GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
    GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
    GridOptionsWrapper.prototype.getColumnApi = function () { return this.gridOptions.columnApi; };
    GridOptionsWrapper.prototype.isDeltaRowDataMode = function () { return isTrue(this.gridOptions.deltaRowDataMode); };
    GridOptionsWrapper.prototype.isEnsureDomOrder = function () { return isTrue(this.gridOptions.ensureDomOrder); };
    GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
    GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
    GridOptionsWrapper.prototype.isSuppressClickEdit = function () { return isTrue(this.gridOptions.suppressClickEdit); };
    GridOptionsWrapper.prototype.isStopEditingWhenGridLosesFocus = function () { return isTrue(this.gridOptions.stopEditingWhenGridLosesFocus); };
    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
    GridOptionsWrapper.prototype.getMaxConcurrentDatasourceRequests = function () { return this.gridOptions.maxConcurrentDatasourceRequests; };
    GridOptionsWrapper.prototype.getMaxBlocksInCache = function () { return this.gridOptions.maxBlocksInCache; };
    GridOptionsWrapper.prototype.getCacheOverflowSize = function () { return this.gridOptions.cacheOverflowSize; };
    GridOptionsWrapper.prototype.getPaginationPageSize = function () { return this.gridOptions.paginationPageSize; };
    GridOptionsWrapper.prototype.getCacheBlockSize = function () { return this.gridOptions.cacheBlockSize; };
    GridOptionsWrapper.prototype.getInfiniteInitialRowCount = function () { return this.gridOptions.infiniteInitialRowCount; };
    GridOptionsWrapper.prototype.isPurgeClosedRowNodes = function () { return isTrue(this.gridOptions.purgeClosedRowNodes); };
    GridOptionsWrapper.prototype.isSuppressPaginationPanel = function () { return isTrue(this.gridOptions.suppressPaginationPanel); };
    GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
    GridOptionsWrapper.prototype.isEnableRtl = function () { return isTrue(this.gridOptions.enableRtl); };
    GridOptionsWrapper.prototype.getAutoGroupColumnDef = function () { return this.gridOptions.autoGroupColumnDef; };
    GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
    GridOptionsWrapper.prototype.getRowGroupPanelShow = function () { return this.gridOptions.rowGroupPanelShow; };
    GridOptionsWrapper.prototype.getPivotPanelShow = function () { return this.gridOptions.pivotPanelShow; };
    GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
    GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
    GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getColumnTypes = function () { return this.gridOptions.columnTypes; };
    GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
    GridOptionsWrapper.prototype.getViewportDatasource = function () { return this.gridOptions.viewportDatasource; };
    GridOptionsWrapper.prototype.getEnterpriseDatasource = function () { return this.gridOptions.enterpriseDatasource; };
    GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isAccentedSort = function () { return isTrue(this.gridOptions.accentedSort); };
    GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
    GridOptionsWrapper.prototype.isEnableGroupEdit = function () { return isTrue(this.gridOptions.enableGroupEdit); };
    GridOptionsWrapper.prototype.isSuppressMiddleClickScrolls = function () { return isTrue(this.gridOptions.suppressMiddleClickScrolls); };
    GridOptionsWrapper.prototype.isSuppressPreventDefaultOnMouseWheel = function () { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); };
    GridOptionsWrapper.prototype.isSuppressColumnVirtualisation = function () { return isTrue(this.gridOptions.suppressColumnVirtualisation); };
    GridOptionsWrapper.prototype.isSuppressContextMenu = function () { return isTrue(this.gridOptions.suppressContextMenu); };
    GridOptionsWrapper.prototype.isAllowContextMenuWithControlKey = function () { return isTrue(this.gridOptions.allowContextMenuWithControlKey); };
    GridOptionsWrapper.prototype.isSuppressCopyRowsToClipboard = function () { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); };
    GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
    GridOptionsWrapper.prototype.isPagination = function () { return isTrue(this.gridOptions.pagination); };
    // these are deprecated, should remove them when we take out server side pagination
    GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
    GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
    GridOptionsWrapper.prototype.isSuppressMovableColumns = function () { return isTrue(this.gridOptions.suppressMovableColumns); };
    GridOptionsWrapper.prototype.isAnimateRows = function () {
        // never allow animating if enforcing the row order
        if (this.isEnsureDomOrder()) {
            return false;
        }
        return isTrue(this.gridOptions.animateRows);
    };
    GridOptionsWrapper.prototype.isSuppressColumnMoveAnimation = function () { return isTrue(this.gridOptions.suppressColumnMoveAnimation); };
    GridOptionsWrapper.prototype.isSuppressAggFuncInHeader = function () { return isTrue(this.gridOptions.suppressAggFuncInHeader); };
    GridOptionsWrapper.prototype.isSuppressAggAtRootLevel = function () { return isTrue(this.gridOptions.suppressAggAtRootLevel); };
    GridOptionsWrapper.prototype.isEnableRangeSelection = function () { return isTrue(this.gridOptions.enableRangeSelection); };
    GridOptionsWrapper.prototype.isPaginationAutoPageSize = function () { return isTrue(this.gridOptions.paginationAutoPageSize); };
    GridOptionsWrapper.prototype.isRememberGroupStateWhenNewData = function () { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); };
    GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
    GridOptionsWrapper.prototype.getAggFuncs = function () { return this.gridOptions.aggFuncs; };
    GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
    GridOptionsWrapper.prototype.getAlignedGrids = function () { return this.gridOptions.alignedGrids; };
    GridOptionsWrapper.prototype.isMasterDetail = function () {
        var _this = this;
        var usingMasterDetail = isTrue(this.gridOptions.masterDetail);
        utils_1.Utils.doOnce(function () {
            if (usingMasterDetail && !_this.enterprise) {
                console.warn('ag-grid: Master Detail is an Enterprise feature of ag-Grid.');
            }
        }, 'MasterDetailEnterpriseCheck');
        return usingMasterDetail && this.enterprise;
    };
    GridOptionsWrapper.prototype.getIsRowMasterFunc = function () { return this.gridOptions.isRowMaster; };
    GridOptionsWrapper.prototype.getGroupRowRendererParams = function () { return this.gridOptions.groupRowRendererParams; };
    GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
    GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
    GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
    GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
    GridOptionsWrapper.prototype.isEnableStatusBar = function () { return isTrue(this.gridOptions.enableStatusBar); };
    GridOptionsWrapper.prototype.isAlwaysShowStatusBar = function () { return isTrue(this.gridOptions.alwaysShowStatusBar); };
    GridOptionsWrapper.prototype.isFunctionsReadOnly = function () { return isTrue(this.gridOptions.functionsReadOnly); };
    GridOptionsWrapper.prototype.isFloatingFilter = function () { return this.gridOptions.floatingFilter; };
    // public isFloatingFilter(): boolean { return true; }
    GridOptionsWrapper.prototype.getDefaultColDef = function () { return this.gridOptions.defaultColDef; };
    GridOptionsWrapper.prototype.getDefaultColGroupDef = function () { return this.gridOptions.defaultColGroupDef; };
    GridOptionsWrapper.prototype.getDefaultExportParams = function () { return this.gridOptions.defaultExportParams; };
    GridOptionsWrapper.prototype.isSuppressCsvExport = function () { return isTrue(this.gridOptions.suppressCsvExport); };
    GridOptionsWrapper.prototype.isSuppressExcelExport = function () { return isTrue(this.gridOptions.suppressExcelExport); };
    GridOptionsWrapper.prototype.getNodeChildDetailsFunc = function () { return this.gridOptions.getNodeChildDetails; };
    GridOptionsWrapper.prototype.getDataPathFunc = function () { return this.gridOptions.getDataPath; };
    // public getIsGroupFunc(): ((dataItem: any) => boolean) { return this.gridOptions.isGroup }
    GridOptionsWrapper.prototype.getGroupRowAggNodesFunc = function () { return this.gridOptions.groupRowAggNodes; };
    GridOptionsWrapper.prototype.getContextMenuItemsFunc = function () { return this.gridOptions.getContextMenuItems; };
    GridOptionsWrapper.prototype.getMainMenuItemsFunc = function () { return this.gridOptions.getMainMenuItems; };
    GridOptionsWrapper.prototype.getRowNodeIdFunc = function () { return this.gridOptions.getRowNodeId; };
    GridOptionsWrapper.prototype.getNavigateToNextCellFunc = function () { return this.gridOptions.navigateToNextCell; };
    GridOptionsWrapper.prototype.getTabToNextCellFunc = function () { return this.gridOptions.tabToNextCell; };
    GridOptionsWrapper.prototype.isTreeData = function () { return isTrue(this.gridOptions.treeData); };
    GridOptionsWrapper.prototype.isValueCache = function () { return isTrue(this.gridOptions.valueCache); };
    GridOptionsWrapper.prototype.isValueCacheNeverExpires = function () { return isTrue(this.gridOptions.valueCacheNeverExpires); };
    GridOptionsWrapper.prototype.isAggregateOnlyChangedColumns = function () { return isTrue(this.gridOptions.aggregateOnlyChangedColumns); };
    GridOptionsWrapper.prototype.getProcessSecondaryColDefFunc = function () { return this.gridOptions.processSecondaryColDef; };
    GridOptionsWrapper.prototype.getProcessSecondaryColGroupDefFunc = function () { return this.gridOptions.processSecondaryColGroupDef; };
    GridOptionsWrapper.prototype.getSendToClipboardFunc = function () { return this.gridOptions.sendToClipboard; };
    GridOptionsWrapper.prototype.getProcessRowPostCreateFunc = function () { return this.gridOptions.processRowPostCreate; };
    GridOptionsWrapper.prototype.getProcessCellForClipboardFunc = function () { return this.gridOptions.processCellForClipboard; };
    GridOptionsWrapper.prototype.getProcessCellFromClipboardFunc = function () { return this.gridOptions.processCellFromClipboard; };
    GridOptionsWrapper.prototype.getViewportRowModelPageSize = function () { return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); };
    GridOptionsWrapper.prototype.getViewportRowModelBufferSize = function () { return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); };
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }
    GridOptionsWrapper.prototype.getClipboardDeliminator = function () {
        return utils_1.Utils.exists(this.gridOptions.clipboardDeliminator) ? this.gridOptions.clipboardDeliminator : '\t';
    };
    GridOptionsWrapper.prototype.setProperty = function (key, value) {
        var gridOptionsNoType = this.gridOptions;
        var previousValue = gridOptionsNoType[key];
        if (previousValue !== value) {
            gridOptionsNoType[key] = value;
            var event_1 = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event_1);
        }
    };
    GridOptionsWrapper.prototype.addEventListener = function (key, listener) {
        this.propertyEventService.addEventListener(key, listener);
    };
    GridOptionsWrapper.prototype.removeEventListener = function (key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    };
    GridOptionsWrapper.prototype.getAutoSizePadding = function () {
        return this.gridOptions.autoSizePadding > 0 ? this.gridOptions.autoSizePadding : 0;
    };
    // properties
    GridOptionsWrapper.prototype.getHeaderHeight = function () {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        }
        else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    };
    GridOptionsWrapper.prototype.getFloatingFiltersHeight = function () {
        if (typeof this.gridOptions.floatingFiltersHeight === 'number') {
            return this.gridOptions.floatingFiltersHeight;
        }
        else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    };
    GridOptionsWrapper.prototype.getGroupHeaderHeight = function () {
        if (typeof this.gridOptions.groupHeaderHeight === 'number') {
            return this.gridOptions.groupHeaderHeight;
        }
        else {
            return this.getHeaderHeight();
        }
    };
    GridOptionsWrapper.prototype.getPivotHeaderHeight = function () {
        if (typeof this.gridOptions.pivotHeaderHeight === 'number') {
            return this.gridOptions.pivotHeaderHeight;
        }
        else {
            return this.getHeaderHeight();
        }
    };
    GridOptionsWrapper.prototype.getPivotGroupHeaderHeight = function () {
        if (typeof this.gridOptions.pivotGroupHeaderHeight === 'number') {
            return this.gridOptions.pivotGroupHeaderHeight;
        }
        else {
            return this.getGroupHeaderHeight();
        }
    };
    GridOptionsWrapper.prototype.isExternalFilterPresent = function () {
        if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
            return this.gridOptions.isExternalFilterPresent();
        }
        else {
            return false;
        }
    };
    GridOptionsWrapper.prototype.doesExternalFilterPass = function (node) {
        if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
            return this.gridOptions.doesExternalFilterPass(node);
        }
        else {
            return false;
        }
    };
    GridOptionsWrapper.prototype.getDocument = function () {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        var result;
        if (utils_1.Utils.exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        if (utils_1.Utils.exists(result)) {
            return result;
        }
        else {
            return document;
        }
    };
    GridOptionsWrapper.prototype.getLayoutInterval = function () {
        if (typeof this.gridOptions.layoutInterval === 'number') {
            return this.gridOptions.layoutInterval;
        }
        else {
            return constants_1.Constants.LAYOUT_INTERVAL;
        }
    };
    GridOptionsWrapper.prototype.getMinColWidth = function () {
        if (this.gridOptions.minColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth;
        }
        else {
            return GridOptionsWrapper_1.MIN_COL_WIDTH;
        }
    };
    GridOptionsWrapper.prototype.getMaxColWidth = function () {
        if (this.gridOptions.maxColWidth > GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        }
        else {
            return null;
        }
    };
    GridOptionsWrapper.prototype.getColWidth = function () {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper_1.MIN_COL_WIDTH) {
            return 200;
        }
        else {
            return this.gridOptions.colWidth;
        }
    };
    GridOptionsWrapper.prototype.getRowBuffer = function () {
        if (typeof this.gridOptions.rowBuffer === 'number') {
            if (this.gridOptions.rowBuffer < 0) {
                console.warn('ag-Grid: rowBuffer should not be negative');
            }
            return this.gridOptions.rowBuffer;
        }
        else {
            return constants_1.Constants.ROW_BUFFER_SIZE;
        }
    };
    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    GridOptionsWrapper.prototype.getScrollbarWidth = function () {
        var scrollbarWidth = this.gridOptions.scrollbarWidth;
        if (typeof scrollbarWidth !== 'number' || scrollbarWidth < 0) {
            scrollbarWidth = utils_1.Utils.getScrollbarWidth();
        }
        return scrollbarWidth;
    };
    GridOptionsWrapper.prototype.checkForDeprecated = function () {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        var options = this.gridOptions;
        if (options.suppressUnSort) {
            console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortingOrder instead.');
        }
        if (options.suppressDescSort) {
            console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortingOrder instead.');
        }
        if (options.groupAggFields) {
            console.warn('ag-grid: as of v3 groupAggFields is not used. Please add appropriate agg fields to your columns.');
        }
        if (options.groupHidePivotColumns) {
            console.warn('ag-grid: as of v3 groupHidePivotColumns is not used as pivot columns are now called rowGroup columns. Please refer to the documentation');
        }
        if (options.groupKeys) {
            console.warn('ag-grid: as of v3 groupKeys is not used. You need to set rowGroupIndex on the columns to group. Please refer to the documentation');
        }
        if (typeof options.groupDefaultExpanded === 'boolean') {
            console.warn('ag-grid: groupDefaultExpanded can no longer be boolean. for groupDefaultExpanded=true, use groupDefaultExpanded=9999 instead, to expand all the groups');
        }
        if (options.onRowDeselected || options.rowDeselected) {
            console.warn('ag-grid: since version 3.4 event rowDeselected no longer exists, please check the docs');
        }
        if (options.rowsAlreadyGrouped) {
            console.warn('ag-grid: since version 3.4 rowsAlreadyGrouped no longer exists, please use getNodeChildDetails() instead');
        }
        if (options.groupAggFunction) {
            console.warn('ag-grid: since version 4.3.x groupAggFunction is now called groupRowAggNodes');
        }
        if (options.checkboxSelection) {
            console.warn('ag-grid: since version 8.0.x checkboxSelection is not supported as a grid option. ' +
                'If you want this on all columns, use defaultColDef instead and set it there');
        }
        if (options.paginationInitialRowCount) {
            console.warn('ag-grid: since version 9.0.x paginationInitialRowCount is now called infiniteInitialRowCount');
        }
        if (options.infinitePageSize) {
            console.warn('ag-grid: since version 9.0.x infinitePageSize is now called cacheBlockSize');
        }
        if (options.infiniteBlockSize) {
            console.warn('ag-grid: since version 10.0.x infiniteBlockSize is now called cacheBlockSize');
        }
        if (options.maxPagesInCache) {
            console.warn('ag-grid: since version 10.0.x maxPagesInCache is now called maxBlocksInCache');
        }
        if (options.paginationOverflowSize) {
            console.warn('ag-grid: since version 10.0.x paginationOverflowSize is now called cacheOverflowSize');
        }
        if (options.forPrint) {
            console.warn('ag-grid: since version 10.1.x, use property domLayout="forPrint" instead of forPrint=true');
        }
        if (options.suppressMenuFilterPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','columnsMenuTab'] instead of suppressMenuFilterPanel=true");
        }
        if (options.suppressMenuMainPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['filterMenuTab','columnsMenuTab'] instead of suppressMenuMainPanel=true");
        }
        if (options.suppressMenuColumnPanel) {
            console.warn("ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','filterMenuTab'] instead of suppressMenuColumnPanel=true");
        }
        if (options.suppressUseColIdForGroups) {
            console.warn("ag-grid: since version 11.0.x, this is not in use anymore. You should be able to remove it from your definition");
        }
        if (options.groupColumnDef) {
            console.warn("ag-grid: since version 11.0.x, groupColumnDef has been renamed, this property is now called autoGroupColumnDef. Please change your configuration accordingly");
        }
        if (options.slaveGrids) {
            console.warn("ag-grid: since version 12.x, slaveGrids has been renamed, this property is now called alignedGrids. Please change your configuration accordingly");
        }
        if (options.floatingTopRowData) {
            console.warn("ag-grid: since version 12.x, floatingTopRowData is now called pinnedTopRowData");
        }
        if (options.floatingBottomRowData) {
            console.warn("ag-grid: since version 12.x, floatingBottomRowData is now called pinnedBottomRowData");
        }
        if (options.paginationStartPage) {
            console.warn("ag-grid: since version 12.x, paginationStartPage is gone, please call api.paginationGoToPage(" + options.paginationStartPage + ") instead.");
        }
        if (options.getHeaderCellTemplate) {
            console.warn("ag-grid: since version 15.x, getHeaderCellTemplate is gone, please check the header documentation on how to set header templates.");
        }
        if (options.headerCellTemplate) {
            console.warn("ag-grid: since version 15.x, headerCellTemplate is gone, please check the header documentation on how to set header templates.");
        }
        if (options.headerCellRenderer) {
            console.warn("ag-grid: since version 15.x, headerCellRenderer is gone, please check the header documentation on how to set header templates.");
        }
    };
    GridOptionsWrapper.prototype.getLocaleTextFunc = function () {
        if (this.gridOptions.localeTextFunc) {
            return this.gridOptions.localeTextFunc;
        }
        var that = this;
        return function (key, defaultValue) {
            var localeText = that.gridOptions.localeText;
            if (localeText && localeText[key]) {
                return localeText[key];
            }
            else {
                return defaultValue;
            }
        };
    };
    // responsible for calling the onXXX functions on gridOptions
    GridOptionsWrapper.prototype.globalEventHandler = function (eventName, event) {
        var callbackMethodName = componentUtil_1.ComponentUtil.getCallbackForEvent(eventName);
        if (typeof this.gridOptions[callbackMethodName] === 'function') {
            this.gridOptions[callbackMethodName](event);
        }
    };
    // we don't allow dynamic row height for virtual paging
    GridOptionsWrapper.prototype.getRowHeightAsNumber = function () {
        var rowHeight = this.gridOptions.rowHeight;
        if (utils_1.Utils.missing(rowHeight)) {
            return this.getDefaultRowHeight();
        }
        else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        }
        else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
            return this.getDefaultRowHeight();
        }
    };
    GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.
        if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        }
        else if (rowNode.detail && this.isMasterDetail()) {
            if (this.isNumeric(this.gridOptions.detailRowHeight)) {
                return this.gridOptions.detailRowHeight;
            }
            else {
                return DEFAULT_DETAIL_ROW_HEIGHT;
            }
        }
        else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        }
        else {
            return this.getDefaultRowHeight();
        }
    };
    GridOptionsWrapper.prototype.isDynamicRowHeight = function () {
        return typeof this.gridOptions.getRowHeight === 'function';
    };
    GridOptionsWrapper.prototype.getVirtualItemHeight = function () {
        return this.specialForNewMaterial(20, 'virtualItemHeight');
    };
    GridOptionsWrapper.prototype.isNumeric = function (value) {
        return !isNaN(value) && typeof value === 'number';
    };
    // Material data table has strict guidelines about whitespace, and these values are different than the ones 
    // ag-grid uses by default. We override the default ones for the sake of making it better out of the box
    GridOptionsWrapper.prototype.specialForNewMaterial = function (defaultValue, sassVariableName) {
        var theme = this.environment.getTheme();
        if (theme.indexOf('ag-theme') === 0) {
            return this.environment.getSassVariable(theme, sassVariableName);
        }
        else {
            return defaultValue;
        }
    };
    GridOptionsWrapper.prototype.getDefaultRowHeight = function () {
        return this.specialForNewMaterial(DEFAULT_ROW_HEIGHT, 'rowHeight');
    };
    GridOptionsWrapper.MIN_COL_WIDTH = 10;
    GridOptionsWrapper.PROP_HEADER_HEIGHT = 'headerHeight';
    GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN = 'groupRemoveSingleChildren';
    GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN = 'groupRemoveLowestSingleChildren';
    GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT = 'pivotHeaderHeight';
    GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT = 'groupHeaderHeight';
    GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT = 'pivotGroupHeaderHeight';
    GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT = 'floatingFiltersHeight';
    __decorate([
        context_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], GridOptionsWrapper.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], GridOptionsWrapper.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], GridOptionsWrapper.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], GridOptionsWrapper.prototype, "enterprise", void 0);
    __decorate([
        context_1.Autowired('frameworkFactory'),
        __metadata("design:type", Object)
    ], GridOptionsWrapper.prototype, "frameworkFactory", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], GridOptionsWrapper.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnController_1.ColumnApi)
    ], GridOptionsWrapper.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('environment'),
        __metadata("design:type", environment_1.Environment)
    ], GridOptionsWrapper.prototype, "environment", void 0);
    __decorate([
        __param(0, context_1.Qualifier('gridApi')), __param(1, context_1.Qualifier('columnApi')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [gridApi_1.GridApi, columnController_1.ColumnApi]),
        __metadata("design:returntype", void 0)
    ], GridOptionsWrapper.prototype, "agWire", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridOptionsWrapper.prototype, "destroy", null);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridOptionsWrapper.prototype, "init", null);
    GridOptionsWrapper = GridOptionsWrapper_1 = __decorate([
        context_1.Bean('gridOptionsWrapper')
    ], GridOptionsWrapper);
    return GridOptionsWrapper;
    var GridOptionsWrapper_1;
}());
exports.GridOptionsWrapper = GridOptionsWrapper;
