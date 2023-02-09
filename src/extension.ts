// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OssProvider } from './views/OssProvider';
import { openSettings } from './commands/OpenSetting';
import { addUploadTask, copyRemoteLink, deleteUploadTask, startUploadTask } from './commands/TaskCommands';
import { getConfiguration } from './utils/Index';
import { ext } from './ExtensionVariables';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	ext.context = context;
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
	? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	vscode.commands.executeCommand("setContext", "acoss.list", context.workspaceState.get("acoss.list"));

	// Samples of `window.registerTreeDataProvider`
	ext.view = new OssProvider(rootPath);
	vscode.window.registerTreeDataProvider("OSSManager_List", ext.view);

	vscode.commands.registerCommand('appcc2oss.setting', openSettings);
	vscode.commands.registerCommand('appcc2oss.addTask', addUploadTask);
	vscode.commands.registerCommand('appcc2oss.deleteTask', deleteUploadTask);
	vscode.commands.registerCommand('appcc2oss.copyLink', copyRemoteLink);
	vscode.commands.registerCommand('appcc2oss.upload', startUploadTask);



	const config = getConfiguration();
	if(!config.accessKeyId || !config.accessKeySecret){
		vscode.window.showErrorMessage('Please set accessKeyID、accessKeySecret in Settings at first');
	}

	// context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}