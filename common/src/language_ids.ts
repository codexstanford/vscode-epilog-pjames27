export const EPILOG_LANGUAGE_ID = "epilog";
export const EPILOG_RULESET_LANGUAGE_ID = "epilog-ruleset";
export const EPILOG_DATASET_LANGUAGE_ID = "epilog-dataset";
export const EPILOG_METADATA_LANGUAGE_ID = "epilog-metadata";
export const EPILOG_SCRIPT_LANGUAGE_ID = "epilog-script";

export const FILE_EXTENSIONS_TO_LANGUAGE_ID = new Map<string, string>([
    [".epilog", EPILOG_LANGUAGE_ID],
    [".hrf", EPILOG_RULESET_LANGUAGE_ID],
    [".hdf", EPILOG_DATASET_LANGUAGE_ID],
    [".metadata", EPILOG_METADATA_LANGUAGE_ID],
    [".epilogscript", EPILOG_SCRIPT_LANGUAGE_ID]
]);