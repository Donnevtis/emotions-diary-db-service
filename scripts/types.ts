export type FunctionConfig = {
  functionId: string
  runtime: string
  entrypoint: string
  resources: {
    memory: number
  }
  executionTimeout: {
    seconds: number
  }
  environment: Record<string, string>
  serviceAccountId: string
  secrets: {
    id: string
    versionId: string
    environmentVariable: string
    key: string
  }[]
}
