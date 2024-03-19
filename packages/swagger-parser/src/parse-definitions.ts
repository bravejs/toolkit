function parseEnum (name: string, obj: any) {
  const items: {
    key: string;
    value: string | number,
    comment?: string
  }[] = [];

  const names: string[] = obj['x-enum-varnames'] || [];
  const values = obj.enum || [];
  const comments = obj['x-enum-comments'] || {};

  names.forEach((key, index) => {
    items.push({
      key,
      value: values[index],
      comment: comments[key]
    });
  });

  return {
    name,
    items,
    type: 'enum'
  };
}

function parseInterface (name: string, obj: any) {
  const props = [];
  const properties = obj.properties || {};

  for (const key in properties) {
    const item = properties[key];
    const isArray = item.type === 'array';
    const typeObj = isArray ? item.items : item;

    props.push({
      key,
      isArray,
      comment: item.description,
      type: typeObj.type,
      ref: typeObj.$ref
    });
  }

  return {
    name,
    props,
    type: 'interface'
  };
}

export function parseDefinitions (definitions: any) {
  const enums = [];
  const interfaces = [];
  const refs: { [K: string]: any } = {};

  for (const key in definitions) {
    const obj = definitions[key];

    if (obj.enum) {
      const x = parseEnum(key, obj);

      enums.push(x);
      refs[key] = x;
    } else {
      const x = parseInterface(key, obj);

      interfaces.push(x);
      refs[key] = x;
    }
  }

  return { enums, interfaces, refs };
}