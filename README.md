# Epilog README

A Language Server extension which provides language support for Epilog, the logic programming language developed at Stanford University and used in Prof. Michael Genesereth's CS 151 course.

## Features

- Provides syntax highlighting for the Epilog programming language. By default, syntax highlighting is applied to .epilog, .hdf, and .hrf files.
- Provides a "Run Script" command which allows Epilog queries to be run from a .epilogscript file.
- Provides a "Consolidate" command which can be run to gather and save content from referenced files into a single file.

## Usage Notes


### File types
- A .hdf file should only contain a dataset.
- A .hrf file should only contain a ruleset.
- A .epilogscript file should contain the three lines below, in any order. The query can be executed on the specified ruleset and dataset(s) by running the "Epilog: Run Script" command from the .epilogscript file. The results will be printed to the "Epilog Language Server" output channel.
    - dataset: <filepath> (to a single file or to a folder containing one or more .hdf files)
    - ruleset: <filepath> (to a single file)
    - query: <epilog query>
    - dotrace: <true/false> (optional, defaults to false)
- A .epilogbuild file should contain the lines below, in any order. Can contain any number of <filename> and <filename> ==> <newfilename> lines. Can contain at most one each of prefix and overwrite lines.
    - <filename>
        - Can contain any number of such lines. Will automatically generate a new filename of the form <prefix><filename><num>.<filename's extension> and save the consolidated contents to that file.
    - <filename> ==> <newfilename>
        - Can contain any number of such lines. Will save the consolidated contents to the file specified by <newfilename>.
    - prefix: <string> (optional, defaults to ''. At most one such line.)
        - If specified, the prefix will be prepended to all filenames when generating new filenames.
    - overwrite: <true/false> (optional, defaults to false. At most one such line.)
        - If true, will overwrite existing files when saving the consolidated contents to a file, without asking the user.
        - If false, will not overwrite existing files when saving the consolidated contents to a file, without asking the user.
### Running queries
- See the information on the .epilogscript file type above.

### YAML Frontmatter
- For .hdf, .hrf, and .metadata files, other files of the same type can be specified in the YAML frontmatter using relative filepaths. 
    - When the "Run Script" or "Consolidate" commands are run, the post-YAML frontmatter contents of the specified files are considered. 
        - E.g. when "Run Script" is run on a .hrf file, the Epilog ruleset is constructed from the contents of the specified .hrf file, from the post-YAML frontmatter contents of the files directly referenced in the .hrf file's frontmatter, and so on recursively from the files referenced in *those* files' frontmatter.
    - The YAML frontmatter field whose values are considered is different for each file type:
        - For .hdf files, the field is "dataset".
        - For .hrf files, the field is "ruleset".
        - For .metadata files, the field is "metadata".
    - The structure of the YAML frontmatter is as follows:
        - The first and last lines are "---".
        - A field is a whitespace-free string ending with a colon, followed by any whitespace and then a value.
        - A value is any string starting with a tab or four spaces, followed by a dash and a space, and then any string.
        - e.g.
            ```
            ---
            dataset:
                - <filepath>
                - ...
                - <filepath>
            ---
            ```

## Extension Settings

 - Epilog > Universal
    - Data: absolute filepath to a .hdf file. Will be included in dataset when running a query.
    - Rules: absolute filepath to a .hrf file. Will be included in ruleset when running a query.
    - Metadata: absolute filepath to a .metadata file. Will be included in metadata for validation. (Once metadata validation is implemented.)
- Epilog > Consolidate
    - Include Universal Files: boolean. If true, will include the universal files when consolidating.
## Known Issues

- Metadata validation is not yet implemented.

## Release Notes
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
