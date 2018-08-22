// Type definitions for ag-grid v15.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "./entities/column";
export declare class SortController {
    private static DEFAULT_SORTING_ORDER;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private columnApi;
    private gridApi;
    progressSort(column: Column, multiSort: boolean): void;
    setSortForColumn(column: Column, sort: string, multiSort: boolean): void;
    onSortChanged(): void;
    private dispatchSortChangedEvents();
    private clearSortBarThisColumn(columnToSkip);
    private getNextSortDirection(column);
    getSortModel(): {
        colId: string;
        sort: string;
    }[];
    setSortModel(sortModel: any): void;
    private compareColIds(sortModelEntry, column);
    getColumnsWithSortingOrdered(): Column[];
    getSortForRowController(): any[];
}
