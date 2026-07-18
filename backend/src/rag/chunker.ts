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
    const questions = splitQuestions(section.text)
    for (const q of questions) {
      if (q.text.trim().length < 20) continue
      chunks.push({
        noiDung: q.text.trim(),
        vaiTro: section.role,
        metadata: {
          file: fileName,
          section: section.name,
          questionId: q.id,
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

interface Question {
  id: string
  text: string
}

function splitQuestions(text: string): Question[] {
  const questions: Question[] = []
  const parts = text.split(/(?=(?:^|\n)\s*(?:\d+\.\s|Tags:\s))/gm)

  let qIndex = 0
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.length < 20) continue
    if (/^(?:#|##)\s/.test(trimmed) && !trimmed.includes('Tags:') && !trimmed.includes('Câu hỏi:')) continue

    qIndex++
    questions.push({ id: `Q${qIndex}`, text: trimmed })
  }

  return questions
}
