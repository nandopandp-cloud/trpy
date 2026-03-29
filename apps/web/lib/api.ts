import { NextResponse } from 'next/server';

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function err(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details } satisfies ApiResponse<never>,
    { status }
  );
}

export function handleError(error: unknown) {
  // Zod v4 compat: check for issues array instead of instanceof
  if (error && typeof error === 'object' && 'issues' in error && Array.isArray((error as any).issues)) {
    const issues = (error as any).issues as Array<{ message: string; path?: (string | number)[] }>;
    const messages = issues.map((i) => i.message).join('; ');
    return err(`Dados inválidos: ${messages}`, 422);
  }
  console.error('[API Error]', error);
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  return err(message, 500);
}
