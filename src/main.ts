import { configureCommandlineSwitchesSync } from './utils/commandLineSwitches';
import { startCrash } from './utils/crash';
import { parseCLIArgs } from './utils/utils';

const args = parseCLIArgs();

// argv 参数配置
const argvConfig = configureCommandlineSwitchesSync(args);

// 设置 crasher
startCrash(args, argvConfig);

