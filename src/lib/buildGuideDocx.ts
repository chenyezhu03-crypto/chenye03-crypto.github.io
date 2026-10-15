import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { classifyGuideLine } from './travelGuideFormat'
import type { TravelGuideDoc } from './travelGuideTypes'

function paragraphForLine(line: string): Paragraph {
  const kind = classifyGuideLine(line)
  if (kind === 'title') {
    return new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: line, bold: true, size: 32 })],
      spacing: { after: 200 },
    })
  }
  if (kind === 'day' || kind === 'section') {
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
  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: '目录提示：完整版请在 Word 中使用导航窗格或搜索 DAY / 出发前',
          italics: true,
          size: 20,
        }),
      ],
      spacing: { after: 200 },
    }),
    ...doc.lines.map((line) => paragraphForLine(line)),
  ]

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
