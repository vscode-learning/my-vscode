import path from 'path';
import fs from 'fs';
import product from '../../production.json';
import os from 'os';
import { PROCESS_ENV } from './constant';
const getArgvConfigPath = () => {
  let dataFolderName = product.dataFolderName;
  // dev 的时候我们增加一个 dev 后缀
	if (process.env[PROCESS_ENV.MY_VSCODE_DEV]) {
		dataFolderName = `${dataFolderName}-dev`;
	}
	return path.join(os.homedir(), dataFolderName, 'argv.json');
}
const stripComments = (content) => {
	const regexp = /("(?:[^\\"]*(?:\\.)?)*")|('(?:[^\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
	return content.replace(regexp, function (match, m1, m2, m3, m4) {
		// Only one of m1, m2, m3, m4 matches
		if (m3) {
			// A block comment. Replace with nothing
			return '';
		} else if (m4) {
			// A line comment. If it ends in \r?\n then keep it.
			const length_1 = m4.length;
			if (length_1 > 2 && m4[length_1 - 1] === '\n') {
				return m4[length_1 - 2] === '\r' ? '\r\n' : '\n';
			}
			else {
				return '';
			}
		} else {
			// We match a string
			return match;
		}
	});
}
const readArgvConfigSync = () => {
	// Read or create the argv.json config file sync before app('ready')
	const argvConfigPath = getArgvConfigPath();
	let argvConfig;
	try {
		argvConfig = JSON.parse(stripComments(fs.readFileSync(argvConfigPath).toString()));
	} catch (error) {
    console.warn(`Unable to read argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
	}
	// Fallback to default
	if (!argvConfig) {
		argvConfig = {
			'disable-color-correct-rendering': true // Force pre-Chrome-60 color profile handling (for https://github.com/microsoft/vscode/issues/51791)
		};
	}
	return argvConfig;
}


export {
  readArgvConfigSync
}
