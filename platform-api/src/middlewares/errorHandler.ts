import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // ZodError -> 400
  if (
    err !== null &&
    typeof err === 'object' &&
    'name' in err &&
    (err as { name: string }).name === 'ZodError'
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'リクエストのバリデーションに失敗しました',
        statusCode: 400,
      },
    });
    return;
  }

  // 既知の HTTP エラー（statusCode を持つエラー）
  if (
    err !== null &&
    typeof err === 'object' &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  ) {
    const httpErr = err as { statusCode: number; code?: string; message?: string };
    res.status(httpErr.statusCode).json({
      success: false,
      error: {
        code: httpErr.code ?? 'ERROR',
        message: httpErr.message ?? 'エラーが発生しました',
        statusCode: httpErr.statusCode,
      },
    });
    return;
  }

  // 未知のエラー -> 500
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'サーバー内部エラーが発生しました',
      statusCode: 500,
    },
  });
};
