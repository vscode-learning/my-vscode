import minimist from 'minimist';
import { NativeParsedArgs } from '../platform/environment/common/argv';
import { app } from 'electron';
import { parseMainProcessArgv } from '../platform/environment/node/argvHelper';
import { validatePaths } from './argsPathsUtil';

// 处理 cli 参数
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

// 处理主进程运行时参数
const parseMainAgrs = () => {
  let args: NativeParsedArgs;
  try {
    args = parseMainProcessArgv(process.argv);
    args = validatePaths(args);
  } catch (err) {
    console.error(err.message);
    app.exit(1);

    return;
  }
  return args;
}

export {
  parseCLIArgs,
  parseMainAgrs
}
