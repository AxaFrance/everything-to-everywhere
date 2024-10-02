export const log = (msg: string) => process.env.NODE_ENV !== 'production' && console.log(msg);

const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const isArray = (str: string) => {
  try {
    return Array.isArray(JSON.parse(str));
  } catch {
    return false;
  }
};

export const getPropsFromAStringComponent = (stringifyComponent: React.FC) => {
  const splitToArrow = stringifyComponent.toString().split('=>')[0];
  const sanitizedStr = splitToArrow.toString().replace(/ /g, '').replace(/\n/g, '');
  return sanitizedStr
    .substring(sanitizedStr.toString().indexOf('({') + 2, sanitizedStr.toString().indexOf('})'))
    .split(',')
    .map((el: string) => el.substring(0, el.includes('=') ? el.indexOf('=') : Infinity))
    .map((el: string) => el.substring(0, el.indexOf(':')));
};

export const parseValue = (value: string) => {
  switch (true) {
    case !isNaN(Number(value)):
      return Number(value);
    case value === 'true' || value === 'false':
      return value === 'true';
    case isArray(value!):
      return JSON.parse(value!.replace(/'/g, '"'));
    case isJsonString(value!):
      return JSON.parse(value!);
    default:
      return value;
  }
};

export const camelCasetoKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
export const kebabCaseToCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
