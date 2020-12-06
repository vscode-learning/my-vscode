import { createDecorator } from "../../../ioc/instantiation";

export const ITestService = createDecorator<ITestService>('testService');
export interface ITestService {
  readonly _serviceBrand: undefined;
  test: () => void; // 测试方法
}
