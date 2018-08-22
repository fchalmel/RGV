import {RowNode} from "../entities/rowNode";
import {RowNodeTransaction} from "../rowModels/inMemory/inMemoryRowModel";
import {ChangedPath} from "../rowModels/inMemory/changedPath";

export interface StageExecuteParams {
    rowNode: RowNode;
    rowNodeTransaction?: RowNodeTransaction;
    rowNodeOrder?: {[id:string]:number};
    changedPath?: ChangedPath;
}

export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
