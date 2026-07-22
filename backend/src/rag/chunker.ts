// Chia tai lieu PDF Q&A thanh cac chunk theo vai tro (dan/thon/xa/chung)
export interface Chunk {
  noiDung: string
  vaiTro: string
  metadata: {
    file: string
    section: string
    questionId: string
  }
}

export function chunkPdfQA(text: string, fileName: string): Chunk[] {
  const chunks: Chunk[] = []
  const sections = detectSections(text)

  for (const section of sections) {
    let entries: string[]
    switch (section.role) {
      case 'dan':
        entries = splitDanEntries(section.text)
        break
      case 'thon':
        entries = splitThonEntries(section.text)
        break
      case 'xa':
        entries = splitXaEntries(section.text)
        break
      default:
        entries = splitGenericEntries(section.text)
    }

    for (let i = 0; i < entries.length; i++) {
      const trimmed = entries[i].trim()
      if (trimmed.length < 20) continue
      chunks.push({
        noiDung: trimmed,
        vaiTro: section.role,
        metadata: {
          file: fileName,
          section: section.name,
          questionId: `Q${chunks.length + 1}`,
        },
      })
    }
  }

  return chunks
}

interface Section {
  name: string
  role: string
  text: string
}

function detectSections(text: string): Section[] {
  const sections: Section[] = []
  const lines = text.split('\n')

  let currentRole = 'chung'
  let currentName = 'Chung'
  let currentLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^Đối tượng:\s*Người dân/i.test(trimmed) || trimmed === 'Dân') {
      if (currentLines.length > 0) {
        sections.push({ name: currentName, role: currentRole, text: currentLines.join('\n') })
      }
      currentRole = 'dan'
      currentName = 'Dân'
      currentLines = []
      continue
    }

    if (/^#?\s*PHẦN B/i.test(trimmed) || trimmed === 'Thôn') {
      if (currentLines.length > 0) {
        sections.push({ name: currentName, role: currentRole, text: currentLines.join('\n') })
      }
      currentRole = 'thon'
      currentName = 'Thôn'
      currentLines = []
      continue
    }

    if (/^#?\s*PHẦN C/i.test(trimmed) || (trimmed === 'Xã' && currentRole !== 'dan')) {
      if (currentLines.length > 0) {
        sections.push({ name: currentName, role: currentRole, text: currentLines.join('\n') })
      }
      currentRole = 'xa'
      currentName = 'Xã'
      currentLines = []
      continue
    }

    if (/^#?\s*PHẦN D/i.test(trimmed) || /Q&A cho mọi vai trò/i.test(trimmed)) {
      if (currentLines.length > 0) {
        sections.push({ name: currentName, role: currentRole, text: currentLines.join('\n') })
      }
      currentRole = 'chung'
      currentName = 'Chung'
      currentLines = []
      continue
    }

    currentLines.push(line)
  }

  if (currentLines.length > 0) {
    sections.push({ name: currentName, role: currentRole, text: currentLines.join('\n') })
  }

  return sections
}

// Section Dan: entry bat dau bang "\d+\. " MA ngay sau co dong "Tags:" trong 3 dong ke tiep
function splitDanEntries(text: string): string[] {
  const lines = text.split('\n')
  const entryStarts: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (!/^\d+\.\s/.test(lines[i].trim())) continue

    let found = false
    let scanned = 0
    for (let j = i + 1; j < lines.length && scanned < 3; j++) {
      const next = lines[j].trim()
      if (next === '') continue
      scanned++
      if (/^Tags:\s/i.test(next)) { found = true; break }
      if (/^\d+\.\s/.test(next) || /^(Câu hỏi|Trả lời)/i.test(next)) break
    }
    if (found) entryStarts.push(i)
  }

  const entries: string[] = []
  for (let i = 0; i < entryStarts.length; i++) {
    const start = entryStarts[i]
    const end = i + 1 < entryStarts.length ? entryStarts[i + 1] : lines.length
    entries.push(lines.slice(start, end).join('\n'))
  }
  return entries
}

// Section Thon (PHAN B): entry phan cach bang "---"
function splitThonEntries(text: string): string[] {
  const blocks = text.split(/\n\s*---\s*\n/)
  const entries: string[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (trimmed.length < 20) continue
    if (!/\*\*Tags:\*\*|Tags:/i.test(trimmed)) continue
    entries.push(trimmed)
  }
  return entries
}

// Section Xa (PHAN C): ben trong moi nhom ## C\d+. co nhieu entry, tach bang Tags:
function splitXaEntries(text: string): string[] {
  return splitByTagsAnchor(text)
}

// Fallback: thu --- roi ## roi Tags:
function splitGenericEntries(text: string): string[] {
  const hrParts = text.split(/\n\s*---\s*\n/)
  if (hrParts.length > 1) {
    return hrParts.filter(p => p.trim().length > 20).map(p => p.trim())
  }

  const headerParts = text.split(/(?=^##\s)/m)
  if (headerParts.length > 1) {
    return headerParts.filter(p => p.trim().length > 20).map(p => p.trim())
  }

  return splitByTagsAnchor(text)
}

function splitByTagsAnchor(text: string): string[] {
  const lines = text.split('\n')
  const entryStarts: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (/^(\*\*)?Tags:(\*\*)?\s/i.test(lines[i].trim())) {
      let titleLine = i
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        if (lines[j].trim().length > 0) { titleLine = j; break }
      }
      entryStarts.push(titleLine)
    }
  }

  const entries: string[] = []
  for (let i = 0; i < entryStarts.length; i++) {
    const start = entryStarts[i]
    const end = i + 1 < entryStarts.length ? entryStarts[i + 1] : lines.length
    entries.push(lines.slice(start, end).join('\n'))
  }
  return entries
}
