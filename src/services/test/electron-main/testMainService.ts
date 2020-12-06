import { ITestService } from "../common/testService";

export class TestMainService implements ITestService {
  _serviceBrand: undefined;

  test() {
    console.log('this is test service');
  }
}
