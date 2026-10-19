// ==============================================================================
// Aroom: ID-card storage (Supabase Storage when configured, in-memory otherwise)
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../db/supabase.js';

const BUCKET = process.env.ID_CARD_BUCKET || 'agent-ids';
const STORAGE_PREFIX = 'storage://';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Stores an uploaded ID card and returns a reference string to persist on the
 * agent profile. With Supabase configured the file goes to a PRIVATE bucket and
 * we keep `storage://<bucket>/<path>`. Without Supabase (local dev) we keep a
 * data URL so the flow still works end to end.
 */
export async function storeIdCard(contentType: string, dataBase64: string): Promise<string> {
  if (!ALLOWED.includes(contentType)) {
    throw new Error('ID photo must be a JPEG, PNG or WebP image.');
  }
  const buffer = Buffer.from(dataBase64, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new Error('ID photo must be smaller than 5 MB.');
  }

  if (!supabase) {
    return `data:${contentType};base64,${dataBase64}`;
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${new Date().getFullYear()}/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType });
  if (error) throw new Error(`Could not store ID photo: ${error.message}`);
  return `${STORAGE_PREFIX}${BUCKET}/${path}`;
}

/** Turns a stored reference into a URL the Team Leader's browser can display. */
export async function resolveIdCardUrl(ref: string): Promise<string | null> {
  if (!ref || ref === 'added-by-team-leader') return null;
  if (!ref.startsWith(STORAGE_PREFIX)) return ref; // data URL or legacy http URL
  if (!supabase) return null;

  const [bucket, ...rest] = ref.slice(STORAGE_PREFIX.length).split('/');
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rest.join('/'), 600);
  if (error) return null;
  return data.signedUrl;
}

