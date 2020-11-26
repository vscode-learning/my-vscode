
import { app } from 'electron';
import { GLOBAL_NAMES } from './constant';

const registerListeners = () => {
  /**
	 * macOS: when someone drops a file to the not-yet running VSCode, the open-file event fires even before
	 * the app-ready event. We listen very early for open-file and remember this upon startup as path to open.
	 *
	 * @type {string[]}
	 */
	const macOpenFiles: string[] = [];
	global[GLOBAL_NAMES.macOpenFiles] = macOpenFiles;
	app.on('open-file', function (event: any, path: string) {
		macOpenFiles.push(path);
	});

	/**
	 * macOS: react to open-url requests.
	 *
	 * @type {string[]}
	 */
	const openUrls: string[] = [];
	const onOpenUrl = function (event, url: string) {
		event.preventDefault();
		openUrls.push(url);
	};

	app.on('will-finish-launching', function () {
		app.on('open-url', onOpenUrl);
	});

	global[GLOBAL_NAMES.getOpenUrls] = function () {
		app.removeListener('open-url', onOpenUrl);
		return openUrls;
	};

}

export {
  registerListeners
}
