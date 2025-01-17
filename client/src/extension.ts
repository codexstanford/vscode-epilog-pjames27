/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import * as vscode from 'vscode';
import * as epilog_js from '../../common/out/plain-js/epilog.js';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';

import { epilogCmd_runScript } from './commands/epilog_runScript';
import { epilogCmd_consolidate } from './commands/epilog_consolidate';
import { EPILOG_RULESET_LANGUAGE_ID, EPILOG_DATASET_LANGUAGE_ID, EPILOG_METADATA_LANGUAGE_ID, EPILOG_SCRIPT_LANGUAGE_ID, EPILOG_BUILD_LANGUAGE_ID } from '../../common/out/language_ids.js';
import { setDebugChannel } from './debugChannel.js';

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
			{ scheme: 'file', language: EPILOG_RULESET_LANGUAGE_ID },
			{ scheme: 'file', language: EPILOG_DATASET_LANGUAGE_ID },
			{ scheme: 'file', language: EPILOG_METADATA_LANGUAGE_ID },
			{ scheme: 'file', language: EPILOG_SCRIPT_LANGUAGE_ID },
			{ scheme: 'file', language: EPILOG_BUILD_LANGUAGE_ID }
		],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher('**/*.{hdf,hrf,metadata,epilogscript,epilogbuild}'),
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
		epilog_js.setTraceOutputFunc(client.outputChannel.appendLine);
		epilogCmd_runScript(client);
	});

	let disposable2 = vscode.commands.registerCommand('epilog.consolidate', () => {
		epilogCmd_consolidate(client);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	// Start the client. This will also launch the server
	client.start();
	setDebugChannel(vscode.window.createOutputChannel('Epilog Language Server - Debug'));
	console.log("client started");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
