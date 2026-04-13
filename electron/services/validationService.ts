import type { Profile, ProfileInput } from "../../src/shared/profiles";
import { validateProfile, validateProfileInput } from "../../src/shared/schema";

export function validateIncomingProfileInput(input: ProfileInput): ProfileInput {
  return validateProfileInput(input);
}

export function validateStoredProfile(profile: Profile): Profile {
  return validateProfile(profile);
}
