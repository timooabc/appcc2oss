import { getConfiguration } from "../utils/Index";
import Logger from "../utils/Log";
import { TaskMode } from "./Task";
import * as Url from 'url';
import * as FormData from 'form-data';
import fetch from "node-fetch";

export class WebHook {
    public static async request(task:TaskMode, index:number=0, cookie?:string){
        let config = getConfiguration();
        if(config.webhooks && config.webhooks.length > 0 && index < config.webhooks.length){
            let hook = config.webhooks[index];
            let taskSubPath = task.remote.replace(task.domainRoot, "");
            let _url = hook.replace(/{remoteUrl}/g, task.remote + "/")
                            .replace(/{subUrl}/g, taskSubPath + "/");
            //获取返回的url对象的query属性值 
            var arg = Url.parse(_url, true).query;
            let form = new FormData();
            if(arg){
                for (const key in arg) {
                    if (Object.prototype.hasOwnProperty.call(arg, key)) {
                        const element = arg[key];
                        form.append(key, element);
                    }
                }
            }
            return fetch(_url, !cookie ? {method: "POST", body: form} : {
                method: "POST",
                body: form,
                headers: { cookie: cookie },
            }).then(async (response)=>{
                let cookieParams = response.headers.raw()['set-cookie'];
                if(cookieParams){
                    let cookieArr:string[] = [];
                    for (const item of cookieParams) {
                        cookieArr.push(item.split(";")[0]);
                    }
                    cookie = cookieArr.join("; ");
                }
                return {result:await response.text(), cookie:cookie};
            })
            .then((response)=>{
                console.log("result:", response);
                // console.log(`完成 ${_url} 通知${JSON.stringify(response)}`);
                Logger.showInformationMessage(`通知Hooks:${index + 1}... done`);
                WebHook.request(task, ++index, response.cookie);
            });
        }
    }
}