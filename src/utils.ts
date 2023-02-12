import pino from 'pino'

export const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
})

export const errorHandler =
  (typeException: string) => (error: unknown, method: string, data: object) => {
    if (error instanceof Error) {
      logger.error(
        `${typeException}. ${method}: ${error.message}. Cause: ${
          error.cause
        }. Data: ${JSON.stringify(data)} `,
      )

      return null
    }

    throw error
  }
