"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_EXTENSION_TO_LANGUAGE_ID = exports.LANGUAGE_ID_TO_FILE_EXTENSION = exports.EPILOG_SCRIPT_LANGUAGE_ID = exports.EPILOG_METADATA_LANGUAGE_ID = exports.EPILOG_DATASET_LANGUAGE_ID = exports.EPILOG_RULESET_LANGUAGE_ID = exports.EPILOG_LANGUAGE_ID = void 0;
exports.EPILOG_LANGUAGE_ID = "epilog";
exports.EPILOG_RULESET_LANGUAGE_ID = "epilog-ruleset";
exports.EPILOG_DATASET_LANGUAGE_ID = "epilog-dataset";
exports.EPILOG_METADATA_LANGUAGE_ID = "epilog-metadata";
exports.EPILOG_SCRIPT_LANGUAGE_ID = "epilog-script";
exports.LANGUAGE_ID_TO_FILE_EXTENSION = new Map([
    [exports.EPILOG_LANGUAGE_ID, ".epilog"],
    [exports.EPILOG_RULESET_LANGUAGE_ID, ".hrf"],
    [exports.EPILOG_DATASET_LANGUAGE_ID, ".hdf"],
    [exports.EPILOG_METADATA_LANGUAGE_ID, ".metadata"],
    [exports.EPILOG_SCRIPT_LANGUAGE_ID, ".epilogscript"]
]);
// Reverse of the LANGUAGE_ID_TO_FILE_EXTENSION map
exports.FILE_EXTENSION_TO_LANGUAGE_ID = new Map(Array.from(exports.LANGUAGE_ID_TO_FILE_EXTENSION.entries()).map(([languageId, extension]) => [extension, languageId]));
//# sourceMappingURL=language_ids.js.map