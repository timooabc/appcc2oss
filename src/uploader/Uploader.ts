import * as vscode from 'vscode';
import * as OSS from 'ali-oss';
import { getConfiguration, ExtensionConfig, getProgress, getFiles } from '../utils/Index';
import { ext } from '../ExtensionVariables';
import Logger from '../utils/Log';
import { Task, TaskMode } from './Task';

interface DeleteResponse {
  res: OSS.NormalSuccessResponse
}

interface WrapError extends Error {
    path: string
  }

export default class Uploader {
    private static cacheUploader: Uploader | null = null;
    private client: OSS;
    public expired: boolean;
    constructor() {
        this.client = new OSS(getConfiguration());
        this.expired = false;

        // instance is expired if configuration update
        ext.context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(() => {
                this.expired = true;
            })
        );
    }

  // singleton
    static get(): Uploader | null {
        let u;
        try {
            u = Uploader.cacheUploader && !Uploader.cacheUploader.expired ? Uploader.cacheUploader : (Uploader.cacheUploader = new Uploader());
        } catch (err:any) {
            // TODO: e.g.: require options.endpoint or options.region, how to corresponding to our vscode configuration?
            Logger.showErrorMessage(err.message);
            u = null;
        }
        return u;
    }

    async putDir(target:TaskMode){
        let filesList:string[] = getFiles(target.path);
        const { progress, progressResolve } = getProgress(`上传 ${filesList.length} 对象`);
        let finished:number = 0;
        let config = getConfiguration();
        const puts = filesList.map((value:string)=>{
            let filePath = target.remote.replace(config.customDomain + "/", "");
            filePath += value.replace(target.path, "").replace(/\\/g, "/");
            console.log("file", filePath);
            const u = this.put(filePath, value);
            u.then((putObjectResult) => {
                progress.report({
                    message: `(${++finished} / ${filesList.length})`,
                    increment: Math.ceil(100 / filesList.length)
                });
    
                return putObjectResult;
            }).catch((reason) => {
                reason.path = value;
                console.log("上传出错", reason);
            });
            return u;
        }, this);

        const settled = await Promise.allSettled(puts);
        const rejects:any[] = settled.filter((result) => {
            return result.status === 'rejected';
        });

        if (!rejects.length) {
            progress.report({message: '上传完成。'});
            target.lastOperateTime = Date.now();
            target.versions.push({
                time: target.lastOperateTime,
                desc: "",
                files: filesList
            })
            Task.updateTaskMap();
            ext.view.refresh();
            setTimeout(progressResolve.bind(this), 1000);
        } else {
            progress.report({message: `已上传${filesList.length - rejects.length} 个对象。`});
            setTimeout(() => {
                progressResolve();
                Logger.showErrorMessage(`上传失败 ${rejects.length} 对象。`);
        
                // show first error message
                Logger.showErrorMessage(rejects[0].reason.message + '. 在Console中查看更多信息');
        
                for (const r of rejects) {
                    Logger.log(`Failed: ${(r.reason as WrapError).path}. Reason: ${(r.reason as WrapError).message}`);
                }
            }, 1000);
        }
    }

    async put(name: string, fsPath: string, options?: OSS.PutObjectOptions): Promise<OSS.PutObjectResult> {
        return this.client.put(name, fsPath, options);
    }

    async delete(name: string, options?: OSS.RequestOptions): Promise<DeleteResponse> {
        // FIXME: @types/ali-oss bug, I will create pr
        return this.client.delete(name, options) as any;
    }

    async list(query: OSS.ListObjectsQuery, options: OSS.RequestOptions): Promise<OSS.ListObjectResult> {
        const defaultConfig = {
        //   'max-keys': this.configuration.maxKeys,
        delimiter: '/'
        };
        query = Object.assign(defaultConfig, query);
        return this.client.list(query, options);
    }

    async copy(name: string, sourceName: string, sourceBucket?: string, options?: OSS.CopyObjectOptions): Promise<OSS.CopyAndPutMetaResult> {
        return this.client.copy(name, sourceName, sourceBucket, options);
    }
}