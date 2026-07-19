import type { Platform } from '../types/platform';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export async function getHealth(): Promise<{ status: string; environment: string }> {
  const response = await fetch('/health');
  if (!response.ok) throw new Error('Backend health check failed');
  return response.json();
}

export async function listPlatforms(): Promise<Platform[]> {
  const response = await fetch(`${API_BASE_URL}/platforms`);
  if (!response.ok) throw new Error('Could not load platforms');
  return response.json();
}

export async function createPlatform(name: string, url: string): Promise<Platform> {
  const response = await fetch(`${API_BASE_URL}/platforms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url }),
  });
  if (!response.ok) throw new Error('Could not create platform');
  return response.json();
}
