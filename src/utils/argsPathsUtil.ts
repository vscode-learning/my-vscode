import { coalesce, distinct } from "../base/common/arrays";
import { IPathWithLineAndColumn, isValidBasename, parseLineAndColumnAware, sanitizeFilePath } from "../base/common/extpath";
import { basename, resolve } from "../base/common/path";
import { isMacintosh, isWindows } from "../base/common/platform";
import { rtrim, trim } from "../base/common/strings";
import { isNumber } from "../base/common/types";
import { NativeParsedArgs } from "../platform/environment/common/argv";
import { PROCESS_ENV } from "./constant";

const preparePath = (cwd: string, path: string): string => {

  // Trim trailing quotes
  if (isWindows) {
    path = rtrim(path, '"'); // https://github.com/microsoft/vscode/issues/1498
  }

  // Trim whitespaces
  path = trim(trim(path, ' '), '\t');

  if (isWindows) {

    // Resolve the path against cwd if it is relative
    path = resolve(cwd, path);

    // Trim trailing '.' chars on Windows to prevent invalid file names
    path = rtrim(path, '.');
  }

  return path;
}

}

const toPath = (pathWithLineAndCol: IPathWithLineAndColumn): string => {
  const segments = [pathWithLineAndCol.path];

  if (isNumber(pathWithLineAndCol.line)) {
    segments.push(String(pathWithLineAndCol.line));
  }

  if (isNumber(pathWithLineAndCol.column)) {
    segments.push(String(pathWithLineAndCol.column));
  }

  return segments.join(':');
}

const doValidatePaths = (args: string[], gotoLineMode?: boolean): string[] => {
  const cwd = process.env[PROCESS_ENV.MY_VSCODE_CWD] || process.cwd();
  const result = args.map(arg => {
    let pathCandidate = String(arg);

    let parsedPath: IPathWithLineAndColumn | undefined = undefined;
    if (gotoLineMode) {
      parsedPath = parseLineAndColumnAware(pathCandidate);
      pathCandidate = parsedPath.path;
    }

    if (pathCandidate) {
      pathCandidate = preparePath(cwd, pathCandidate);
    }

    const sanitizedFilePath = sanitizeFilePath(pathCandidate, cwd);

    const filePathBasename = basename(sanitizedFilePath);
    if (filePathBasename /* can be empty if code is opened on root */ && !isValidBasename(filePathBasename)) {
      return null; // do not allow invalid file names
    }

    if (gotoLineMode && parsedPath) {
      parsedPath.path = sanitizedFilePath;

      return toPath(parsedPath);
    }

    return sanitizedFilePath;
  });

  const caseInsensitive = isWindows || isMacintosh;
  const distinctPaths = distinct(result, path => path && caseInsensitive ? path.toLowerCase() : (path || ''));

  return coalesce(distinctPaths);
}

export const validatePaths = (args: NativeParsedArgs): NativeParsedArgs => {
  	// Track URLs if they're going to be used
		if (args['open-url']) {
			args._urls = args._;
			args._ = [];
		}

		// Normalize paths and watch out for goto line mode
		if (!args['remote']) {
			const paths = doValidatePaths(args._, args.goto);
			args._ = paths;
		}

		return args;
}
