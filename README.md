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
    - query: <query>
    
### Running queries
- See the information on the .epilogscript file type above.

### YAML Frontmatter (TODO)

## Extension Settings

No extension settings are currently contributed/implemented.

## Known Issues

- Metadata validation is not yet implemented.
- Cycles referenced .hdf, .hrf, and .metadata files are not yet detected.

## Release Notes

### 0.1.0
- Added functionality to run Epilog queries.
    - Implemented via the new .epilogscript file type, and the "Epilog: Run Script" command.
- Can now specify metadata files relevant to a dataset or ruleset using YAML frontmatter.
- Preparation to add basic functionality to validate .hdf and .hrf files against metadata. (i.e. only allows specifying metadata file right now, doesn't yet make use of the metadatafile contents)

### 0.0.3
- Fixed bug that caused incorrect syntax highlighting for inline comments in datasets.

### 0.0.2
- For files that only contain datasets (.hdf) or rulesets (.hrf), syntax highlighting no longer requires a prefix "DATASET" or "RULESET" with surrounding curly braces.

### 0.0.1
- Basic syntax highlighting for Epilog datasets and rulesets.
