# appcc2oss 

一个oss上传任务插件，管理任务并执行上传任务的插件。

## 使用帮助

### 配置OSS参数
在Vscode的Explorer窗口中找到'OSS UPLOAD TASK'界面，点击右上角设置图标，设置必要的OSS参数。如下：

![setting](https://raw.githubusercontent.com/timooabc/appcc2oss/main/setting.png)

### 创建任务
右击工作空间中的需要上传到oss的文件夹，选择菜单'Oss: Add Upload Task'，并输入远程目录后回车即可。

### 执行任务（上传文件到OSS）
右击'OSS UPLOAD TASK'界面中的任意任务，选择'Upload'，开始上传。

### 删除任务
右击'OSS UPLOAD TASK'界面中的任意任务，选择'Delete'。

### 拷贝连接
右击'OSS UPLOAD TASK'界面中的任意任务，选择'Copy Link'。

## 0.0.2
完成基本功能

## 0.0.3
支持任务上传完成后调用webhooks

## 0.0.4
webhooks支持关键字的替换：
- 替换```{remoteUrl}``` 为任务的Url
- 替换```{subUrl}``` 为任务相对customDomain的子路径

修复任务创建后修改customDomain配置项的bug。

## 0.0.5
修改task数据的存储位置到当前工作空间，方便数据的版本控制和多人协作。

**Enjoy!**
