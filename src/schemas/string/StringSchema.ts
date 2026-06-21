import { BaseSchema } from "../../core/BaseSchema";
import { Issue, describeReceived } from "../../core/result";

type ValidationRule = {
  check: (value: string) => boolean;
  message: string;
};

export class StringSchema extends BaseSchema<string> {
  private rules: ValidationRule[] = [];

  _parse(input: unknown, path: Issue["path"]): Issue[] | string {
    if (typeof input !== "string") {
      return [{ path, message: `Expected string, received ${describeReceived(input)}` }];
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
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === value.toLowerCase(),
      message: message ?? "String must be lowercase",
    });
    return clone;
  }

  uppercase(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === value.toUpperCase(),
      message: message ?? "String must be uppercase",
    });
    return clone;
  }

  alpha(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[A-Za-z]+$/.test(value),
      message: message ?? "String must contain only letters",
    });
    return clone;
  }

  alphanumeric(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[A-Za-z0-9]+$/.test(value),
      message: message ?? "String must contain only letters and numbers",
    });
    return clone;
  }

  ascii(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[\x00-\x7F]+$/.test(value),
      message: message ?? "String must contain only ASCII characters",
    });
    return clone;
  }

  uuid(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        ),
      message: message ?? "String must be a valid UUID",
    });
    return clone;
  }

  ip(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => {
        const parts = value.split(".");
        if (parts.length !== 4) return false;
        return parts.every(p => /^\d{1,3}$/.test(p) && +p >= 0 && +p <= 255);
      },
      message: message ?? "String must be a valid IPv4 address",
    });
    return clone;
  }

  noWhitespace(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => !/\s/.test(value),
      message: message ?? "String must not contain whitespace",
    });
    return clone;
  }

  nonempty(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length > 0,
      message: message ?? "String cannot be empty",
    });
    return clone;
  }

  notEmpty(message?: string): this {
    return this.nonempty(message)
  }

  minLength(length: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length >= length,
      message: message ?? `String must be at least ${length} characters`,
    });
    return clone;
  }

  maxLength(length: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length <= length,
      message: message ?? `String must be at most ${length} characters`,
    });
    return clone;
  }

  length(exact: number, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.length === exact,
      message: message ?? `String must be exactly ${exact} characters`,
    });
    return clone;
  }

  email(message?: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => emailRegex.test(value),
      message: message ?? "Invalid email format",
    });
    return clone;
  }

  url(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
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
    return clone;
  }

  regex(pattern: RegExp, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => pattern.test(value),
      message: message ?? "String does not match pattern",
    });
    return clone;
  }

  startsWith(prefix: string, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.startsWith(prefix),
      message: message ?? `String must start with "${prefix}"`,
    });
    return clone;
  }

  endsWith(suffix: string, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.endsWith(suffix),
      message: message ?? `String must end with "${suffix}"`,
    });
    return clone;
  }

  includes(substring: string, message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value.includes(substring),
      message: message ?? `String must include "${substring}"`,
    });
    return clone;
  }

  datetime(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/.test(value),
      message: message ?? "String must be a valid ISO 8601 datetime",
    });
    return clone;
  }

  jwt(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value),
      message: message ?? "String must be a valid JWT format",
    });
    return clone;
  }

  cuid2(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[a-z][a-z0-9]{7,31}$/.test(value),
      message: message ?? "String must be a valid CUID2",
    });
    return clone;
  }

  ulid(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(value),
      message: message ?? "String must be a valid ULID",
    });
    return clone;
  }

  emoji(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => /^\p{Emoji}+$/u.test(value),
      message: message ?? "String must be a valid emoji sequence",
    });
    return clone;
  }

  cidr(message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => {
        const parts = value.split("/");
        if (parts.length !== 2) return false;
        const ipParts = parts[0].split(".");
        if (ipParts.length !== 4) return false;
        if (!ipParts.every(p => /^\d{1,3}$/.test(p) && +p >= 0 && +p <= 255)) return false;
        const bits = parseInt(parts[1], 10);
        return Number.isInteger(bits) && bits >= 0 && bits <= 32;
      },
      message: message ?? "String must be a valid CIDR notation (e.g., 192.168.1.0/24)",
    });
    return clone;
  }

  oneOf(options: string[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => options.includes(value),
      message: message ?? `String must be one of: ${options.join(", ")}`,
    });
    return clone;
  }

  notOneOf(options: string[], message?: string): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => !options.includes(value),
      message: message ?? `String must not be one of: ${options.join(", ")}`,
    });
    return clone;
  }

  trim(): this {
    const clone = this._clone() as this
    clone.rules.push({
      check: (value) => value === value.trim(),
      message: "String must not have leading or trailing whitespace",
    });
    return clone;
  }
}
