# Validator

JavaScript data validator, supporting custom asynchronous validation based on promise

### Demo

```ts
/**
 * Define validation rules
 */
const validator = new Validator({
  // Sync rules
  nickname: { 
    required: true,
    message: 'Nickname is requried'
  },
  account: [
    { 
      required: true, 
      message: "Account is required"
    },
    { 
      min: 6, 
      message: 'Account must have more than 6 characters' 
    },
    {
      validator (account: string) {
        return account.length <= 16; // max=16
      },
      message: 'Account must be under 16 characters'
    }
    // more rules...
  ],

  // Custom async rules
  password: {
    validator (password: string) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(password === '123456');
        }, 1000);
      })
    },
    message: 'Wrong password'
  }
});

/**
 * Validate
 */
const validData = {
  nickname: 'Jack',
  account: 'jack2022',
  password: '123456'
};

const invalidData = {
  nickname: '',
  account: '',
  password: '654321'
};

validator
  .validate(invalidData) // or validData
  .then((res) => {
    if (res.valid) {
      console.log(res.data);
      // submit...
    } else {
      console.log(res.errors);
      // do some thing...
    }
  });
```

### Interface

```ts
/**
 * Validation rules
 */
interface Rule<T = any> {
  required: boolean;
  number: boolean;
  digits: boolean;
  dateISO: boolean;
  url: boolean;
  email: boolean;
  min: number;
  max: number;
  minLength: number;
  maxLength: number;
  step: number;
  equal: any;
  notEqual: any;
  pattern: RegExp;
  validator: (value: T) => boolean | Promise<boolean>;
}

interface RuleConfig<T> extends Partial<Rule<T>> {
  message:
    | string
    | (<K extends keyof Rule>(rule: K, param: Rule[K], value: T) => string);
}

type Rules<T extends object> = {
  [K in keyof T]: RuleConfig<T[K]> | RuleConfig<T[K]>[]
}

/**
 * Validation Error info
 */
interface ValidationError<T extends object> {
  field: keyof T;
  value: any;
  rule: keyof Rule;
  param: any;
  message: string;
}

/**
 * Validation results
 */
interface Invalid<T extends object> {
  valid: false;
  errors: ValidationError<T>[];
}

interface Valid<T extends object> {
  valid: true;
  data: T;
}

/**
 * Validator instance
 */
declare class Validator<T extends object> {
  constructor (rules: Rules<T>);

  validate<D extends Partial<T>> (data: D): Promise<Invalid<D> | Valid<D>>;
}
```
