import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
  if (error instanceof ZodError) {
    return err('Dados inválidos', 422, error.flatten());
  }
  console.error(error);
  return err('Erro interno do servidor', 500);
}
