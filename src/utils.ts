import { spawn } from 'child_process'
import * as winston from 'winston'
import { Optional } from 'typescript-optional'
import * as path from 'path'

export const log = winston.createLogger({
    transports: new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp }) => {
                return `${timestamp} ${level}: ${message}`;
            })
        ),
    }),
});

export const { info, debug, warn, error } = log

export const shell = async (command: string, dirOverride?: string, args?: string[]): Promise<string> => {
  const dir: string = Optional.ofNullable(dirOverride).orElse(path.join(__dirname, '../')) // <- default to project root
  const parts = command.split(/\s/)
  const c: string = args
    ? command
    : Optional.ofNullable(parts.shift()).orElseThrow(() => new Error(`command required to not be null`))
  const a = args ? args : parts
  const commandString = `${c} ${a.join(' ')}`

  info(`Executing command: '${commandString}' in dir: ${dir}`)

  const stdout = ''
  return new Promise((resolve, reject) => {
    const child = spawn(c, a, {
      cwd: dir,
      shell: true,
      stdio: 'inherit'
    })
    Optional.ofNullable(child.stdout).ifPresent((stdout) => {
      stdout.on('data', (data) => {
        stdout += data.toString()
        console.log(data.toString().trim())
      })
    })
    child.on('exit', (code) => {
      if (Optional.ofNullable(code).orElse(1) > 0) {
        reject(`command: '${commandString}' in dir: ${dir}, exited with code: ${code}`)
      }
      resolve(stdout)
    })
  })
}
