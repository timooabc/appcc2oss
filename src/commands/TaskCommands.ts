import * as vscode from "vscode";
import * as path from 'path';
import Uploader from "../uploader/Uploader";
import * as fs from 'fs';
import { Task, TaskMode } from "../uploader/Task";
import { ExtensionConfig, getConfiguration, getProjectName } from "../utils/Index";
import { ext } from "../ExtensionVariables";
import Logger from "../utils/Log";

export async function addUploadTask(uri: vscode.Uri):Promise<void>{
    let config:ExtensionConfig = getConfiguration();
    let box:vscode.InputBox = vscode.window.createInputBox();
    box.placeholder = "somePath or press 'Enter' for root";
    box.title = "请输入【" + path.basename(uri.fsPath) + "】的远程目标目录";
    box.prompt = `${config.customDomain}/${getProjectName()}/somePath`;
    box.onDidChangeValue((e)=>{
        box.prompt = `${config.customDomain}/${getProjectName()}/${e}`;
    });
    box.onDidAccept(()=>{
        box.hide();
        let remote = `${config.customDomain}/${getProjectName()}` + (box.value ? `/${box.value}` : "");
        let task:TaskMode|null = Task.add(uri.fsPath, remote);
        task && vscode.window.showInformationMessage(`${task.remote} 任务添加成功。`);
    });
    box.show();

    // Uploader.get()?.putDir(uri);
}

export async function deleteUploadTask(target:TaskMode) {
    let result:boolean = Task.remove(target.remote);
    if(result){
        Logger.showInformationMessage("删除成功。");
    }
}

export async function startUploadTask(target:TaskMode):Promise<void>{
    console.log(`upload${target.path}to${target.remote}`);
    Uploader.get()?.putDir(target);
}

export async function copyRemoteLink(target:TaskMode):Promise<void>{
    vscode.env.clipboard.writeText(target.remote);
    Logger.showInformationMessage("拷贝成功。");
}