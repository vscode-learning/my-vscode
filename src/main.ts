import { configureCommandlineSwitchesSync } from './utils/commandLineSwitches';
import { startCrash } from './utils/crash';
import { registerListeners } from './utils/globalListeners';
import { parseCLIArgs } from './utils/utils';
import { setCurrentWorkingDirectory } from './utils/workingDirectory';

const args = parseCLIArgs();

// argv 参数配置
const argvConfig = configureCommandlineSwitchesSync(args);

// 设置 crasher
startCrash(args, argvConfig);

setCurrentWorkingDirectory();

registerListeners();
