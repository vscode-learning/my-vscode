import minimist from 'minimist';

const parseCLIArgs = () => {
  return minimist(process.argv, {
		string: [
			'user-data-dir',
			'locale',
			'js-flags',
			'max-memory',
			'crash-reporter-directory'
		]
	});
}
export {
  parseCLIArgs
}
