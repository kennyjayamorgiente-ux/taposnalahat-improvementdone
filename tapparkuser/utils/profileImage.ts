import { getApiUrl } from '../config/api';

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i;

const getApiOrigin = (): string => {
  try {
    const apiUrl = getApiUrl();
    const parsed = new URL(apiUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
};

const stripQueryAndHash = (value: string): string => value.split('?')[0].split('#')[0];

const extractFilename = (value: string): string | null => {
  const clean = stripQueryAndHash(value).trim();
  if (!clean) return null;

  const lastSlash = clean.lastIndexOf('/');
  const filename = lastSlash >= 0 ? clean.slice(lastSlash + 1) : clean;
  if (!filename) return null;

  return filename;
};

export const normalizeProfileImageUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const input = rawUrl.trim();
  if (!input) return null;

  const filename = extractFilename(input);
  if (!filename || !IMAGE_EXT_RE.test(filename)) {
    return input;
  }

  const origin = getApiOrigin();
  if (!origin) return input;

  return `${origin}/uploads/profile-pictures/${filename}`;
};

export const withCacheBust = (url?: string | null): string | null => {
  const normalized = normalizeProfileImageUrl(url);
  if (!normalized) return null;
  return `${normalized}?t=${Date.now()}`;
};

export const normalizeUserProfileImageFields = <T extends Record<string, any>>(user?: T | null): T | null => {
  if (!user) return null;

  const normalizedImage =
    normalizeProfileImageUrl(user.profile_image) ||
    normalizeProfileImageUrl(user.profile_image_url);

  if (!normalizedImage) return user;

  return {
    ...user,
    profile_image: normalizedImage,
    profile_image_url: normalizedImage,
  };
};

