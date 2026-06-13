import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  statusCode: number
  code: string
  isOperational: boolean

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    })
    return
  }
  console.error('[error]', err)
  res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL' },
  })
}
