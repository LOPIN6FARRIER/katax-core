import { BaseSchema } from "../../core/BaseSchema";
import { Issue, describeReceived } from "../../core/result";
import type { JsonSchema } from "../../core/schema.types";

// Multer file structure (compatible with Express.Multer.File)
// Defined inline to avoid requiring @types/express as peer dependency
type MulterFile = {
  /** Field name from the form */
  fieldname: string;
  /** Name of the file on the user's computer */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Size of the file in bytes */
  size: number;
  /** The folder to which the file has been saved (DiskStorage) */
  destination?: string;
  /** The name of the file within the destination (DiskStorage) */
  filename?: string;
  /** Location of the uploaded file (DiskStorage) */
  path?: string;
  /** A Buffer of the entire file (MemoryStorage) */
  buffer: Buffer;
};

// Internal adapter for validation rules (normalizes File and MulterFile)
interface FileAdapter {
  name: string;
  size: number;
  type: string;
}

type ValidationRule = {
  check: (file: FileAdapter) => boolean;
  message: string;
};

// FileSchema now accepts both browser File and Node.js Multer files
export class FileSchema extends BaseSchema<File | MulterFile> {
  private rules: ValidationRule[] = [];

  _parse(input: unknown, path: Issue["path"]): Issue[] | File | MulterFile {
    // Normalize to FileAdapter (works in browser with File or Node with Multer-like objects)
    let fileAdapter: FileAdapter | null = null;

    // Browser File API
    if (typeof File !== "undefined" && input instanceof File) {
      fileAdapter = input;
    }
    // Node.js / Multer file object (has buffer, originalname, mimetype, size)
    else if (
      input &&
      typeof input === "object" &&
      "buffer" in input &&
      "originalname" in input &&
      "mimetype" in input &&
      "size" in input
    ) {
      const multerFile = input as any;
      fileAdapter = {
        name: multerFile.originalname,
        size: multerFile.size,
        type: multerFile.mimetype || "",
      };
    }

    if (!fileAdapter) {
      return [{ path, message: `Expected File object or file upload, received ${describeReceived(input)}` }];
    }

    const issues: Issue[] = [];
    for (const rule of this.rules) {
      if (!rule.check(fileAdapter)) {
        issues.push({ path, message: rule.message });
      }
    }

    if (issues.length > 0) {
      return issues;
    }

    return input as File | MulterFile;
  }

  toJsonSchema(): JsonSchema {
    return { ...this._jsonSchema } as JsonSchema
  }

  protected _clone(): FileSchema {
    const cloned = new FileSchema();
    cloned.rules = [...this.rules];
    cloned._asyncValidators = [...this._asyncValidators];
    cloned._jsonSchema = { ...this._jsonSchema };
    return cloned;
  }

  // File size validation
  maxSize(bytes: number, message?: string): this {
    this.rules.push({
      check: (file) => file.size <= bytes,
      message:
        message ?? `File size must be at most ${this.formatBytes(bytes)}`,
    });
    return this;
  }

  minSize(bytes: number, message?: string): this {
    this.rules.push({
      check: (file) => file.size >= bytes,
      message:
        message ?? `File size must be at least ${this.formatBytes(bytes)}`,
    });
    return this;
  }

  // MIME type validation
  type(mimeType: string, message?: string): this {
    this.rules.push({
      check: (file) => file.type === mimeType,
      message: message ?? `File must be of type ${mimeType}`,
    });
    return this;
  }

  // Multiple MIME types
  types(mimeTypes: string[], message?: string): this {
    this.rules.push({
      check: (file) => mimeTypes.includes(file.type),
      message: message ?? `File must be one of types: ${mimeTypes.join(", ")}`,
    });
    return this;
  }

  // MIME type patterns (e.g., "image/*", "video/*")
  typePattern(pattern: string, message?: string): this {
    const regex = new RegExp(pattern.replace("*", ".*"));
    this.rules.push({
      check: (file) => regex.test(file.type),
      message: message ?? `File type must match pattern ${pattern}`,
    });
    return this;
  }

  // File extension validation
  extension(ext: string, message?: string): this {
    const extension = ext.startsWith(".") ? ext : `.${ext}`;
    this.rules.push({
      check: (file) =>
        file.name.toLowerCase().endsWith(extension.toLowerCase()),
      message: message ?? `File must have ${extension} extension`,
    });
    return this;
  }

  extensions(exts: string[], message?: string): this {
    const extensions = exts.map((ext) =>
      ext.startsWith(".") ? ext : `.${ext}`,
    );
    this.rules.push({
      check: (file) =>
        extensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext.toLowerCase()),
        ),
      message:
        message ??
        `File must have one of these extensions: ${extensions.join(", ")}`,
    });
    return this;
  }

  // File name validation
  namePattern(pattern: RegExp, message?: string): this {
    this.rules.push({
      check: (file) => pattern.test(file.name),
      message: message ?? `File name must match the required pattern`,
    });
    return this;
  }

  // Predefined file type helpers
  image(message?: string): this {
    return this.typePattern("image/*", message ?? "File must be an image");
  }

  video(message?: string): this {
    return this.typePattern("video/*", message ?? "File must be a video");
  }

  audio(message?: string): this {
    return this.typePattern("audio/*", message ?? "File must be an audio file");
  }

  document(message?: string): this {
    const docTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    return this.types(docTypes, message ?? "File must be a document");
  }

  // Helper method to format bytes
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
