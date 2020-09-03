import { UploaderOptionValidationRuleArr } from 'aragorn-types';

// http://aragorn.com https://aragorn.com www.aragorn.com
export const domainRegExp = /^(https?:\/\/|www\.)[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+([^\/](.*[^\/])?)?$/g;

// path1/path2
export const domainPathRegExp = /^[^\/](.*[^\/])?$/g;

// name=aragorn&version=1
export const domainQueryRegExp = /^[\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*$/g;

export const domainValidationRule = {
  pattern: domainRegExp,
  message: '首部需要包含域名协议，如 https:// 且尾部不能含有 /'
};

export const domainPathValidationRule = {
  pattern: domainPathRegExp,
  message: '首尾不能含有 /'
};

export const domainQueryValidationRule = {
  pattern: domainQueryRegExp,
  message: '首部不能含有 ?'
};

export const getFormRule = (validationRule?: UploaderOptionValidationRuleArr) => {
  let rule: UploaderOptionValidationRuleArr = [];
  validationRule?.forEach(item => {
    if (item === 'domain') {
      rule.push(domainValidationRule);
    } else if (item === 'domainPath') {
      rule.push(domainPathValidationRule);
    } else if (item === 'domainQuery') {
      rule.push(domainQueryValidationRule);
    } else if (item?.pattern) {
      item.pattern = new RegExp(item.pattern);
      rule.push(item);
    }
  });
  return rule;
};
