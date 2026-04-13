import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { BackupEntry } from "../../src/shared/ipc";
import { ensureDirectory, writeJsonAtomic, writeFileAtomic } from "./fileUtils";
import type { AppPaths } from "./paths";

type BackupFile = BackupEntry & {
  settingsContents: string;
};

function getBackupFilePath(paths: AppPaths, backupId: string): string {
  return path.join(paths.backupsDir, `${backupId}.json`);
}

export async function createBackup(
  paths: AppPaths,
  settingsContents: string,
): Promise<BackupEntry> {
  await ensureDirectory(paths.backupsDir);

  const backup: BackupFile = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    settingsContents,
  };

  await writeJsonAtomic(getBackupFilePath(paths, backup.id), backup);

  return {
    id: backup.id,
    createdAt: backup.createdAt,
  };
}

export async function listBackups(paths: AppPaths): Promise<BackupEntry[]> {
  try {
    const files = await readdir(paths.backupsDir);
    const backups = await Promise.all(
      files
        .filter((fileName) => fileName.endsWith(".json"))
        .map(async (fileName) => {
          const raw = await readFile(path.join(paths.backupsDir, fileName), "utf8");
          const parsed = JSON.parse(raw) as BackupFile;

          return {
            id: parsed.id,
            createdAt: parsed.createdAt,
          } satisfies BackupEntry;
        }),
    );

    return backups.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw new Error("Failed to list backups.");
  }
}

export async function restoreBackup(paths: AppPaths, backupId: string): Promise<void> {
  try {
    const raw = await readFile(getBackupFilePath(paths, backupId), "utf8");
    const parsed = JSON.parse(raw) as BackupFile;

    await writeFileAtomic(paths.claudeSettingsFile, parsed.settingsContents);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Backup not found.");
    }

    throw new Error("Failed to restore the selected backup.");
  }
}
