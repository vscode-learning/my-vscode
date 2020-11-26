import path from 'path';
import fs from 'fs';
import { app, crashReporter } from 'electron';
import product from '../../production.json';
import { ARGS_NAME } from './constant';

const setCrashFolder = (args: any, argvConfig: any): {
  submitURL: string;
  crashReporterDirectory: string
} => {
  let submitURL = '';
  let crashReporterDirectory = args[ARGS_NAME.crashReporterDirectory];
  if (crashReporterDirectory) {
    // 存在变量，则进行设置
    crashReporterDirectory = path.normalize(crashReporterDirectory);

    if (!path.isAbsolute(crashReporterDirectory)) {
      console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory must be absolute.`);
      app.exit(1);
    }

    if (!fs.existsSync(crashReporterDirectory)) {
      try {
        fs.mkdirSync(crashReporterDirectory);
      } catch (error) {
        console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory does not seem to exist or cannot be created.`);
        app.exit(1);
      }
    }

    // Crashes are stored in the crashDumps directory by default, so we
    // need to change that directory to the provided one
    console.log(`Found --crash-reporter-directory argument. Setting crashDumps directory to be '${crashReporterDirectory}'`);
    app.setPath('crashDumps', crashReporterDirectory);
  } else {
	  const appCenter = product.appCenter;
	// Disable Appcenter crash reporting if
	// * --crash-reporter-directory is specified
	// * enable-crash-reporter runtime argument is set to 'false'
	// * --disable-crash-reporter command line parameter is set
	if (appCenter && argvConfig[ARGS_NAME.enableCrashReporter] && !args[ARGS_NAME.disableCrashReporter]) {
		const isWindows = (process.platform === 'win32');
		const isLinux = (process.platform === 'linux');
		const crashReporterId = argvConfig[ARGS_NAME.crashReporterId];
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidPattern.test(crashReporterId)) {
			submitURL = isWindows ? appCenter[process.arch === 'ia32' ? 'win32-ia32' : 'win32-x64'] : isLinux ? appCenter[`linux-x64`] : appCenter.darwin;
			submitURL = submitURL.concat('&uid=', crashReporterId, '&iid=', crashReporterId, '&sid=', crashReporterId);
			// Send the id for child node process that are explicitly starting crash reporter.
			// For vscode this is ExtensionHost process currently.
			const argv = process.argv;
			const endOfArgsMarkerIndex = argv.indexOf('--');
			if (endOfArgsMarkerIndex === -1) {
				argv.push('--crash-reporter-id', crashReporterId);
			} else {
				// if the we have an argument "--" (end of argument marker)
				// we cannot add arguments at the end. rather, we add
				// arguments before the "--" marker.
				argv.splice(endOfArgsMarkerIndex, 0, '--crash-reporter-id', crashReporterId);
			}
		}
	}
  }
  return {
    submitURL,
    crashReporterDirectory
  }
}

const startCrash = (args: any, argvConfig: any) => {
  const productName = product.nameShort;
  const companyName = product.companyName;
  const result = setCrashFolder(args, argvConfig);
  crashReporter.start({
    companyName: companyName,
    productName: process.env['VSCODE_DEV'] ? `${productName} Dev` : productName,
    submitURL: result.submitURL,
    uploadToServer: !result.crashReporterDirectory
  });
}

export {
  startCrash
}
