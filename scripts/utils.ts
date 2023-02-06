import cliSpinners from 'cli-spinners'
import ora from 'ora'

export const MiBtoByte = (MiB: number) => MiB * 1024 ** 2

export const spinner = ora({ spinner: cliSpinners.dots9 })
