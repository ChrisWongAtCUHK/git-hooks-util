# git-hooks-util

## Origin
* [git-hooks](https://github.com/tarmolov/git-hooks-js#readme)
* [multiple-git-hooks.sh](https://gist.github.com/mjackson/7e602a7aa357cfe37dadcc016710931b)

## Installation
```
npm install git-hooks-util -g
```

## Usage
```
ghu [init]
```

## What it is doing 
1. read files in .git/hooks  
	* if hook does not exist, copy multiple-git-hooks.sh
	* if exists, append to the end(assumed the shebang is /bin/sh)
2. create folder .githooks
3. create template in .githooks
4. examples folder

## Notes
1. it would change git hooks behavior such that husky, git-hooks-js, etc. would be affected.

