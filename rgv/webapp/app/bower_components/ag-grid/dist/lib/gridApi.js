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
Object.defineProperty(exports, "__esModule", { value: true });
var csvCreator_1 = require("./csvCreator");
var rowRenderer_1 = require("./rendering/rowRenderer");
var headerRenderer_1 = require("./headerRendering/headerRenderer");
var filterManager_1 = require("./filter/filterManager");
var columnController_1 = require("./columnController/columnController");
var selectionController_1 = require("./selectionController");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var gridPanel_1 = require("./gridPanel/gridPanel");
var valueService_1 = require("./valueService/valueService");
var eventService_1 = require("./eventService");
var constants_1 = require("./constants");
var context_1 = require("./context/context");
var gridCore_1 = require("./gridCore");
var sortController_1 = require("./sortController");
var focusedCellController_1 = require("./focusedCellController");
var gridCell_1 = require("./entities/gridCell");
var utils_1 = require("./utils");
var cellRendererFactory_1 = require("./rendering/cellRendererFactory");
var cellEditorFactory_1 = require("./rendering/cellEditorFactory");
var paginationProxy_1 = require("./rowModels/paginationProxy");
var immutableService_1 = require("./rowModels/inMemory/immutableService");
var valueCache_1 = require("./valueService/valueCache");
var alignedGridsService_1 = require("./alignedGridsService");
var pinnedRowModel_1 = require("./rowModels/pinnedRowModel");
var GridApi = (function () {
    function GridApi() {
        this.detailGridInfoMap = {};
        /*
        Taking these out, as we want to reconsider how we register components
        
        public addCellRenderer(key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc): void {
            this.cellRendererFactory.addCellRenderer(key, cellRenderer);
        }
        
        public addCellEditor(key: string, cellEditor: {new(): ICellEditor}): void {
            this.cellEditorFactory.addCellEditor(key, cellEditor);
        }*/
    }
    GridApi.prototype.init = function () {
        switch (this.rowModel.getType()) {
            case constants_1.Constants.ROW_MODEL_TYPE_IN_MEMORY:
                this.inMemoryRowModel = this.rowModel;
                break;
            case constants_1.Constants.ROW_MODEL_TYPE_INFINITE:
                this.infinitePageRowModel = this.rowModel;
                break;
            case constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE:
                this.enterpriseRowModel = this.rowModel;
                break;
        }
    };
    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    GridApi.prototype.__getAlignedGridService = function () {
        return this.alignedGridsService;
    };
    GridApi.prototype.addDetailGridInfo = function (id, gridInfo) {
        this.detailGridInfoMap[id] = gridInfo;
    };
    GridApi.prototype.removeDetailGridInfo = function (id) {
        this.detailGridInfoMap[id] = undefined;
    };
    GridApi.prototype.getDetailGridInfo = function (id) {
        return this.detailGridInfoMap[id];
    };
    GridApi.prototype.forEachDetailGridInfo = function (callback) {
        var index = 0;
        utils_1.Utils.iterateObject(this.detailGridInfoMap, function (id, gridInfo) {
            // check for undefined, as old references will still be lying around
            if (utils_1.Utils.exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    };
    GridApi.prototype.getDataAsCsv = function (params) {
        return this.csvCreator.getDataAsCsv(params);
    };
    GridApi.prototype.exportDataAsCsv = function (params) {
        this.csvCreator.exportDataAsCsv(params);
    };
    GridApi.prototype.getDataAsExcel = function (params) {
        if (!this.excelCreator) {
            console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise');
        }
        return this.excelCreator.getDataAsExcelXml(params);
    };
    GridApi.prototype.exportDataAsExcel = function (params) {
        if (!this.excelCreator) {
            console.warn('ag-Grid: Excel export is only available in ag-Grid Enterprise');
        }
        this.excelCreator.exportDataAsExcel(params);
    };
    GridApi.prototype.setEnterpriseDatasource = function (datasource) {
        if (this.gridOptionsWrapper.isRowModelEnterprise()) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn("ag-Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_ENTERPRISE + "'");
        }
    };
    GridApi.prototype.setDatasource = function (datasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            this.rowModel.setDatasource(datasource);
        }
        else {
            console.warn("ag-Grid: you can only use a datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_INFINITE + "'");
        }
    };
    GridApi.prototype.setViewportDatasource = function (viewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            this.rowModel.setViewportDatasource(viewportDatasource);
        }
        else {
            console.warn("ag-Grid: you can only use a viewport datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT + "'");
        }
    };
    GridApi.prototype.setRowData = function (rowData) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            if (this.gridOptionsWrapper.isDeltaRowDataMode()) {
                var _a = this.immutableService.createTransactionForRowData(rowData), transaction = _a[0], orderIdMap = _a[1];
                this.inMemoryRowModel.updateRowData(transaction, orderIdMap);
            }
            else {
                this.selectionController.reset();
                this.inMemoryRowModel.setRowData(rowData);
            }
        }
        else {
            console.log('cannot call setRowData unless using normal row model');
        }
    };
    // DEPRECATED
    GridApi.prototype.setFloatingTopRowData = function (rows) {
        console.warn('ag-Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    };
    // DEPRECATED
    GridApi.prototype.setFloatingBottomRowData = function (rows) {
        console.warn('ag-Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    };
    // DEPRECATED
    GridApi.prototype.getFloatingTopRowCount = function () {
        console.warn('ag-Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    };
    // DEPRECATED
    GridApi.prototype.getFloatingBottomRowCount = function () {
        console.warn('ag-Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    };
    // DEPRECATED
    GridApi.prototype.getFloatingTopRow = function (index) {
        console.warn('ag-Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    };
    // DEPRECATED
    GridApi.prototype.getFloatingBottomRow = function (index) {
        console.warn('ag-Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
    };
    GridApi.prototype.setPinnedTopRowData = function (rows) {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    };
    GridApi.prototype.setPinnedBottomRowData = function (rows) {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    };
    GridApi.prototype.getPinnedTopRowCount = function () {
        return this.pinnedRowModel.getPinnedTopRowCount();
    };
    GridApi.prototype.getPinnedBottomRowCount = function () {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    };
    GridApi.prototype.getPinnedTopRow = function (index) {
        return this.pinnedRowModel.getPinnedTopRow(index);
    };
    GridApi.prototype.getPinnedBottomRow = function (index) {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    };
    GridApi.prototype.setColumnDefs = function (colDefs) {
        this.columnController.setColumnDefs(colDefs);
    };
    GridApi.prototype.expireValueCache = function () {
        this.valueCache.expire();
    };
    GridApi.prototype.getVerticalPixelRange = function () {
        return this.gridPanel.getVerticalPixelRange();
    };
    GridApi.prototype.refreshToolPanel = function () {
        if (this.toolPanel) {
            this.toolPanel.refresh();
        }
    };
    GridApi.prototype.refreshCells = function (params) {
        if (params === void 0) { params = {}; }
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since ag-Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
    };
    GridApi.prototype.redrawRows = function (params) {
        if (params === void 0) { params = {}; }
        if (params && params.rowNodes) {
            this.rowRenderer.redrawRows(params.rowNodes);
        }
        else {
            this.rowRenderer.redrawAfterModelUpdate();
        }
    };
    GridApi.prototype.timeFullRedraw = function (count) {
        if (count === void 0) { count = 1; }
        var iterationCount = 0;
        var totalProcessing = 0;
        var totalReflow = 0;
        var that = this;
        doOneIteration();
        function doOneIteration() {
            var start = (new Date()).getTime();
            that.rowRenderer.redrawAfterModelUpdate();
            var endProcessing = (new Date()).getTime();
            setTimeout(function () {
                var endReflow = (new Date()).getTime();
                var durationProcessing = endProcessing - start;
                var durationReflow = endReflow - endProcessing;
                console.log('duration:  processing = ' + durationProcessing + 'ms, reflow = ' + durationReflow + 'ms');
                iterationCount++;
                totalProcessing += durationProcessing;
                totalReflow += durationReflow;
                if (iterationCount < count) {
                    // wait for 1s between tests
                    setTimeout(doOneIteration, 1000);
                }
                else {
                    finish();
                }
            }, 0);
        }
        function finish() {
            console.log('tests complete. iteration count = ' + iterationCount);
            console.log('average processing = ' + (totalProcessing / iterationCount) + 'ms');
            console.log('average reflow = ' + (totalReflow / iterationCount) + 'ms');
        }
    };
    // *** deprecated
    GridApi.prototype.refreshView = function () {
        console.warn('ag-Grid: since v11.1, refreshView() is deprecated, please call refreshCells() or redrawRows() instead');
        this.redrawRows();
    };
    // *** deprecated
    GridApi.prototype.refreshRows = function (rowNodes) {
        console.warn('since ag-Grid v11.1, refreshRows() is deprecated, please use refreshCells({rowNodes: rows}) or redrawRows({rowNodes: rows}) instead');
        this.refreshCells({ rowNodes: rowNodes });
    };
    // *** deprecated
    GridApi.prototype.rowDataChanged = function (rows) {
        console.log('ag-Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node');
        this.redrawRows();
    };
    // *** deprecated
    GridApi.prototype.softRefreshView = function () {
        console.warn('ag-Grid: since v11.1, softRefreshView() is deprecated, call refreshCells(params) instead.');
        this.refreshCells({ volatile: true });
    };
    // *** deprecated
    GridApi.prototype.refreshGroupRows = function () {
        console.warn('ag-Grid: since v11.1, refreshGroupRows() is no longer supported, call refreshCells() instead. ' +
            'Because refreshCells() now does dirty checking, it will only refresh cells that have changed, so it should ' +
            'not be necessary to only refresh the group rows.');
        this.refreshCells();
    };
    GridApi.prototype.setFunctionsReadOnly = function (readOnly) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    };
    GridApi.prototype.refreshHeader = function () {
        this.headerRenderer.refreshHeader();
    };
    GridApi.prototype.isAnyFilterPresent = function () {
        return this.filterManager.isAnyFilterPresent();
    };
    GridApi.prototype.isAdvancedFilterPresent = function () {
        return this.filterManager.isAdvancedFilterPresent();
    };
    GridApi.prototype.isQuickFilterPresent = function () {
        return this.filterManager.isQuickFilterPresent();
    };
    GridApi.prototype.getModel = function () {
        return this.rowModel;
    };
    GridApi.prototype.onGroupExpandedOrCollapsed = function (deprecated_refreshFromIndex) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('ag-Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model');
        }
        if (utils_1.Utils.exists(deprecated_refreshFromIndex)) {
            console.log('ag-Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is no longer used, the grid will refresh all rows');
        }
        // we don't really want the user calling this if one one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.inMemoryRowModel.refreshModel({ step: constants_1.Constants.STEP_MAP });
    };
    GridApi.prototype.refreshInMemoryRowModel = function (step) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call refreshInMemoryRowModel unless using normal row model');
        }
        var paramsStep = constants_1.Constants.STEP_EVERYTHING;
        var stepsMapped = {
            group: constants_1.Constants.STEP_EVERYTHING,
            filter: constants_1.Constants.STEP_FILTER,
            map: constants_1.Constants.STEP_MAP,
            aggregate: constants_1.Constants.STEP_AGGREGATE,
            sort: constants_1.Constants.STEP_SORT,
            pivot: constants_1.Constants.STEP_PIVOT
        };
        if (utils_1.Utils.exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (utils_1.Utils.missing(paramsStep)) {
            console.error("ag-Grid: invalid step " + step + ", available steps are " + Object.keys(stepsMapped).join(', '));
            return;
        }
        var modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        };
        this.inMemoryRowModel.refreshModel(modelParams);
    };
    GridApi.prototype.getRowNode = function (id) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call getRowNode unless using normal row model');
            return;
        }
        return this.inMemoryRowModel.getRowNode(id);
    };
    GridApi.prototype.expandAll = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call expandAll unless using normal row model');
            return;
        }
        this.inMemoryRowModel.expandOrCollapseAll(true);
    };
    GridApi.prototype.collapseAll = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.warn('ag-Grid: cannot call collapseAll unless using normal row model');
            return;
        }
        this.inMemoryRowModel.expandOrCollapseAll(false);
    };
    GridApi.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
        if (typeof eventName !== 'string') {
            console.log('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
        if (eventName === 'virtualRowSelected') {
            console.log('ag-Grid: event virtualRowSelected is deprecated, to register for individual row ' +
                'selection events, add a listener directly to the row node.');
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    };
    GridApi.prototype.setQuickFilter = function (newFilter) {
        this.filterManager.setQuickFilter(newFilter);
    };
    GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.selectIndex(index, tryMulti);
    };
    GridApi.prototype.deselectIndex = function (index, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionController.deselectIndex(index);
    };
    GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
        if (tryMulti === void 0) { tryMulti = false; }
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    };
    GridApi.prototype.deselectNode = function (node, suppressEvents) {
        if (suppressEvents === void 0) { suppressEvents = false; }
        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.log('ag-Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: false });
    };
    GridApi.prototype.selectAll = function () {
        this.selectionController.selectAllRowNodes();
    };
    GridApi.prototype.deselectAll = function () {
        this.selectionController.deselectAllRowNodes();
    };
    GridApi.prototype.selectAllFiltered = function () {
        this.selectionController.selectAllRowNodes(true);
    };
    GridApi.prototype.deselectAllFiltered = function () {
        this.selectionController.deselectAllRowNodes(true);
    };
    GridApi.prototype.recomputeAggregates = function () {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call recomputeAggregates unless using normal row model');
        }
        this.inMemoryRowModel.refreshModel({ step: constants_1.Constants.STEP_AGGREGATE });
    };
    GridApi.prototype.sizeColumnsToFit = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
            return;
        }
        this.gridPanel.sizeColumnsToFit();
    };
    GridApi.prototype.showLoadingOverlay = function () {
        this.gridPanel.showLoadingOverlay();
    };
    GridApi.prototype.showNoRowsOverlay = function () {
        this.gridPanel.showNoRowsOverlay();
    };
    GridApi.prototype.hideOverlay = function () {
        this.gridPanel.hideOverlay();
    };
    GridApi.prototype.isNodeSelected = function (node) {
        console.log('ag-Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    };
    GridApi.prototype.getSelectedNodesById = function () {
        console.error('ag-Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
        return null;
    };
    GridApi.prototype.getSelectedNodes = function () {
        return this.selectionController.getSelectedNodes();
    };
    GridApi.prototype.getSelectedRows = function () {
        return this.selectionController.getSelectedRows();
    };
    GridApi.prototype.getBestCostNodeSelection = function () {
        return this.selectionController.getBestCostNodeSelection();
    };
    GridApi.prototype.getRenderedNodes = function () {
        return this.rowRenderer.getRenderedNodes();
    };
    GridApi.prototype.ensureColIndexVisible = function (index) {
        console.warn('ag-Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    };
    GridApi.prototype.ensureColumnVisible = function (key) {
        this.gridPanel.ensureColumnVisible(key);
    };
    // Valid values for position are bottom, middle and top
    GridApi.prototype.ensureIndexVisible = function (index, position) {
        this.gridPanel.ensureIndexVisible(index, position);
    };
    // Valid values for position are bottom, middle and top
    GridApi.prototype.ensureNodeVisible = function (comparator, position) {
        this.gridCore.ensureNodeVisible(comparator, position);
    };
    GridApi.prototype.forEachLeafNode = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNode unless using normal row model');
        }
        this.inMemoryRowModel.forEachLeafNode(callback);
    };
    GridApi.prototype.forEachNode = function (callback) {
        this.rowModel.forEachNode(callback);
    };
    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNodeAfterFilter unless using normal row model');
        }
        this.inMemoryRowModel.forEachNodeAfterFilter(callback);
    };
    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
        if (utils_1.Utils.missing(this.inMemoryRowModel)) {
            console.log('cannot call forEachNodeAfterFilterAndSort unless using normal row model');
        }
        this.inMemoryRowModel.forEachNodeAfterFilterAndSort(callback);
    };
    GridApi.prototype.getFilterApiForColDef = function (colDef) {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
        return this.getFilterInstance(colDef);
    };
    GridApi.prototype.getFilterInstance = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.getFilterComponent(column).resolveNow(null, function (filterComp) { return filterComp; });
        }
    };
    GridApi.prototype.getFilterApi = function (key) {
        console.warn('ag-Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    };
    GridApi.prototype.destroyFilter = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column);
        }
    };
    GridApi.prototype.getColumnDef = function (key) {
        var column = this.columnController.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        else {
            return null;
        }
    };
    GridApi.prototype.onFilterChanged = function () {
        this.filterManager.onFilterChanged();
    };
    GridApi.prototype.onSortChanged = function () {
        this.sortController.onSortChanged();
    };
    GridApi.prototype.setSortModel = function (sortModel) {
        this.sortController.setSortModel(sortModel);
    };
    GridApi.prototype.getSortModel = function () {
        return this.sortController.getSortModel();
    };
    GridApi.prototype.setFilterModel = function (model) {
        this.filterManager.setFilterModel(model);
    };
    GridApi.prototype.getFilterModel = function () {
        return this.filterManager.getFilterModel();
    };
    GridApi.prototype.getFocusedCell = function () {
        return this.focusedCellController.getFocusedCell();
    };
    GridApi.prototype.clearFocusedCell = function () {
        return this.focusedCellController.clearFocusedCell();
    };
    GridApi.prototype.setFocusedCell = function (rowIndex, colKey, floating) {
        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating, true);
    };
    GridApi.prototype.setHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    };
    GridApi.prototype.setGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    };
    GridApi.prototype.setFloatingFiltersHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
        this.doLayout();
    };
    GridApi.prototype.setPivotGroupHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    };
    GridApi.prototype.setPivotHeaderHeight = function (headerHeight) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
        this.doLayout();
    };
    GridApi.prototype.showToolPanel = function (show) {
        this.gridCore.showToolPanel(show);
    };
    GridApi.prototype.isToolPanelShowing = function () {
        return this.gridCore.isToolPanelShowing();
    };
    GridApi.prototype.doLayout = function () {
        this.gridCore.doLayout();
        // if the column is not visible, then made visible, it will be right size, but the
        // correct virtual columns will not be displayed. the setLeftAndRightBounds() gets
        // called when size changes. however when size is not changed, then wrong cols are shown.
        // this was to fix https://ag-grid.atlassian.net/browse/AG-1081
        this.gridPanel.setLeftAndRightBounds();
    };
    GridApi.prototype.resetRowHeights = function () {
        if (utils_1.Utils.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.resetRowHeights();
        }
    };
    GridApi.prototype.setGroupRemoveSingleChildren = function (value) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    };
    GridApi.prototype.setGroupRemoveLowestSingleChildren = function (value) {
        this.gridOptionsWrapper.setProperty(gridOptionsWrapper_1.GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    };
    GridApi.prototype.onRowHeightChanged = function () {
        if (utils_1.Utils.exists(this.inMemoryRowModel)) {
            this.inMemoryRowModel.onRowHeightChanged();
        }
    };
    GridApi.prototype.getValue = function (colKey, rowNode) {
        var column = this.columnController.getPrimaryColumn(colKey);
        if (utils_1.Utils.missing(column)) {
            column = this.columnController.getGridColumn(colKey);
        }
        if (utils_1.Utils.missing(column)) {
            return null;
        }
        else {
            return this.valueService.getValue(column, rowNode);
        }
    };
    GridApi.prototype.addEventListener = function (eventType, listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    };
    GridApi.prototype.addGlobalListener = function (listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    };
    GridApi.prototype.removeEventListener = function (eventType, listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    };
    GridApi.prototype.removeGlobalListener = function (listener) {
        var async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    };
    GridApi.prototype.dispatchEvent = function (event) {
        this.eventService.dispatchEvent(event);
    };
    GridApi.prototype.destroy = function () {
        this.context.destroy();
    };
    GridApi.prototype.resetQuickFilter = function () {
        this.rowModel.forEachNode(function (node) { return node.quickFilterAggregateText = null; });
    };
    GridApi.prototype.getRangeSelections = function () {
        if (this.rangeController) {
            return this.rangeController.getCellRanges();
        }
        else {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
            return null;
        }
    };
    GridApi.prototype.camelCaseToHumanReadable = function (camelCase) {
        return utils_1.Utils.camelCaseToHumanText(camelCase);
    };
    GridApi.prototype.addRangeSelection = function (rangeSelection) {
        if (!this.rangeController) {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
        }
        this.rangeController.addRange(rangeSelection);
    };
    GridApi.prototype.clearRangeSelection = function () {
        if (!this.rangeController) {
            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
        }
        this.rangeController.clearSelection();
    };
    GridApi.prototype.copySelectedRowsToClipboard = function (includeHeader, columnKeys) {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copySelectedRowsToClipboard(includeHeader, columnKeys);
    };
    GridApi.prototype.copySelectedRangeToClipboard = function (includeHeader) {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copySelectedRangeToClipboard(includeHeader);
    };
    GridApi.prototype.copySelectedRangeDown = function () {
        if (!this.clipboardService) {
            console.warn('ag-Grid: clipboard is only available in ag-Grid Enterprise');
        }
        this.clipboardService.copyRangeDown();
    };
    GridApi.prototype.showColumnMenuAfterButtonClick = function (colKey, buttonElement) {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    };
    GridApi.prototype.showColumnMenuAfterMouseClick = function (colKey, mouseEvent) {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    };
    GridApi.prototype.tabToNextCell = function () {
        return this.rowRenderer.tabToNextCell(false);
    };
    GridApi.prototype.tabToPreviousCell = function () {
        return this.rowRenderer.tabToNextCell(true);
    };
    GridApi.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.rowRenderer.stopEditing(cancel);
    };
    GridApi.prototype.startEditingCell = function (params) {
        var column = this.columnController.getGridColumn(params.colKey);
        if (!column) {
            console.warn("ag-Grid: no column found for " + params.colKey);
            return;
        }
        var gridCellDef = {
            rowIndex: params.rowIndex,
            floating: params.rowPinned,
            column: column
        };
        var gridCell = new gridCell_1.GridCell(gridCellDef);
        var notPinned = utils_1.Utils.missing(params.rowPinned);
        if (notPinned) {
            this.gridPanel.ensureIndexVisible(params.rowIndex);
        }
        this.rowRenderer.startEditingCell(gridCell, params.keyPress, params.charPress);
    };
    GridApi.prototype.addAggFunc = function (key, aggFunc) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    };
    GridApi.prototype.addAggFuncs = function (aggFuncs) {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    };
    GridApi.prototype.clearAggFuncs = function () {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    };
    GridApi.prototype.updateRowData = function (rowDataTransaction) {
        var res = null;
        if (this.inMemoryRowModel) {
            res = this.inMemoryRowModel.updateRowData(rowDataTransaction);
        }
        else if (this.infinitePageRowModel) {
            this.infinitePageRowModel.updateRowData(rowDataTransaction);
        }
        else {
            console.error('ag-Grid: updateRowData() only works with InMemoryRowModel and InfiniteRowModel.');
        }
        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }
        return res;
    };
    GridApi.prototype.insertItemsAtIndex = function (index, items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('ag-Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: index, update: null, remove: null });
    };
    GridApi.prototype.removeItems = function (rowNodes, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('ag-Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        var dataToRemove = rowNodes.map(function (rowNode) { return rowNode.data; });
        this.updateRowData({ add: null, addIndex: null, update: null, remove: dataToRemove });
    };
    GridApi.prototype.addItems = function (items, skipRefresh) {
        if (skipRefresh === void 0) { skipRefresh = false; }
        console.warn('ag-Grid: addItems() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: null, update: null, remove: null });
    };
    GridApi.prototype.refreshVirtualPageCache = function () {
        console.warn('ag-Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    };
    GridApi.prototype.refreshInfinitePageCache = function () {
        console.warn('ag-Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    };
    GridApi.prototype.refreshInfiniteCache = function () {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.refreshCache();
        }
        else {
            console.warn("ag-Grid: api.refreshInfiniteCache is only available when rowModelType='infinite'.");
        }
    };
    GridApi.prototype.purgeVirtualPageCache = function () {
        console.warn('ag-Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfinitePageCache();
    };
    GridApi.prototype.purgeInfinitePageCache = function () {
        console.warn('ag-Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfiniteCache();
    };
    GridApi.prototype.purgeInfiniteCache = function () {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.purgeCache();
        }
        else {
            console.warn("ag-Grid: api.purgeInfiniteCache is only available when rowModelType='infinite'.");
        }
    };
    GridApi.prototype.purgeEnterpriseCache = function (route) {
        if (this.enterpriseRowModel) {
            this.enterpriseRowModel.purgeCache(route);
        }
        else {
            console.warn("ag-Grid: api.purgeEnterpriseCache is only available when rowModelType='enterprise'.");
        }
    };
    GridApi.prototype.getVirtualRowCount = function () {
        console.warn('ag-Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    };
    GridApi.prototype.getInfiniteRowCount = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getVirtualRowCount();
        }
        else {
            console.warn("ag-Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.isMaxRowFound = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.isMaxRowFound();
        }
        else {
            console.warn("ag-Grid: api.isMaxRowFound is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.setVirtualRowCount = function (rowCount, maxRowFound) {
        console.warn('ag-Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setInfiniteRowCount(rowCount, maxRowFound);
    };
    GridApi.prototype.setInfiniteRowCount = function (rowCount, maxRowFound) {
        if (this.infinitePageRowModel) {
            this.infinitePageRowModel.setVirtualRowCount(rowCount, maxRowFound);
        }
        else {
            console.warn("ag-Grid: api.setVirtualRowCount is only available when rowModelType='virtual'.");
        }
    };
    GridApi.prototype.getVirtualPageState = function () {
        console.warn('ag-Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    };
    GridApi.prototype.getInfinitePageState = function () {
        console.warn('ag-Grid: getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    };
    GridApi.prototype.getCacheBlockState = function () {
        if (this.infinitePageRowModel) {
            return this.infinitePageRowModel.getBlockState();
        }
        else if (this.enterpriseRowModel) {
            return this.enterpriseRowModel.getBlockState();
        }
        else {
            console.warn("ag-Grid: api.getCacheBlockState() is only available when rowModelType='infinite' or rowModelType='enterprise'.");
        }
    };
    GridApi.prototype.checkGridSize = function () {
        this.gridPanel.setBodyAndHeaderHeights();
    };
    GridApi.prototype.getFirstRenderedRow = function () {
        console.log('in ag-Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    };
    GridApi.prototype.getFirstDisplayedRow = function () {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    };
    GridApi.prototype.getLastRenderedRow = function () {
        console.log('in ag-Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
    };
    GridApi.prototype.getLastDisplayedRow = function () {
        return this.rowRenderer.getLastVirtualRenderedRow();
    };
    GridApi.prototype.getDisplayedRowAtIndex = function (index) {
        return this.rowModel.getRow(index);
    };
    GridApi.prototype.getDisplayedRowCount = function () {
        return this.rowModel.getRowCount();
    };
    GridApi.prototype.paginationIsLastPageFound = function () {
        return this.paginationProxy.isLastPageFound();
    };
    GridApi.prototype.paginationGetPageSize = function () {
        return this.paginationProxy.getPageSize();
    };
    GridApi.prototype.paginationSetPageSize = function (size) {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    };
    GridApi.prototype.paginationGetCurrentPage = function () {
        return this.paginationProxy.getCurrentPage();
    };
    GridApi.prototype.paginationGetTotalPages = function () {
        return this.paginationProxy.getTotalPages();
    };
    GridApi.prototype.paginationGetRowCount = function () {
        return this.paginationProxy.getTotalRowCount();
    };
    GridApi.prototype.paginationGoToNextPage = function () {
        this.paginationProxy.goToNextPage();
    };
    GridApi.prototype.paginationGoToPreviousPage = function () {
        this.paginationProxy.goToPreviousPage();
    };
    GridApi.prototype.paginationGoToFirstPage = function () {
        this.paginationProxy.goToFirstPage();
    };
    GridApi.prototype.paginationGoToLastPage = function () {
        this.paginationProxy.goToLastPage();
    };
    GridApi.prototype.paginationGoToPage = function (page) {
        this.paginationProxy.goToPage(page);
    };
    __decorate([
        context_1.Autowired('immutableService'),
        __metadata("design:type", immutableService_1.ImmutableService)
    ], GridApi.prototype, "immutableService", void 0);
    __decorate([
        context_1.Autowired('csvCreator'),
        __metadata("design:type", csvCreator_1.CsvCreator)
    ], GridApi.prototype, "csvCreator", void 0);
    __decorate([
        context_1.Optional('excelCreator'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "excelCreator", void 0);
    __decorate([
        context_1.Autowired('gridCore'),
        __metadata("design:type", gridCore_1.GridCore)
    ], GridApi.prototype, "gridCore", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], GridApi.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('headerRenderer'),
        __metadata("design:type", headerRenderer_1.HeaderRenderer)
    ], GridApi.prototype, "headerRenderer", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], GridApi.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], GridApi.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], GridApi.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridApi.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], GridApi.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], GridApi.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('alignedGridsService'),
        __metadata("design:type", alignedGridsService_1.AlignedGridsService)
    ], GridApi.prototype, "alignedGridsService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], GridApi.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], GridApi.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], GridApi.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], GridApi.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], GridApi.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], GridApi.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "rangeController", void 0);
    __decorate([
        context_1.Optional('clipboardService'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "clipboardService", void 0);
    __decorate([
        context_1.Optional('aggFuncService'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "aggFuncService", void 0);
    __decorate([
        context_1.Autowired('menuFactory'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('cellRendererFactory'),
        __metadata("design:type", cellRendererFactory_1.CellRendererFactory)
    ], GridApi.prototype, "cellRendererFactory", void 0);
    __decorate([
        context_1.Autowired('cellEditorFactory'),
        __metadata("design:type", cellEditorFactory_1.CellEditorFactory)
    ], GridApi.prototype, "cellEditorFactory", void 0);
    __decorate([
        context_1.Autowired('valueCache'),
        __metadata("design:type", valueCache_1.ValueCache)
    ], GridApi.prototype, "valueCache", void 0);
    __decorate([
        context_1.Optional('toolPanel'),
        __metadata("design:type", Object)
    ], GridApi.prototype, "toolPanel", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridApi.prototype, "init", null);
    GridApi = __decorate([
        context_1.Bean('gridApi')
    ], GridApi);
    return GridApi;
}());
exports.GridApi = GridApi;
