import { setUnexpectedErrorHandler } from "./base/common/errors";
import { NativeParsedArgs } from "./platform/environment/common/argv";
import { parseMainAgrs } from "./utils/utils";


class CodeMain {
  main(): void {
    // Set the error handler early enough so that we are not getting the
		// default electron error dialog popping up
    setUnexpectedErrorHandler(err => console.error(err));

    // 处理主进程运行时参数 包含路径处理
    const args: NativeParsedArgs = parseMainAgrs();


  }
}

export const startCodeMain = () => {
  const codeMain = new CodeMain();
  codeMain.main();
}
