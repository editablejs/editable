// Check if text contains markdown syntax
export const checkMarkdownSyntax = (text: string, html: string) => {
  if (!text) return false
  if (!html) return true
  // Split text into paragraphs
  const rows = text.split(/\r\n|\n/) || ''

  // Count of all valid paragraphs
  let rowCount = 0
  // Count of paragraphs with markdown syntax
  let validCount = 0
  // Flag for code block
  let isCodeblock = false

  // Extract ordered list texts from html
  const root = new DOMParser().parseFromString(html, 'text/html')
  const lis = root.querySelectorAll('li')
  const orderTexts: string[] = []
  lis.forEach(li => {
    const text = li.textContent ?? ''
    if (li.parentElement?.nodeName === 'OL' || /\d\.\s+/.test(text)) {
      orderTexts.push(text)
    }
  })

  // Check each paragraph
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i]
    if (!rowText.trim()) continue
    if (rowText.startsWith('```')) {
      if (!isCodeblock) {
        isCodeblock = true
        validCount++
        rowCount++
      } else {
        isCodeblock = false
      }
      continue
    }
    if (isCodeblock) continue
    rowCount++

    // Check if row contains markdown syntax
    if (/^(#|\*|-|\+|\[ \]|\[x\]|>){1,}\s+/.test(rowText)) {
      validCount++
    } else if (/^\d\.\s+/.test(rowText)) {
      if (
        !orderTexts.includes(rowText) &&
        !orderTexts.includes(rowText.replace(/^\d\./, '').trim())
      ) {
        validCount++
      }
    } else if (/^(---|\*\*\*|\+\+\+)/.test(rowText)) {
      validCount++
    } else if (/(\*|~|\^|_|\`|\]\(https?:\/\/)/.test(rowText)) {
      validCount++
    }
  }

  // Return true if more than half of the paragraphs contain markdown syntax
  if (validCount > 0 && (rowCount === 0 || validCount / rowCount > 0.5)) {
    return true
  }
}
