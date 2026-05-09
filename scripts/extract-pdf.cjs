const fs = require('fs')
const pdfParse = require('pdf-parse')

const pdfPath = 'C:\\Users\\sandr\\Downloads\\eng pjesmarica.pdf'
const buffer = fs.readFileSync(pdfPath)

pdfParse(buffer).then(data => {
  const text = data.text
  fs.writeFileSync('scripts/pdf-output.txt', text, 'utf8')
  console.log(`Pages: ${data.numpages}`)
  console.log(`Characters extracted: ${text.length}`)
  console.log('\n--- FIRST 3000 CHARS ---\n')
  console.log(text.slice(0, 3000))
}).catch(err => console.error('Error:', err.message))
