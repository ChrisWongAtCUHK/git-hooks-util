#!/usr/bin/env node
/* eslint-disable no-console */
const log = console.log
const error = console.error

/* eslint-disable no-console */

const fs = require('fs')
const { spawn } = require('child_process')
const getPath = spawn('git', ['config', 'core.hooksPath'])

let args = process.argv

// node index.js
if(args[0].endsWith('/node')) {
	args = args.slice(1)
}

// ghu [init]
if(!args[1] || args[1] === 'init') {
	// if .git folder does not exist exit
	if(fs.existsSync('.git')) {
		if(fs.existsSync('.githooks')) {
			error('.githooks exists, abort initialization.')
		} else {
			let hooksPath = ''

			// 1. get `hooksPath` in ~/.gitconfig(global) or .git/config(local)
			getPath.stdout.on('data', (data) => {
				// get hooksPath
				hooksPath = data
			})
			getPath.on('close', () => {
				// if not set, use default
				hooksPath = hooksPath ? hooksPath : '.git/hooks'

				// 1. read files in .git/hooks
				//		* if exists, append to the end
				//		* if hook does not exist, copy multiple-git-hooks.sh
				// https://git-scm.com/docs/githooks
				const hooks = [
						'applypatch-msg',
						'pre-applypatch',
						'post-applypatch',
						'pre-commit',
						'pre-merge-commit',
						'prepare-commit-msg',
						'commit-msg',
						'post-commit',
						'pre-rebase',
						'post-checkout',
						'post-merge',
						'pre-push',
						'pre-receive',
						'update',
						'post-receive',
						'post-update',
						'push-to-checkout',
						'pre-auto-gc',
						'post-rewrite',
						'rebase',
						'sendemail-validate',
						'fsmonitor-watchman',
						'p4-pre-submit',
						'post-index-change'
				]
				const scripText = fs
					.readFileSync(`${__dirname}/template/multiple-git-hooks.sh`)

				let sample = ''

				for(let hook of hooks) {
					const hookFile = `${hooksPath}/${hook}`

					if(fs.existsSync(hookFile)) {
						// exists, append
						fs.appendFileSync(hookFile, scripText)
						log(`${hookFile} is modified.`)
					} else {
						// not exist, creat
						if(fs.existsSync(`${hookFile}.sample`)) {
							sample = `${hookFile}.sample`
						}
						// copy sample if any to
						//		avoid permission modification
						fs.copyFileSync(sample, hookFile)
						fs.writeFileSync(hookFile, `#!/bin/sh\n${scripText}`)
						log(`${hookFile} is created.`)
					}
				}
				// 1. create folder .githooks
				fs.mkdir('.githooks', (err) => {
					if(err) {
						error(err)
						process.exit(1)
					}
					log('.githooks folder is created.')
				})
			})
		}
	} else {
		error('not a git repository (or any of the parent directories)')
	}
}

