import {
  Invalid,
  Rule,
  RuleConfig,
  Rules,
  Valid,
  ValidationError
} from './types';
import VALIDATORS from './validators';
import { isFn, isObj } from './utils';

class Validator<T extends object> {
  private _rules: Rules<T>;

  constructor (rules: Rules<T>) {
    this._rules = rules;
  }

  validate<D extends Partial<T>> (data: D) {
    const { _rules } = this;
    const tasks: Promise<void>[] = [];
    const errors: ValidationError<D>[] = [];

    const validate = <K extends keyof D> (
      field: K,
      config: RuleConfig<D[K]>
    ) => {
      const value = data[field]!;
      const message = config.message;

      for (const configKey in config) {
        if (configKey === 'message') {
          continue;
        }

        const rule = configKey as keyof Rule;
        const validator = VALIDATORS[rule];

        if (!isFn(validator)) {
          continue;
        }

        const param = config[rule];
        const result = validator(param as never, value);

        const checkResult = (res: boolean) => {
          if (!res) {
            errors.push({
              field,
              value,
              rule,
              param,
              message: isFn(message) ? message(rule, param, value) : message
            });
          }
        };

        if (isObj(result)) {
          if (isFn(result.then)) {
            tasks.push(result.then(checkResult));
          }
        } else {
          checkResult(result);
        }
      }
    };

    return new Promise<Invalid<D> | Valid<D>>((resolve, reject) => {
      const check = () => {
        resolve(
          errors.length ? { valid: false, errors } : { valid: true, data }
        );
      };

      for (const dataKey in data) {
        const config: RuleConfig<any> | RuleConfig<any>[] = (_rules as any)[
          dataKey
          ];

        if (!config) {
          continue;
        }

        if (Array.isArray(config)) {
          for (const configElement of config) {
            validate(dataKey, configElement);
          }
        } else {
          validate(dataKey, config);
        }
      }

      if (tasks.length) {
        Promise.all(tasks).then(check, reject);
      } else {
        check();
      }
    });
  }
}

export default Validator;