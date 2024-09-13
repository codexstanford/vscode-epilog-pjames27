/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';

import { epilogCmd_runScript } from './commands/epilog_runScript';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { 
			module: serverModule, 
			transport: TransportKind.ipc 
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	
	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for epilog documents
		documentSelector: [
			{ scheme: 'file', language: 'epilog' },
			{ scheme: 'file', language: 'epilog-ruleset' },
			{ scheme: 'file', language: 'epilog-dataset' },
			{ scheme: 'file', language: 'epilog-metadata' },
			{ scheme: 'file', language: 'epilog-script' }
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		outputChannel: vscode.window.createOutputChannel('Epilog Language Server')
	};
	
	// Create the language client and start the client.
	client = new LanguageClient(
		'epilogLanguageServer',
		'Epilog Language Server',
		serverOptions,
		clientOptions
	);
	
	let disposable = vscode.commands.registerCommand('epilog.runScript', () => {
		epilogCmd_runScript(client);
	});

	context.subscriptions.push(disposable);
	
	// Start the client. This will also launch the server
	client.start();
	console.log("client started");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
