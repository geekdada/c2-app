import { readFile } from "node:fs/promises";

import {
  appStateSchemaVersion,
  type AppState,
  type Profile,
  type ProfileInput,
} from "../../src/shared/profiles";
import { validateAppState } from "../../src/shared/schema";
import { writeJsonAtomic } from "./fileUtils";
import type { AppPaths } from "./paths";
import { validateIncomingProfileInput, validateStoredProfile } from "./validationService";

export function createEmptyAppState(): AppState {
  return {
    schemaVersion: appStateSchemaVersion,
    activeProfileId: null,
    profiles: [],
  };
}

export async function readAppState(paths: AppPaths): Promise<AppState> {
  try {
    const raw = await readFile(paths.profilesFile, "utf8");

    return validateAppState(JSON.parse(raw) as AppState);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyAppState();
    }

    throw new Error("Failed to load saved profiles.");
  }
}

export async function writeAppState(paths: AppPaths, state: AppState): Promise<AppState> {
  const nextState = validateAppState(state);

  await writeJsonAtomic(paths.profilesFile, nextState);

  return nextState;
}

export async function listProfiles(paths: AppPaths): Promise<Profile[]> {
  const state = await readAppState(paths);

  return state.profiles;
}

export async function getActiveProfileId(paths: AppPaths): Promise<string | null> {
  const state = await readAppState(paths);

  return state.activeProfileId;
}

export async function getProfileById(paths: AppPaths, profileId: string): Promise<Profile | null> {
  const state = await readAppState(paths);

  return state.profiles.find((profile) => profile.id === profileId) ?? null;
}

export async function setActiveProfileId(
  paths: AppPaths,
  activeProfileId: string | null,
): Promise<AppState> {
  const state = await readAppState(paths);

  if (activeProfileId && !state.profiles.some((profile) => profile.id === activeProfileId)) {
    throw new Error("Cannot activate a profile that does not exist.");
  }

  return writeAppState(paths, {
    ...state,
    activeProfileId,
  });
}

export async function createProfile(paths: AppPaths, input: ProfileInput): Promise<Profile> {
  const state = await readAppState(paths);
  const validatedInput = validateIncomingProfileInput(input);
  const now = new Date().toISOString();

  const profile = validateStoredProfile({
    id: crypto.randomUUID(),
    name: validatedInput.name,
    env: validatedInput.env,
    createdAt: now,
    updatedAt: now,
  });

  await writeAppState(paths, {
    ...state,
    profiles: [...state.profiles, profile],
  });

  return profile;
}

export async function updateProfile(
  paths: AppPaths,
  profileId: string,
  input: ProfileInput,
): Promise<Profile> {
  const state = await readAppState(paths);
  const target = state.profiles.find((profile) => profile.id === profileId);

  if (!target) {
    throw new Error("Profile not found.");
  }

  const validatedInput = validateIncomingProfileInput(input);

  const updatedProfile = validateStoredProfile({
    ...target,
    name: validatedInput.name,
    env: validatedInput.env,
    updatedAt: new Date().toISOString(),
  });

  await writeAppState(paths, {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === profileId ? updatedProfile : profile,
    ),
  });

  return updatedProfile;
}

export async function deleteProfile(paths: AppPaths, profileId: string): Promise<void> {
  const state = await readAppState(paths);
  const remainingProfiles = state.profiles.filter((profile) => profile.id !== profileId);

  if (remainingProfiles.length === state.profiles.length) {
    throw new Error("Profile not found.");
  }

  const activeProfileId =
    state.activeProfileId === profileId
      ? (remainingProfiles[0]?.id ?? null)
      : state.activeProfileId;

  await writeAppState(paths, {
    ...state,
    activeProfileId,
    profiles: remainingProfiles,
  });
}
