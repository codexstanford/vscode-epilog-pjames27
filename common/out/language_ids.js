"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_EXTENSIONS_TO_LANGUAGE_ID = exports.EPILOG_SCRIPT_LANGUAGE_ID = exports.EPILOG_METADATA_LANGUAGE_ID = exports.EPILOG_DATASET_LANGUAGE_ID = exports.EPILOG_RULESET_LANGUAGE_ID = exports.EPILOG_LANGUAGE_ID = void 0;
exports.EPILOG_LANGUAGE_ID = "epilog";
exports.EPILOG_RULESET_LANGUAGE_ID = "epilog-ruleset";
exports.EPILOG_DATASET_LANGUAGE_ID = "epilog-dataset";
exports.EPILOG_METADATA_LANGUAGE_ID = "epilog-metadata";
exports.EPILOG_SCRIPT_LANGUAGE_ID = "epilog-script";
exports.FILE_EXTENSIONS_TO_LANGUAGE_ID = new Map([
    [".epilog", exports.EPILOG_LANGUAGE_ID],
    [".hrf", exports.EPILOG_RULESET_LANGUAGE_ID],
    [".hdf", exports.EPILOG_DATASET_LANGUAGE_ID],
    [".metadata", exports.EPILOG_METADATA_LANGUAGE_ID],
    [".epilogscript", exports.EPILOG_SCRIPT_LANGUAGE_ID]
]);
//# sourceMappingURL=language_ids.js.map