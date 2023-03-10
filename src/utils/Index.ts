import * as vscode from 'vscode';
import * as OSS from 'ali-oss';
import * as fs from 'fs';
import * as path from 'path';

export type ExtensionConfig = {
    accessKeyId:string,
    accessKeySecret:string,
    customDomain:string,
    region?:string,
    bucket?:string,
    webhooks?:string[],
} & OSS.Options;

/**
 * 获取插件配置
 * @returns 
 */
export function getConfiguration():ExtensionConfig{
    const config = vscode.workspace.getConfiguration("acoss");
    const aliyunConfig = config.get<ExtensionConfig>('aliyun', {
        accessKeyId:"",
        accessKeySecret:"",
        customDomain:"",
        region:"",
        bucket:"",
        webhooks:[],
    });
    return {
        accessKeyId: aliyunConfig.accessKeyId,
        accessKeySecret: aliyunConfig.accessKeySecret,
        customDomain: aliyunConfig.customDomain,
        secure: true,
        region: aliyunConfig.region,
        bucket: aliyunConfig.bucket,
        webhooks: aliyunConfig.webhooks
    };
}

export interface Progress {
    progress: vscode.Progress<{ message?: string; increment?: number }>
    progressResolve: (value?: unknown) => void
    progressReject: (value?: unknown) => void
  }

export function getProgress(title = 'Uploading object'): Progress {
    let progressResolve, progressReject, progress;
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title
      },
      (p) => {
        return new Promise((resolve, reject) => {
          progressResolve = resolve;
          progressReject = reject;
          progress = p;
        });
      }
    );
    if (!progress || !progressResolve || !progressReject){
      throw new Error('Failed to init vscode progress');
    }
    return {
      progress,
      progressResolve,
      progressReject
    };
}

export function getFiles(root:string):string[]{
    let result:string[] = [];
    let files = fs.readdirSync(root, {withFileTypes:true});
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(root, file.name);
        if (file.isDirectory()){
            result.push(...getFiles(filePath));
        }else{
            result.push(filePath);
        } 
    }
    return result;
}

/**
 * 获取项目名称，优先取工作空间中project.json中的name字段，不存在则取工作空间的文件夹名称。
 * @returns 
 */
export function getProjectName():string{
    if(vscode.workspace.workspaceFolders){
        let workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        let projectPath = path.join(workspaceRoot, "project.json");
        if(fs.existsSync(projectPath)){
            let content = fs.readFileSync(projectPath, {encoding:"utf-8"});
            let contentObj = JSON.parse(content);
            return contentObj.name || path.basename(workspaceRoot);
        }
        return path.basename(workspaceRoot);
    }
    return "";
}