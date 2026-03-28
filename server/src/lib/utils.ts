import type { Response } from 'express';

export function isDbError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as any).code === 'string'
  );
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function handleDbErrorResponse(error: unknown, res: Response): boolean {
  if (isDbError(error)) {
    if (error.code === '23503') {
      res.status(400).json({ error: 'Referenced user does not exist' });
      return true;
    }
    if (error.code === '23505') {
      res.status(409).json({ error: 'Duplicate entry' });
      return true;
    }
  }
  return false;
}
