import { ext } from '../ExtensionVariables';
import * as vscode from 'vscode';
import { getConfiguration, getFiles } from '../utils/Index';
import Logger from '../utils/Log';
import * as Path from 'path';
import * as fs from 'fs';

export type TaskMode = {
    path:string,
    remote:string,
    domainRoot:string,
    lastOperateTime:number,
    createTime:number,
    versions:{
        desc:string,
        time:number,
        files:string[],
    }[],
};

const LIST_KEY:string = "acoss.task.list";

export class Task{
    private static _map:Map<string, TaskMode>;

    static get map():Map<string, TaskMode>{
        if(Task._map){
            return Task._map;
        }
        Task._map = new Map();
        if(!vscode.workspace.workspaceFolders){
            return Task._map;
        }
        let domainRoot = getConfiguration().customDomain + "/";
        let workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const filePath = Path.join(workspaceRoot, '.osstasks');
        let data:any[] = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : (ext.context.workspaceState.get(LIST_KEY) || []);
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if(!item['domainRoot']){
                item['domainRoot'] = domainRoot;
            }
            if(item.path.includes(":")){
                item.path = Path.relative(workspaceRoot, item.path);
            }
            const task:TaskMode = item as TaskMode;
            Task._map.set(task.remote, task);
        }
        return Task._map;
    }

    static get list():TaskMode[]{
        let result:TaskMode[] = Array.from(Task.map.values());
        result.sort((a, b)=>{
            return a.createTime - b.createTime;
        });
        return result;
    }

    static updateTaskMap():void{
        if(!vscode.workspace.workspaceFolders){
            return;
        }
        const filePath = Path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, '.osstasks');
        fs.writeFileSync(filePath, JSON.stringify(Task.list, null, 4), 'utf-8');
        // ext.context.workspaceState.update(LIST_KEY, Task.list);
        console.log("updateTaskMap:", ext.context.workspaceState.get(LIST_KEY));
    }

    static add(path:string, remote:string, domainRoot:string):TaskMode|null{
        if(!vscode.workspace.workspaceFolders){
            return null;
        }
        if(Task.map.has(remote)){
            Logger.showErrorMessage("添加任务失败：已存在相同的任务");
            return null;
        }
        let workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
        let task:TaskMode = {
            path:Path.relative(workspaceRoot, path),
            remote:remote,
            domainRoot:domainRoot,
            createTime: Date.now(),
            lastOperateTime: 0,
            versions:[]
        };
        Task.map.set(remote, task);
        Task.updateTaskMap();
        ext.view.refresh();
        return task;
    }

    static remove(remote:string):boolean{
        let result:boolean = Task.map.delete(remote);
        if(result){
            Task.updateTaskMap();
            ext.view.refresh();
        }
        return result;
    }
}