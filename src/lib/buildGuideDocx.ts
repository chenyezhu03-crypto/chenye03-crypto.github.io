import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { classifyGuideLine } from './travelGuideFormat'
import {
  classifyWordTemplateLine,
  parseWordFieldLine,
} from './guideWordMode'
import type { TravelGuideDoc } from './travelGuideTypes'

function paragraphForTemplateLine(line: string, prev?: string): Paragraph {
  const field = parseWordFieldLine(line)
  if (field) {
    return new Paragraph({
      children: [
        new TextRun({ text: `${field.label}  `, bold: true, size: 21 }),
        new TextRun({ text: field.value, size: 21 }),
      ],
      spacing: { after: 80 },
    })
  }

  const wkind = classifyWordTemplateLine(line, prev)
  if (wkind === 'day') {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: line, bold: true, size: 30, color: '1a4f7a' })],
      spacing: { before: 280, after: 140 },
      pageBreakBefore: line.startsWith('DAY 1 ·') || line.startsWith('DAY 1  '),
    })
  }
  if (wkind === 'poiTitle') {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: line, bold: true, size: 26 })],
      spacing: { before: 200, after: 60 },
    })
  }
  if (wkind === 'poiEn') {
    return new Paragraph({
      children: [
        new TextRun({ text: line, italics: true, size: 22, color: '444444' }),
      ],
      spacing: { after: 60 },
    })
  }
  if (wkind === 'source') {
    return new Paragraph({
      children: [
        new TextRun({ text: line, italics: true, size: 18, color: '666666' }),
      ],
      spacing: { after: 40 },
    })
  }

  const kind = classifyGuideLine(line)
  if (kind === 'title') {
    return new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: line, bold: true, size: 32 })],
      spacing: { after: 200 },
    })
  }
  if (kind === 'section') {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: line, bold: true, size: 28 })],
      spacing: { before: 240, after: 120 },
    })
  }
  if (kind === 'subhead' || kind === 'label') {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: line, bold: true, size: 24 })],
      spacing: { before: 160, after: 80 },
    })
  }
  if (kind === 'muted') {
    return new Paragraph({
      children: [
        new TextRun({ text: line, italics: true, color: '666666', size: 20 }),
      ],
      spacing: { after: 60 },
    })
  }
  return new Paragraph({
    children: [new TextRun({ text: line, size: 22 })],
    spacing: { after: 100 },
  })
}

export async function downloadGuideDocx(doc: TravelGuideDoc): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: '版式说明：分日标题 · 景点中英名 · 时间/怎么去/费用等字段，对齐《新加坡5晚6天_完整版》Word 模版。',
          italics: true,
          size: 18,
          color: '666666',
        }),
      ],
      spacing: { after: 200 },
    }),
  ]

  doc.lines.forEach((line, i) => {
    children.push(paragraphForTemplateLine(line, doc.lines[i - 1]))
  })

  const file = new Document({
    sections: [{ properties: {}, children }],
  })

  const blob = await Packer.toBlob(file)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${doc.title.replace(/\s+/g, '')}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
