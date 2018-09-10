# Shellfish
A Node.js project packaging tool for CI/CD practices.
 
:shell:: But, how can a shellfish live without a **shell**?

## Installation

from [npm](https://github.com/npm/npm)

    $ npm install shellfish

## Usage

``` js
const sf = require('shellfish');
```

## API
All APIs will be able to throw ```Error``` unless explicitly called with **surpressError** option set **true**. You are always encouraged to use ```try-catch``` statements to handle those Errors.
#### Asynchronous
### makeTempDir(options = {})
> Make a temp directory.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The full path of the created temp directory.

### removeTempDir(options = {})
> Remove the temp directory created by the [makeTempDir](#makeTempDir) API.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: Always returns *true*.

### makeDir(location, cwd = process.cwd(), options = {})
> Make a directory on <location>. If given a multi-level path, will create directories following to the far end:
e.g.: ./this/is/where/you/reach
- **location**: type of `Path-like String`
A (full / relative) path of which you want to create. Will be resolved to **cwd**.
- **cwd**: type of `String` default to ```process.cwd()```
Indicates the **C**urrent **W**orking **D**irectory.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The output to the *stdout* during making a directory. If not output on *stdout*, output to the *stderr* if error occurred.

### copy(src, des, cwd = process.cwd(), options = {})
> Copy everything from <src> to <des>. Arguments <-RL> or <-rL> are applied depending on OS, in current version.
This API behaves the same as the <cp> command of Shell in the current OS.
- **src**: type of `Path-like String`
The source will be copied from.
- **des**: type of `Path-like String`
The destination will be copied to.
- **cwd**: type of `String` default to ```process.cwd()```
Indicates the **C**urrent **W**orking **D**irectory.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The output to the *stdout* during copying. If no output on *stdout*, output to the *stderr* if error occurred.


### moveSafe(src, des, options = {})
> Move from <src> to <des>. This API behaves the same as the <mv> command of Shell in the current OS. Both <src> and <des> are real path, otherwise, will be resovled to process.cwd().
- **src**: type of `Path-like String`
The source will be moving.
- **des**: type of `Path-like String`
The destination will be moved to.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The output to the *stdout* during moving. If no output on *stdout*, output to the *stderr* if error occurred.


### find(search, onDir)
> Find anything by <search> pattern (or a pattern array). This API will find all matching results and return as an string array each of which is the path to a file matched the pattern.
This searching and matching behaviour of this API is the same as <find> command in the current OS.

- **search**: type of `String | String Array`
The patterns using to look for a list of files. Can be either a single pattern string or an array of multiple pattern strings.
- **onDir**: type of `Path-like String`
Indicates the directory to apply finding.

***Return***: An array of matched files.

### remove(search, cwd = process.cwd(), options = {})
> Remove anything by <search> pattern (or a pattern array). This API will find all matching results then delete them.
This API's behaviours are the same as the combination of <find> and <rm> commands in the current OS.

- **search**: type of `String | String Array`
The patterns to be looked for to remove. Can be either a single pattern string or an array of multiple pattern strings.
- **cwd**: type of `String` default to ```process.cwd()```
Indicates the **C**urrent **W**orking **D**irectory.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The output to the *stdout* during finding and removing files. If no output on *stdout*, output to the *stderr* if error occurred.

### deleteSafe(location, onDir, options = {})
> Remove anything by <search> pattern (or a pattern array). This API will find all matching results then delete them.
This API's behaviours are the same as the combination of <find> and <rm> commands in the current OS.

- **search**: type of `String | String Array`
The patterns to be looked for to remove. Can be either a single pattern string or an array of multiple pattern strings.
- **cwd**: type of `String` default to ```process.cwd()```
Indicates the **C**urrent **W**orking **D**irectory.
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The output to the *stdout* during deleing. If no output on *stdout*, output to the *stderr* if error occurred.


### copyPlus(src, des, excludeList = [], options = {})
> Copy everything of <src> to <des> except files found by pattterns specified in the excluding list <excludelist>
This API has the same behaviours as API [remove](#remove-search) when it comes to excluding from copying.

- **src**: type of `Path-like String`
The source will be copied from. Path will be resolved to ```process.cwd()```.
- **des**: type of `Path-like String`
The destination will be copied to. Path will be resolved to ```process.cwd()```.
- **excludeList**: type of `Array`
An array of patterns to exlude from copying. The result of filtering using this exclude list is the same way as it will applies for deletion in API [remove](#remove-search).
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: Always returns *true* unless an ```Error``` was thrown.


### zipSafe(fileName, src, excludeList = [], options = {})
> Pack everything of <src> except files found by pattterns specified in the excluding list <excludelist>
This API behaves the same as <zip> command in the current OS.

- **fileName**: type of `String`
The file name of the zip file. It is taken 'as is', which means file extension is specified as part of the file name if applicable. e.g. <name>.<ext> or <name>
- **src**: type of `Path-like String`
The directory where to look for files to pack. The parent directory <src> will not be included. Only files inside <src> will be packed.
- **excludeList**: type of `Array`
An array of patterns to exlude from packing. This exclude list behaves the same as the ```zip``` command argument ```-x```. 
- **options**: type of `Object`
See available options on [options](#options-1) section.

***Return***: The full path of the zip file.


### npmInstallAt(location, args = [], options = {})
> Try applying ```npm install``` at <location>, with a list of arguments <args>, if there is a valid node package.josn on the <location>. <location> will be resolved to process.cwd().

- **location**: type of `Path-like String`
The location to run npm install. Can be a real path or relative path. If a relative path given, it will be resolved to process.cwd().
- **args**: type of `String Array`
The arguments to apply to npm install.
- **options**: type of `Object`
***surpressError*** is always set to ***true***.
See available options on [options](#options-1) section.

***Return***: *false* if package.json not found on <location>. Otherwise, the output to the *stdout* during running npm install. If not output on *stdout*, output to the *stderr* if error occurred.

### npmPruneAt(location, args = [], options = {})
> Try applying ```npm prune``` at <location>, with a list of arguments <args>, if there is a valid node package.josn on the <location>. <location> will be resolved to process.cwd().

- **location**: type of `Path-like String`
The location to run npm prune. Can be a real path or relative path. If a relative path given, it will be resolved to process.cwd().
- **args**: type of `String Array`
The arguments to apply to npm prune.
- **options**: type of `Object`
***surpressError*** is always set to ***true***.
See available options on [options](#options-1) section.

***Return***: *false* if package.json not found on <location>. Otherwise, the output to the *stdout* during running npm prune. If not output on *stdout*, output to the *stderr* if error occurred.


### npmPackAt(location, args = [], options = {})
> Try applying ```npm pack``` at <location>, with a list of arguments <args>, if there is a valid node package.josn on the <location>. <location> will be resolved to process.cwd().

- **location**: type of `Path-like String`
The location to run npm pack. Can be a real path or relative path. If a relative path given, it will be resolved to process.cwd().
- **args**: type of `String Array`
The arguments to apply to npm pack.
- **options**: type of `Object`
***surpressError*** is always set to ***true***.
If ***checkSucess*** is set to ***true***, an ```Error``` will be thrown when unable to pack a node module at the given location.
See other available options on [options](#options-1) section.

***Return***: The path to the package tarball file (with ***.tgz*** extension) if sucessfully pack the node module, or ***null***.


### npmRunAt(location, args = [], options = {})
> Try runing an ```npm run <script>``` at <location>, with a list of arguments <args>, if there is a valid node package.josn on the <location>.
<location> will be resolved to process.cwd().

- **location**: type of `Path-like String`
The location to execute npm run. Can be a real path or relative path. If a relative path given, it will be resolved to process.cwd().
- **args**: type of `String Array`
The arguments to apply to npm num. The first argument in this array will be taken as the script name specified in the ***scripts*** object in the ***package.json*** file on <location>.
- **options**: type of `Object`
***surpressError*** is always set to ***true***.
See other available options on [options](#options-1) section.

***Return***: The path to the package tarball file (with ***.tgz*** extension) if sucessfully pack the node module, or ***null***.


#### Synchronous
### readPackageJsonAt(location)
> Read the Node project package.json file from <location>

- **location**: type of `Path-like String`
The location to read th package.json file. Can be a real path or relative path. If a relative path given, it will be resolved to process.cwd().

***Return***: An object of package.json or empty object ```{}```.

### spawn(num = 1)
> To spawn one or multiple Shellfish instances! 
Yes, Shellfish can spawn.

- **num**: type of `Integer`
The number of Shellfish instances to screate.

***Return***: One ```Shellfish``` instance of an array of ```Shellfish``` instances of the given number.

## Options
> Some options are only effective in a curtain API. Also, an option could be automatically set to true in a certain API but could never be changed.
#### surpressError
Surpress all ```Error``` which would be thrown. Error logs are still displayed.
- type of `boolean` default to ***false***.
#### mute
Do not display any log to console.
- type of `boolean` default to ***false***.
#### printStdout
Display any data output to ```stdout``` stream while a shell command was running.
- type of `boolean` default to ***false***.
#### printStderr
Display any data output to ```stderr``` stream while a shell command was running.
- type of `boolean` default to ***false***.
#### checkSuccess
Forcibly check if a shell command was run sucessfully or not. Usually a following action will be taken if command run unsucessfully. Please refer to each API doc.
- type of `boolean` default to ***false***.

## Notes
- ***Shellfish*** runs shell commands via Node process so it could behave differently depending on the current OS and shell tool version.
- Whether search patterns accept ```globstar``` or not depends on the shell option ```shopt``` of the default shell profile. Some shell versions don't enable shopt globstar by default or don't support shopt (e.g. default Bash in macOS). Searching behaviours could be different in this case.

License
----
This software is released under the terms of the MIT license. Copyright © [Jayden Liang](mailto:jaydenliang81@gmail.com) 2018. All rights reserved.
