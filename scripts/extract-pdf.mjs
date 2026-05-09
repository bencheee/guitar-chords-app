import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default

const pdfPath = 'C:\\Users\\sandr\\Downloads\\eng pjesmarica.pdf'
const buffer = readFileSync(pdfPath)

const data = await pdfParse(buffer)

writeFileSync('scripts/pdf-output.txt', data.text, 'utf8')
console.log(`Pages: ${data.numpages}`)
console.log(`Characters extracted: ${data.text.length}`)
console.log('\n--- FIRST 3000 CHARS ---\n')
console.log(data.text.slice(0, 3000))
