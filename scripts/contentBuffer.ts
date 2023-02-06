import archiver from 'archiver'
import { once } from 'events'

type GetZipBuffer = (p: string) => Promise<{ content: Buffer; pointer: number }>

const getZipBuffer: GetZipBuffer = async folderPath => {
  const archive = archiver('zip')
  const buffer: Buffer[] = []

  archive.on('data', data => {
    buffer.push(data)
  })

  archive.on('error', console.error)

  archive.directory(folderPath, false)
  archive.finalize()

  await once(archive, 'end')

  return { content: Buffer.concat(buffer), pointer: archive.pointer() }
}

export default getZipBuffer
