"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const diagnostics_1 = require("./diagnostics");
const semantic_tokens_1 = require("./semantic-tokens");
const parsing_1 = require("./parsing");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
const documentASTs = new Map();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let hasSemanticTokensCapability = false;
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    hasSemanticTokensCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.semanticTokens);
    const serverCapabilities = {
        textDocumentSync: node_1.TextDocumentSyncKind.Incremental
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
            legend: semantic_tokens_1.semanticTokensLegend,
            full: true
        };
    }
    const result = {
        capabilities: serverCapabilities
    };
    return result;
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
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
        if (change.type === node_1.FileChangeType.Deleted) {
            connection.sendDiagnostics({ uri: change.uri, diagnostics: [] });
            documentASTs.delete(change.uri);
        }
    });
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
    const ast = (0, parsing_1.parseToAST)(change.document);
    if (ast) {
        documentASTs.set(change.document.uri, ast);
    }
});
async function validateTextDocument(textDocument) {
    const diagnostics = (0, diagnostics_1.getDiagnostics)(textDocument);
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
connection.onRequest("textDocument/semanticTokens/full", (params) => {
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
    const semanticTokens = (0, semantic_tokens_1.computeSemanticTokens)(ast, document.languageId);
    return semanticTokens;
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map