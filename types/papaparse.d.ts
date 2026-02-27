declare module "papaparse" {
  export type ParseError = {
    message: string;
  };

  export type ParseResult<T> = {
    data: T[];
    errors: ParseError[];
  };

  export type ParseConfig<T> = {
    header?: boolean;
    skipEmptyLines?: boolean | "greedy";
    dynamicTyping?: boolean;
    complete?: (result: ParseResult<T>) => void;
    error?: (error: ParseError) => void;
  };

  export function parse<T = unknown>(
    input: string | File | Blob,
    config?: ParseConfig<T>
  ): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
