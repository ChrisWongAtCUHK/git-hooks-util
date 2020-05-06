#!/usr/bin/env node
/* eslint-disable no-console */
const log = console.log
const error = console.error

/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const getPath = spawn('git', ['config', 'core.hooksPath'])

let args = process.argv

// node index.js
if(args[0].endsWith('/node')) {
	args = args.slice(1)
}

// postinstall, `npm install git-hooks-util --save-dev`
let postinstall = args[1] && args[1] === 'postinstall'

// ghu [init]
if(!args[1] || args[1] === 'init' || postinstall) {
	if(postinstall) {
		process.chdir(path.join(__dirname, '../../'))
	}

	// if .git folder does not exist exit
	if(fs.existsSync('.git')) {
		// folder to hold the scripts
		const hooksDir = '.githooks'

		if(fs.existsSync(hooksDir)) {
			error('.githooks exists, abort initialization.')
		} else {
			// 1. create folder .githooks
			fs.mkdirSync(hooksDir)
			log(`${hooksDir} folder is created.`)
			// 2. get `hooksPath` in ~/.gitconfig(global) or .git/config(local)
			let hooksPath = ''

			getPath.stdout.on('data', (data) => {
				// get hooksPath
				hooksPath = data
			})
			getPath.on('close', () => {
				// if not set, use default
				hooksPath = hooksPath ? hooksPath : '.git/hooks'

				// 3. read files in .git/hooks
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
				const hookScript = fs
					.readFileSync(`${__dirname}/template/.githooks/hook.sh`)
				let sample = 'applypatch-msg.sample'

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
					// create sub-folder in .githooks
					fs.mkdirSync(`${hooksDir}/${hook}`)
					// e.g. .git/hooks/pre-commit .githooks/pre-commit/hook.sh
					fs.copyFileSync(hookFile, `${hooksDir}/${hook}/hook.sh`)
					fs.writeFileSync(
						`${hooksDir}/${hook}/hook.sh`, hookScript
					)
				}
			})
		}
	} else {
		error('not a git repository (or any of the parent directories)')
	}
}

