export const parseResult: (input: any) => any = input => JSON.parse(Buffer.from(JSON.parse(input)).toString());

export const toString: (input: any) => string = input => JSON.stringify(input).replace(/"/g, '\\"');
