# Epilog README

A Language Server extension which provides language support for Epilog, the logic programming language developed at Stanford University and used in Michael Genesereth's CS 151 course.

## Features

- Provides syntax highlighting for the Epilog programming language. By default, syntax highlighting is applied to .epilog, .hdf, and .hrf files.

## Usage Notes

- A .hdf file should only contain a dataset
- A .hrf file should only contain a ruleset
- A .epilog file can contain both rulesets and datasets. Each must be wrapped in curly braces and have the corresponding prefix, as in the following screenshot. This must be done even if only one dataset or ruleset is present in the file.

![.epilog Formatting Example](/documentation_images/epilog%20formatting%20example.png)

## Extension Settings

No extension settings are currently contributed/implemented.

## Known Issues

- A baseline Language Server is implemented, but does not currently provide any desired functionality. Only toy features from the VSCode [Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) tutorial are currently implemented.

## Release Notes

### 0.0.2
- For files that only contain datasets (.hdf) or rulesets (.hrf), syntax highlighting no longer requires a prefix "DATASET" or "RULESET" with surrounding curly braces.

### 0.0.1
- Basic syntax highlighting for Epilog datasets and rulesets
