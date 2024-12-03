# Epilog README

A Language Server extension which provides language support for Epilog, the logic programming language developed at Stanford University and used in Prof. Michael Genesereth's CS 151 course.

## Features

- Provides syntax highlighting for the Epilog programming language. By default, syntax highlighting is applied to .epilog, .hdf, and .hrf files.

## Usage Notes


### File types
- A .hdf file should only contain a dataset.
- A .hrf file should only contain a ruleset.
- A .epilog file can contain both rulesets and datasets. Each must be wrapped in curly braces and have the corresponding prefix, as in the following screenshot. This must be done even if only one dataset or ruleset is present in the file.

![.epilog Formatting Example](/documentation_images/epilog%20formatting%20example.png)

- A .epilogscript file should contain the three lines below, in any order. The query can be executed on the specified ruleset and dataset(s) by running the "Epilog: Run Script" command from the .epilogscript file. The results will be printed to the "Epilog Language Server" output channel.
    - dataset: <filepath> (to a single file or to a folder containing one or more .hdf files)
    - ruleset: <filepath> (to a single file)
    - query: <epilog query>
    - dotrace: <true/false> (optional, defaults to false)
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

No extension settings are currently contributed/implemented.

## Known Issues

- Metadata validation is not yet implemented.

## Release Notes

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
