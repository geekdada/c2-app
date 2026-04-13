import path from "node:path";
import { mkdir, rename, writeFile } from "node:fs/promises";

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true });
}

export async function ensureParentDirectory(filePath: string): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
}

export async function writeFileAtomic(filePath: string, contents: string): Promise<void> {
  await ensureParentDirectory(filePath);

  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  await writeFile(temporaryPath, contents, "utf8");
  await rename(temporaryPath, filePath);
}

export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  const formatted = `${JSON.stringify(value, null, 2)}\n`;

  await writeFileAtomic(filePath, formatted);
}
