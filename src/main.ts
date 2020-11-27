import { startCodeMain } from './main-process';
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

// 设置当前工作目录
setCurrentWorkingDirectory();

// 注册全局监听
registerListeners();

// 启动主进程
startCodeMain();
