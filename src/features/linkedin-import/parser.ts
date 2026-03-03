import AdmZip from 'adm-zip'
import type {
    LinkedInProfile,
    LinkedInPosition,
    LinkedInEducation,
    LinkedInSkill,
    LinkedInCertification,
    LinkedInProject,
    LinkedInImportPreview,
} from './types'

// ─── CSV Parser ──────────────────────────────────────────────────────────────

/**
 * Minimal RFC 4180-compliant CSV row parser.
 * Handles quoted fields with embedded commas and newlines.
 */
function parseCSVRow(row: string): string[] {
    const fields: string[] = []
    let cur = ''
    let inQuotes = false

    for (let i = 0; i < row.length; i++) {
        const ch = row[i]
        if (ch === '"') {
            if (inQuotes && row[i + 1] === '"') {
                cur += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (ch === ',' && !inQuotes) {
            fields.push(cur.trim())
            cur = ''
        } else {
            cur += ch
        }
    }
    fields.push(cur.trim())
    return fields
}

/**
 * Parse a CSV string into an array of objects keyed by header names.
 * Skips blank lines. Graceful — never throws.
 */
function parseCSV(content: string): Record<string, string>[] {
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    const nonEmpty = lines.filter(l => l.trim() !== '')
    if (nonEmpty.length < 2) return []

    const headers = parseCSVRow(nonEmpty[0]).map(h => h.replace(/^\uFEFF/, '').trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < nonEmpty.length; i++) {
        const values = parseCSVRow(nonEmpty[i])
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
            row[h] = (values[idx] ?? '').trim()
        })
        rows.push(row)
    }

    return rows
}

// ─── Date Parsing ─────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12',
}

/**
 * Convert LinkedIn date strings like "Jan 2025" or "2023" to ISO "YYYY-MM-DD".
 * Returns null if unparseable.
 */
function parseLinkedInDate(raw: string): string | null {
    if (!raw || raw.trim() === '') return null
    const parts = raw.trim().split(' ')
    if (parts.length === 2) {
        const month = MONTH_MAP[parts[0].toLowerCase().slice(0, 3)]
        const year = parts[1]
        if (month && year) return `${year}-${month}-01`
    }
    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
        return `${parts[0]}-01-01`
    }
    return null
}

// ─── ZIP Entry Lookup ─────────────────────────────────────────────────────────

function getEntry(zip: AdmZip, name: string): string | null {
    try {
        // LinkedIn occasionally nests files inside a folder
        const entries = zip.getEntries()
        const match = entries.find(e =>
            e.entryName === name ||
            e.entryName.endsWith(`/${name}`) ||
            e.entryName.endsWith(`\\${name}`)
        )
        if (!match) return null
        return match.getData().toString('utf8')
    } catch {
        return null
    }
}

// ─── Section Parsers ──────────────────────────────────────────────────────────

function parseProfile(zip: AdmZip): LinkedInProfile | null {
    const content = getEntry(zip, 'Profile.csv')
    if (!content) return null
    const rows = parseCSV(content)
    if (rows.length === 0) return null
    const r = rows[0]
    const city = (r['Geo Location'] || '').split(',')[0].trim()
    return {
        firstName: r['First Name'] || '',
        lastName: r['Last Name'] || '',
        headline: r['Headline'] || '',
        summary: r['Summary'] || '',
        geoLocation: city,
        industry: r['Industry'] || '',
    }
}

function parsePositions(zip: AdmZip): LinkedInPosition[] {
    const content = getEntry(zip, 'Positions.csv')
    if (!content) return []
    const rows = parseCSV(content)
    return rows
        .filter(r => r['Company Name'] || r['Title'])
        .map(r => ({
            companyName: r['Company Name'] || '',
            title: r['Title'] || '',
            description: r['Description'] || '',
            location: r['Location'] || '',
            startedOn: r['Started On'] || '',
            finishedOn: r['Finished On'] || '',
            isCurrent: !r['Finished On'] || r['Finished On'].trim() === '',
        }))
}

function parseEducation(zip: AdmZip): LinkedInEducation[] {
    const content = getEntry(zip, 'Education.csv')
    if (!content) return []
    const rows = parseCSV(content)
    return rows
        .filter(r => r['School Name'])
        .map(r => ({
            schoolName: r['School Name'] || '',
            degreeName: r['Degree Name'] || '',
            startDate: r['Start Date'] || '',
            endDate: r['End Date'] || '',
            notes: r['Notes'] || '',
            activities: r['Activities'] || '',
        }))
}

function parseSkills(zip: AdmZip): LinkedInSkill[] {
    const content = getEntry(zip, 'Skills.csv')
    if (!content) return []
    const rows = parseCSV(content)
    return rows
        .filter(r => r['Name'])
        .map(r => ({ name: r['Name'] }))
}

function parseCertifications(zip: AdmZip): LinkedInCertification[] {
    const content = getEntry(zip, 'Certifications.csv')
    if (!content) return []
    const rows = parseCSV(content)
    return rows
        .filter(r => r['Name'])
        .map(r => ({
            name: r['Name'] || '',
            url: r['Url'] || '',
            authority: r['Authority'] || '',
            startedOn: r['Started On'] || '',
            finishedOn: r['Finished On'] || '',
            licenseNumber: r['License Number'] || '',
        }))
}

function parseProjects(zip: AdmZip): LinkedInProject[] {
    const content = getEntry(zip, 'Projects.csv')
    if (!content) return []
    const rows = parseCSV(content)
    return rows
        .filter(r => r['Title'])
        .map(r => ({
            title: r['Title'] || '',
            description: r['Description'] || '',
            url: r['Url'] || '',
            startedOn: r['Started On'] || '',
            finishedOn: r['Finished On'] || '',
        }))
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseLinkedInZip(buffer: Buffer): LinkedInImportPreview {
    const zip = new AdmZip(buffer)

    const profile = parseProfile(zip)
    const positions = parsePositions(zip)
    const education = parseEducation(zip)
    const skills = parseSkills(zip)
    const certifications = parseCertifications(zip)
    const projects = parseProjects(zip)

    return {
        profile,
        positions,
        education,
        skills,
        certifications,
        projects,
        counts: {
            experiences: positions.length + projects.length,
            education: education.length,
            skills: skills.length,
            certifications: certifications.length,
            projects: projects.length,
        },
    }
}

// Re-export date helper so actions.ts can use it
export { parseLinkedInDate }
