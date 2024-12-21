export const EPILOG_RULESET_LANGUAGE_ID = "epilog-ruleset";
export const EPILOG_DATASET_LANGUAGE_ID = "epilog-dataset";
export const EPILOG_METADATA_LANGUAGE_ID = "epilog-metadata";
export const EPILOG_SCRIPT_LANGUAGE_ID = "epilog-script";
export const EPILOG_BUILD_LANGUAGE_ID = "epilog-build";

export const LANGUAGE_ID_TO_FILE_EXTENSION = new Map<string, string>([
    [EPILOG_RULESET_LANGUAGE_ID, ".hrf"],
    [EPILOG_DATASET_LANGUAGE_ID, ".hdf"],
    [EPILOG_METADATA_LANGUAGE_ID, ".metadata"],
    [EPILOG_SCRIPT_LANGUAGE_ID, ".epilogscript"],
    [EPILOG_BUILD_LANGUAGE_ID, ".epilogbuild"]
]);

// Reverse of the LANGUAGE_ID_TO_FILE_EXTENSION map
export const FILE_EXTENSION_TO_LANGUAGE_ID = new Map(Array.from(LANGUAGE_ID_TO_FILE_EXTENSION.entries()).map(([languageId, extension]) => [extension, languageId]));


