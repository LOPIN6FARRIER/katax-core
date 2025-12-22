import { BaseSchema } from "../../core/BaseSchema";
import { Issue } from "../../core/result";

type ValidationRule = {
  check: (value: string) => boolean;
  message: string;
};

export class StringSchema extends BaseSchema<string> {
  private rules: ValidationRule[] = [];

  _parse(input: unknown, path: Issue["path"]): Issue[] | string {
    if (typeof input !== "string") {
      return [{ path, message: "Expected string" }];
    }

    const issues: Issue[] = [];
    for (const rule of this.rules) {
      if (!rule.check(input)) {
        issues.push({ path, message: rule.message });
      }
    }

    if (issues.length > 0) {
      return issues;
    }

    return input;
  }

  protected _clone(): StringSchema {
    const cloned = new StringSchema();
    cloned.rules = [...this.rules];
    cloned._asyncValidators = [...this._asyncValidators];
    return cloned;
  }

  lowercase(message?: string): this {
    this.rules.push({
      check: (value) => value === value.toLowerCase(),
      message: message ?? "String must be lowercase",
    });
    return this;
  }

  uppercase(message?: string): this {
    this.rules.push({
      check: (value) => value === value.toUpperCase(),
      message: message ?? "String must be uppercase",
    });
    return this;
  }

  alpha(message?: string): this {
    this.rules.push({
      check: (value) => /^[A-Za-z]+$/.test(value),
      message: message ?? "String must contain only letters",
    });
    return this;
  }

  alphanumeric(message?: string): this {
    this.rules.push({
      check: (value) => /^[A-Za-z0-9]+$/.test(value),
      message: message ?? "String must contain only letters and numbers",
    });
    return this;
  }

  ascii(message?: string): this {
    this.rules.push({
      check: (value) => /^[\x00-\x7F]+$/.test(value),
      message: message ?? "String must contain only ASCII characters",
    });
    return this;
  }

  uuid(message?: string): this {
    this.rules.push({
      check: (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        ),
      message: message ?? "String must be a valid UUID",
    });
    return this;
  }

  ip(message?: string): this {
    this.rules.push({
      check: (value) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value),
      message: message ?? "String must be a valid IPv4 address",
    });
    return this;
  }

  noWhitespace(message?: string): this {
    this.rules.push({
      check: (value) => !/\s/.test(value),
      message: message ?? "String must not contain whitespace",
    });
    return this;
  }

  nonempty(message?: string): this {
    this.rules.push({
      check: (value) => value.length > 0,
      message: message ?? "String cannot be empty",
    });
    return this;
  }

  minLength(length: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length >= length,
      message: message ?? `String must be at least ${length} characters`,
    });
    return this;
  }

  maxLength(length: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length <= length,
      message: message ?? `String must be at most ${length} characters`,
    });
    return this;
  }

  length(exact: number, message?: string): this {
    this.rules.push({
      check: (value) => value.length === exact,
      message: message ?? `String must be exactly ${exact} characters`,
    });
    return this;
  }

  email(message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.rules.push({
      check: (value) => emailRegex.test(value),
      message: message ?? "Invalid email format",
    });
    return this;
  }

  url(message?: string): this {
    this.rules.push({
      check: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: message ?? "Invalid URL format",
    });
    return this;
  }

  regex(pattern: RegExp, message?: string): this {
    this.rules.push({
      check: (value) => pattern.test(value),
      message: message ?? "String does not match pattern",
    });
    return this;
  }

  startsWith(prefix: string, message?: string): this {
    this.rules.push({
      check: (value) => value.startsWith(prefix),
      message: message ?? `String must start with "${prefix}"`,
    });
    return this;
  }

  endsWith(suffix: string, message?: string): this {
    this.rules.push({
      check: (value) => value.endsWith(suffix),
      message: message ?? `String must end with "${suffix}"`,
    });
    return this;
  }

  includes(substring: string, message?: string): this {
    this.rules.push({
      check: (value) => value.includes(substring),
      message: message ?? `String must include "${substring}"`,
    });
    return this;
  }

  oneOf(options: string[], message?: string): this {
    this.rules.push({
      check: (value) => options.includes(value),
      message: message ?? `String must be one of: ${options.join(", ")}`,
    });
    return this;
  }

  notOneOf(options: string[], message?: string): this {
    this.rules.push({
      check: (value) => !options.includes(value),
      message: message ?? `String must not be one of: ${options.join(", ")}`,
    });
    return this;
  }

  trim(): this {
    this.rules.push({
      check: (value) => value === value.trim(),
      message: "String must not have leading or trailing whitespace",
    });
    return this;
  }
}
