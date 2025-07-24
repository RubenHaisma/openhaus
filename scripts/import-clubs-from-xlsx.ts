import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'
import * as xlsx from 'xlsx'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, '../Clubs_met_sfeer_en_websites.xlsx')
  if (!fs.existsSync(filePath)) {
    console.error('Excel file not found:', filePath)
    process.exit(1)
  }

  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

  // Expecting header: ['Land', 'Competitie', 'Club', 'Website']
  const [header, ...dataRows] = rows
  if (!header || (header as any[]).length < 4) {
    console.error('Unexpected header in Excel file:', header)
    process.exit(1)
  }

  for (const row of dataRows as any[][]) {
    if (!row || row.length < 4) continue
    const [country, competition, name, website] = row
    if (!country || !competition || !name || !website) continue
    await prisma.club.upsert({
      where: {
        country_competition_name: {
          country: String(country),
          competition: String(competition),
          name: String(name),
        },
      },
      update: {
        website: String(website),
      },
      create: {
        country: String(country),
        competition: String(competition),
        name: String(name),
        website: String(website),
      },
    })
    console.log(`Upserted: ${country} | ${competition} | ${name}`)
  }

  await prisma.$disconnect()
  console.log('Import complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}) 