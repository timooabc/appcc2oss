import * as vscode from "vscode";
import * as path from 'path';
import { Task, TaskMode } from "../uploader/Task";
import { getConfiguration, getFiles } from "../utils/Index";

export class OssProvider implements vscode.TreeDataProvider<TaskMode>{
    private _onDidChangeTreeData: vscode.EventEmitter<TaskMode | undefined | void> = new vscode.EventEmitter<TaskMode | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TaskMode | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string | undefined) {

	}

    getTreeItem(element: TaskMode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return new TaskItem(element);
    }

    getChildren(element?: TaskMode | undefined): vscode.ProviderResult<TaskMode[]> {
        // if(!element){
            return Task.list;
        // }else{
        //     return element.versions;
        // }
    }

    getParent?(element: TaskMode): vscode.ProviderResult<TaskMode> {
        throw new Error("Method not implemented.");
    }

    resolveTreeItem?(item: vscode.TreeItem, element: TaskMode, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }

    refresh(){
        this._onDidChangeTreeData.fire();
    }

}

export class TaskItem extends vscode.TreeItem {
	iconPath = new vscode.ThemeIcon("cloud");
    contextValue = "task";

    constructor(public readonly mode:TaskMode) {
		super(TaskItem.getLabel(mode));
		this.description = 
        this.mode.lastOperateTime ? 
        `uploaded ${new Date(this.mode.lastOperateTime).toLocaleString()}` : 
        `created ${new Date(this.mode.createTime).toLocaleString()}`;
	}
    
    static getLabel(mode:TaskMode):string{
        return `【${mode.remote.replace(mode.domainRoot, "")}】${path.basename(mode.path)}`;
    }
}