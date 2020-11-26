import { app } from 'electron';
import path from 'path';
import { PROCESS_ENV } from './constant';


const setCurrentWorkingDirectory = () => {
	try {
		if (process.platform === 'win32') {
			process.env[PROCESS_ENV.MY_VSCODE_CWD] = process.cwd(); // remember as environment variable
			process.chdir(path.dirname(app.getPath('exe'))); // always set application folder as cwd
		} else if (process.env[PROCESS_ENV.MY_VSCODE_CWD]) {
			process.chdir(process.env[PROCESS_ENV.MY_VSCODE_CWD] as string);
		}
	} catch (err) {
		console.error(err);
	}
}

export {
	setCurrentWorkingDirectory
}
