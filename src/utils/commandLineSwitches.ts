import { readArgvConfigSync } from './argv';
import { app } from 'electron';

export type NativeParsedArgs = { [arg: string]: any; '--'?: string[]; _: string[]; };

const getSwitches = () => {
  const SUPPORTED_ELECTRON_SWITCHES = [
		// alias from us for --disable-gpu
		'disable-hardware-acceleration',

		// provided by Electron
		'disable-color-correct-rendering',

		// override for the color profile to use
		'force-color-profile'
	];

	if (process.platform === 'linux') {

		// Force enable screen readers on Linux via this flag
		SUPPORTED_ELECTRON_SWITCHES.push('force-renderer-accessibility');
	}

	const SUPPORTED_MAIN_PROCESS_SWITCHES = [

		// Persistently enable proposed api via argv.json: https://github.com/microsoft/vscode/issues/99775
		'enable-proposed-api'
  ];
  return {
    electronSwitches: SUPPORTED_ELECTRON_SWITCHES,
    mainSwitches: SUPPORTED_MAIN_PROCESS_SWITCHES
  }
}

const setSwitches = (supportElectronSwitches: any) => {
  const argvConfig = readArgvConfigSync();
  Object.keys(argvConfig).forEach(argvKey => {
		const argvValue = argvConfig[argvKey];

		// Append Electron flags to Electron
		if (supportElectronSwitches.indexOf(argvKey) !== -1) {

			// Color profile
			if (argvKey === 'force-color-profile') {
				if (argvValue) {
					app.commandLine.appendSwitch(argvKey, argvValue);
				}
			}

			// Others
			else if (argvValue === true || argvValue === 'true') {
				if (argvKey === 'disable-hardware-acceleration') {
					app.disableHardwareAcceleration(); // needs to be called explicitly
				} else {
					app.commandLine.appendSwitch(argvKey);
				}
			}
		}

		// Append main process flags to process.argv
		else if (supportElectronSwitches.indexOf(argvKey) !== -1) {
			if (argvKey === 'enable-proposed-api') {
				if (Array.isArray(argvValue)) {
					argvValue.forEach(id => id && typeof id === 'string' && process.argv.push('--enable-proposed-api', id));
				} else {
					console.error(`Unexpected value for \`enable-proposed-api\` in argv.json. Expected array of extension ids.`);
				}
			}
		}
	});
}

const getJSFlags = (cliArgs: NativeParsedArgs) => {
	const jsFlags = [];

	// Add any existing JS flags we already got from the command line
	if (cliArgs['js-flags']) {
		jsFlags.push(cliArgs['js-flags']);
	}

	// Support max-memory flag
	if (cliArgs['max-memory'] && !/max_old_space_size=(\d+)/g.exec(cliArgs['js-flags'])) {
		jsFlags.push(`--max_old_space_size=${cliArgs['max-memory']}`);
	}

	return jsFlags.length > 0 ? jsFlags.join(' ') : null;
}

const configureCommandlineSwitchesSync = (cliArgs: NativeParsedArgs) => {
  const switches = getSwitches();
  setSwitches(switches.electronSwitches);

  const jsFlags = getJSFlags(cliArgs);
	if (jsFlags) {
		app.commandLine.appendSwitch('js-flags', jsFlags);
	}
}

export {
  configureCommandlineSwitchesSync
}
