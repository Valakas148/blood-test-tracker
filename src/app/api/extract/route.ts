import { NextRequest, NextResponse } from 'next/server'
import { extractBiomarkersFromFile } from '@/lib/api/gemini'
import { parseCSV } from '@/lib/parsers/csv.parser'

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'application/pdf',
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'text/csv': 'text/csv',
  'application/csv': 'application/csv',
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      const text = await file.text()
      const biomarkers = parseCSV(text)
      if (biomarkers.length === 0) {
        return NextResponse.json(
          { error: 'No biomarkers found in the CSV file. Check column format: name,value,unit,min,max.' },
          { status: 422 }
        )
      }
      return NextResponse.json({ biomarkers })
    }

    const mimeType = ALLOWED_TYPES[file.type]
    if (!mimeType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PDF, PNG, JPG, JPEG, or CSV.' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const biomarkers = await extractBiomarkersFromFile(buffer, mimeType)

    if (biomarkers.length === 0) {
      return NextResponse.json(
        { error: 'No biomarkers found in the file. Try a clearer image.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ biomarkers })
  } catch (error) {
    console.error('Extraction error:', error)

    if (error instanceof Error && error.message === 'GEMINI_TEMPORARILY_UNAVAILABLE') {
      return NextResponse.json(
        { error: 'AI service is temporarily busy. Please try again in a few seconds.' },
        { status: 503 }
      )
    }

    if (error instanceof SyntaxError || (error instanceof Error && error.message === 'GEMINI_INVALID_RESPONSE_FORMAT')) {
      return NextResponse.json(
        { error: 'AI returned an invalid response format. Please retry extraction.' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Extraction failed. Please try again.' },
      { status: 500 }
    )
  }
}