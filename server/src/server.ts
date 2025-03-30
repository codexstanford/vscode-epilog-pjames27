/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	TextDocumentSyncKind,
	InitializeResult,
	FileChangeType,
	ServerCapabilities,
	SemanticTokensParams
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import {getDiagnostics} from './diagnostics';
import {semanticTokensLegend, computeSemanticTokens} from './semantic-tokens';
import { ParserObject as AST } from './lexers-parsers-types';
import { parseToAST } from './parsing';
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const documentASTs: Map<string, AST> = new Map();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let hasSemanticTokensCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);
	hasSemanticTokensCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.semanticTokens
	);

	const serverCapabilities: ServerCapabilities = {
		textDocumentSync: TextDocumentSyncKind.Incremental
	};

	if (hasWorkspaceFolderCapability) {
		serverCapabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}

	if (hasSemanticTokensCapability) {
		serverCapabilities.semanticTokensProvider = {
			legend: semanticTokensLegend,
			full: true
		};
	}

	const result: InitializeResult = {
		capabilities: serverCapabilities
	};
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});



connection.onDidChangeConfiguration(change => {
	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
	// Clear the document ASTs
	documentASTs.clear();
});

connection.onDidChangeWatchedFiles(event => {
	documents.all().forEach(validateTextDocument);
	event.changes.forEach(change => {
		// Clear diagnostics for deleted files. Doesn't handle when their containing folder is deleted.
		if (change.type === FileChangeType.Deleted) {
			connection.sendDiagnostics({ uri: change.uri, diagnostics: [] });
			documentASTs.delete(change.uri);
		}
	});
});


// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
	const ast = parseToAST(change.document);
	if (ast) {
		documentASTs.set(change.document.uri, ast);
	}
});


async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	const diagnostics = getDiagnostics(textDocument);
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onRequest("textDocument/semanticTokens/full", (params: SemanticTokensParams) => {
	// Implement your logic to provide semantic tokens for the given document here.
	// You should return the semantic tokens as a response.
	const document = documents.get(params.textDocument.uri);
	const ast = documentASTs.get(params.textDocument.uri);
	if (!document) {
		return {
			data: []
		};
	}
	if (!ast) {
		console.error('No AST found for document: ', params.textDocument.uri);
		return {
			data: []
		};
	}
	console.log('Computing semantic tokens for document', document.uri);
	const semanticTokens = computeSemanticTokens(ast, document.languageId);
	return semanticTokens;
  });

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
