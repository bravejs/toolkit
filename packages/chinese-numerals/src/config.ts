export interface Config {
  numbers: string[]
  smallUnits: string[]
  bigUnits: string[]
  decimalUnits: string[]
  dot: string
  integerUnit: string
}

export const defaultConfig: Config = {
  numbers: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
  smallUnits: ['', '十', '百', '千'],
  bigUnits: ['', '万', '亿'], // 目前仅支持最大单位为`亿`
  decimalUnits: [],
  dot: '点',
  integerUnit: ''
};

export const currencyConfig: Config = {
  numbers: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
  smallUnits: ['', '拾', '佰', '仟'],
  bigUnits: ['', '万', '亿'], // 目前仅支持最大单位为`亿`
  decimalUnits: ['角', '分'],
  dot: '元',
  integerUnit: '元整'
};