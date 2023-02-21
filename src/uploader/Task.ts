import { ext } from '../ExtensionVariables';
import { getConfiguration, getFiles } from '../utils/Index';
import Logger from '../utils/Log';

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
        let domainRoot = getConfiguration().customDomain + "/";
        let data:any[] = ext.context.workspaceState.get(LIST_KEY) || [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if(!item['domainRoot']){
                item['domainRoot'] = domainRoot;
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
        ext.context.workspaceState.update(LIST_KEY, Task.list);
        console.log("updateTaskMap:", ext.context.workspaceState.get(LIST_KEY));
    }

    static add(path:string, remote:string, domainRoot:string):TaskMode|null{
        if(Task.map.has(remote)){
            Logger.showErrorMessage("添加任务失败：已存在相同的任务");
            return null;
        }
        let task:TaskMode = {
            path:path, 
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