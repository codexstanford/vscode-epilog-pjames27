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
const definition_provider_1 = require("./definition-provider");
const language_ids_js_1 = require("../../common/out/language_ids.js");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
const documentASTsAndInfo = new Map();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let hasSemanticTokensCapability = false;
let hasDefinitionCapability = false;
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
    hasDefinitionCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.definition);
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
    if (hasDefinitionCapability) {
        serverCapabilities.definitionProvider = true;
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
    documentASTsAndInfo.clear();
});
connection.onDidChangeWatchedFiles(event => {
    documents.all().forEach(validateTextDocument);
    event.changes.forEach(change => {
        // Clear diagnostics for deleted files. Doesn't handle when their containing folder is deleted.
        if (change.type === node_1.FileChangeType.Deleted) {
            connection.sendDiagnostics({ uri: change.uri, diagnostics: [] });
            documentASTsAndInfo.delete(change.uri);
        }
    });
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
    const astAndInfo = (0, parsing_1.computeASTAndInfo)(change.document);
    if (astAndInfo) {
        documentASTsAndInfo.set(change.document.uri, astAndInfo);
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
    const astAndInfo = documentASTsAndInfo.get(params.textDocument.uri);
    if (!document) {
        return {
            data: []
        };
    }
    if (!astAndInfo) {
        console.error('No AST and info found for document: ', params.textDocument.uri);
        return {
            data: []
        };
    }
    console.log('Computing semantic tokens for document', document.uri);
    const semanticTokens = (0, semantic_tokens_1.computeSemanticTokens)(astAndInfo.ast, document.languageId, astAndInfo.info);
    return semanticTokens;
});
connection.onRequest("textDocument/definition", (params) => {
    // Only provided for ruleset files
    const languageId = documents.get(params.textDocument.uri)?.languageId;
    if (languageId !== language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID) {
        return null;
    }
    const document = documents.get(params.textDocument.uri);
    const astAndInfo = documentASTsAndInfo.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    if (!astAndInfo) {
        console.error('Cannot return definition location - no AST and info found for document: ', params.textDocument.uri);
        return null;
    }
    const definition = (0, definition_provider_1.getViewPredicateDefinition)(astAndInfo.ast, params.position, astAndInfo.info.viewPredToDef);
    return definition;
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map