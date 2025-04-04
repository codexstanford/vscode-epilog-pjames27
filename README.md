# Epilog README

A Language Server extension which provides language support for Epilog, the logic programming language developed at Stanford University and used in Prof. Michael Genesereth's CS 151 course.

## Features
- Provides syntax highlighting for the Epilog programming language. By default, syntax highlighting is applied to .hdf (dataset) and .hrf (ruleset) files.
- Provides a "Run Script" command which allows Epilog queries to be run from a .epilogscript file.
- Provides a "Consolidate" command which can be run to gather and save content from referenced files into a single file.
- Enables decomposition by allowing reference to metadata, data, and rules from other files of the same type.
- Provides basic error detection. (See "Error Detection" below for details.)

## Usage Notes
See the "File types" section below.

### File types
- A .hdf file should only contain a dataset.
- A .hrf file should only contain a ruleset.
- A .metadata file should contain epilog metadata in the form of an epilog dataset.
- A .epilogscript file should contain the three or four lines below, in any order. The query can be executed on the specified ruleset and dataset(s) by running the "Epilog: Run Script" command from the .epilogscript file. The results will be printed to the "Epilog Language Server" output channel.
    - dataset: \<filepath\> (to a single file or to a folder containing one or more .hdf files) (required)
    - ruleset: \<filepath\> (to a single file) (required)
    - query: \<epilog query\> (required)
    - dotrace: \<true/false\> (optional, defaults to false. At most one such line.)
    - If true, the program trace will be printed to the output channel.
- A .epilogbuild file should contain the lines below, in any order. Can contain any number of \<filepath\> and \<filepath\> ==> \<newfilepath\> lines. Can contain at most one each of the prefix and overwrite lines.
    - \<filepath\> ==> \<newfilepath\>
        - Can contain any number of such lines. Will save the consolidated contents to the file specified by \<directory portion of \<newfilepath\>, as a relative path\>\<prefix\>\<filename portion of filepath\>.
    - \<filepath\>
        - Can contain any number of such lines. Will automatically generate a new filename of the form \<non-directory portion of prefix\>\<filename without extension\>\<num\>.\<filename's extension\> and save the consolidated contents to that file.
            - Will be saved to the directory reached by joining the following: the directory of the .epilogbuild file, the directory portion of the filename, and the directory portion of the prefix.
    - prefix: \<string\> (optional, defaults to the empty string. At most one such line.)
    - overwrite: \<true/false\> (optional, defaults to false. At most one such line.)
        - If true, will overwrite existing files when saving the consolidated contents to a file, without asking the user.
        - If false, will not overwrite existing files when saving the consolidated contents to a file, without asking the user.

### Running queries
- See the information on the .epilogscript file type above.

### YAML Frontmatter
- For .hdf, .hrf, and .metadata files, other files of the same type can be specified in the YAML frontmatter using relative filepaths.
    - When the "Run Script" or "Consolidate" commands are run, the post-YAML frontmatter contents of the specified files are considered.
        - E.g. when "Run Script" is run on a .hrf file, the Epilog ruleset is constructed from the contents of the specified .hrf file, from the post-YAML frontmatter contents of the files directly referenced in the .hrf file's frontmatter, and so on recursively from the files referenced in *those* files' frontmatter.
    - The YAML frontmatter field whose values are considered is different for each file type:
        - For .hdf files, the field is "data".
        - For .hrf files, the field is "rules".
        - For .metadata files, the field is "metadata".
    - The structure of the YAML frontmatter is as follows:
        - The first and last lines are "---".
        - A field is a whitespace-free string ending with a colon, followed by any whitespace and then a value.
        - A value is any string starting with a tab or four spaces, followed by a dash and a space, and then any string.
        - e.g.
```
---
data:
- <filepath>
- ...
- <filepath>
---
```

## Error Detection
- .hrf (ruleset files)
    - Basic parse error detection.
- .hdf (dataset files)
    - Basic parse error detection.
    - Detects when variables are present.


## Extension Settings
- Epilog > Universal
    - Data: absolute filepath to a .hdf file. Will be included in dataset when running a query.
    - Rules: absolute filepath to a .hrf file. Will be included in ruleset when running a query.
    - Metadata: absolute filepath to a .metadata file. Will be included in metadata for validation. (Once metadata validation is implemented.)
- Epilog > Consolidate
    - Include Universal Files: boolean. If true, will include the universal files when consolidating.
## Known Issues

- Metadata validation is not yet implemented.
- Resolving full file content can fail when referenced files have different line endings (CLRF vs LF)

## Release Notes
### 0.3.1
- Added basic parse error checking for dataset and ruleset files.
- Also flags when variables appear in datasets.

### 0.3.0
- Significantly improved syntax highlighting through the provision of semantic tokens.
    - Uses Paul Welter's lexers and parsers that CodeX commissioned for Epilog.

### 0.2.7
- Added a summary of results when the Run Script command is executed on a folder of datasets.

### 0.2.6
- Added output channel "Epilog Language Server - Debug" for logging information to assist with debugging epilog and the extension itself.
- Fixed another instance where paths were computed incorrectly on MacOS.

### 0.2.5
- Fixed issue where relative paths were computed incorrectly on MacOS.

### 0.2.3-4
- Fixed and improved README.

### 0.2.2
- In .epilogbuild files, if overwrite is specified as true, no longer generates a warning diagnostic when a file would be overwritten.

### 0.2.1
- Removed leftover completion items for .epilog files, DATASET and RULESET.
- Implemented settings to specify rules, data, and metadata that should always be included when running a query.
- Implemented a setting to specify whether to include universal files when consolidating.

### 0.2.0
- Implemented .epilogbuild file type.
    - Can specify .hdf, .hrf, and .metadata files to consolidate, and the name of the file to save the consolidated contents to.
        - If you don't specify a filename, one is automatically generated.
    - Can optionally specify a prefix that will be prepended to all files that consolidated contents are saved to, including autogenerated ones.
    - Can specify whether to overwrite always or never overwrite existing files when consolidating.
        - If not explicitly specified, the user is asked whether to overwrite an existing file.
- Removed support for .epilog files.
### 0.1.3
- Improved diagnostics updating when files are created and deleted.
- Improved suggested filename generation for the Consolidate command. No longer suggests a filename that already exists.
- The Consolidate command now asks user whether they want to overwrite a file that already exists.
### 0.1.2
- Updated to most recent version of epilog.js
    - Adds builtins less and symless.
- Further improved output formatting for the Run Script command.
### 0.1.1
- Changed name of "Epilog: Gather" command to "Epilog: Consolidate"
- Improved "Epilog: Run Script" command.
    - Added optional fourth line 'dotrace: <boolean>' to .epilogscript files to specify whether to print the trace to the output channel.
    - Improved output formatting.
        - Removed final newline from query results.
        - Now also prints the query in the output channel, in addition to the results.
        - Lengthened divider line when folder results are printed.

### 0.1.0
- Added functionality to run Epilog queries.
    - Implemented via the new .epilogscript file type and the "Epilog: Run Script" command.
- Rulesets and datasets can reference other rulesets and datasets, respectively. When running a query, the transitive closure of the contents of the referenced files are used.
    - Cycles are automatically detected and reported to the Client debug console. Execution of the query continues regardless.
- Added functionality to gather content from referenced files into a single file.
    - Implemented via the "Epilog: Gather" command.
        - The user is prompted to enter the filename where the gathered file contents will be saved.
- Can now specify metadata files relevant to a dataset or ruleset using YAML frontmatter.
- Preparation to add basic functionality to validate .hdf and .hrf files against metadata. (I.e. currently allows specifying metadata files, but doesn't yet make use of the metadata file contents.)

### 0.0.3
- Fixed bug that caused incorrect syntax highlighting for inline comments in datasets.

### 0.0.2
- For files that only contain datasets (.hdf) or rulesets (.hrf), syntax highlighting no longer requires a prefix "DATASET" or "RULESET" with surrounding curly braces.

### 0.0.1
- Basic syntax highlighting for Epilog datasets and rulesets.