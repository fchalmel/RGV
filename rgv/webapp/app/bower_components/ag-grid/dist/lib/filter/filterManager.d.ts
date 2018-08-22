// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ExternalPromise, Promise } from "../utils";
import { Column } from "../entities/column";
import { IFilterComp } from "../interfaces/iFilter";
export declare class FilterManager {
    private $compile;
    private $scope;
    private gridOptionsWrapper;
    private gridCore;
    private popupService;
    private valueService;
    private columnController;
    private rowModel;
    private eventService;
    private enterprise;
    private context;
    private columnApi;
    private gridApi;
    private componentResolver;
    static QUICK_FILTER_SEPARATOR: string;
    private allFilters;
    private quickFilter;
    private advancedFilterPresent;
    private externalFilterPresent;
    init(): void;
    setFilterModel(model: any): void;
    private setModelOnFilterWrapper(filterPromise, newModel);
    getFilterModel(): any;
    isAdvancedFilterPresent(): boolean;
    private setAdvancedFilterPresent();
    private updateFilterFlagInColumns();
    isAnyFilterPresent(): boolean;
    private doesFilterPass(node, filterToSkip?);
    private parseQuickFilter(newFilter);
    setQuickFilter(newFilter: any): void;
    private checkExternalFilter();
    onFilterChanged(): void;
    isQuickFilterPresent(): boolean;
    doesRowPassOtherFilters(filterToSkip: any, node: any): boolean;
    private doesRowPassQuickFilterNoCache(node);
    private doesRowPassQuickFilterCache(node);
    private doesRowPassQuickFilter(node);
    doesRowPassFilter(node: any, filterToSkip?: any): boolean;
    private getQuickFilterTextForColumn(column, rowNode);
    private aggregateRowForQuickFilter(node);
    private onNewRowsLoaded();
    private createValueGetter(column);
    getFilterComponent(column: Column): Promise<IFilterComp>;
    getOrCreateFilterWrapper(column: Column): FilterWrapper;
    cachedFilter(column: Column): FilterWrapper;
    private createFilterInstance(column, $scope);
    private createFilterWrapper(column);
    private putIntoGui(filterWrapper);
    private onNewColumnsLoaded();
    destroyFilter(column: Column): void;
    private disposeFilterWrapper(filterWrapper);
    destroy(): void;
}
export interface FilterWrapper {
    column: Column;
    filterPromise: Promise<IFilterComp>;
    scope: any;
    guiPromise: ExternalPromise<HTMLElement>;
}
