import { Validators } from './types';
import PATTERNS from './patterns';
import { getLength } from './utils';

const VALIDATORS: Validators = {
  required (param, value) {
    return !param || (Array.isArray(value) ? value.length > 0 : !!value);
  },

  number (param, value) {
    return !param || !isNaN(Number(value));
  },

  digits (param, value) {
    return !param || PATTERNS.digits.test(value);
  },

  dateISO (param, value) {
    return !param || PATTERNS.dateISO.test(value);
  },

  url (param, value) {
    return !param || PATTERNS.url.test(value);
  },

  email (param, value) {
    return !param || PATTERNS.email.test(value);
  },

  min (param, value) {
    return value >= param;
  },

  max (param, value) {
    return value <= param;
  },

  minLength (param, value) {
    return getLength(value) >= param;
  },

  maxLength (param, value) {
    return getLength(value) <= param;
  },

  step (param, value) {
    return value % param === 0;
  },

  equal (param, value) {
    return value === param;
  },

  notEqual (param, value) {
    return value !== param;
  },

  pattern (param, value) {
    return param.test(value);
  },

  validator (param, value) {
    return param(value);
  }
};

export default VALIDATORS;