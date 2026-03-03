export interface LinkedInProfile {
    firstName: string
    lastName: string
    headline: string
    summary: string
    geoLocation: string
    industry: string
}

export interface LinkedInPosition {
    companyName: string
    title: string
    description: string
    location: string
    startedOn: string   // raw LinkedIn date e.g. "Jan 2023"
    finishedOn: string  // empty string if current
    isCurrent: boolean
}

export interface LinkedInEducation {
    schoolName: string
    degreeName: string
    startDate: string
    endDate: string
    notes: string
    activities: string
}

export interface LinkedInSkill {
    name: string
}

export interface LinkedInCertification {
    name: string
    url: string
    authority: string
    startedOn: string
    finishedOn: string
    licenseNumber: string
}

export interface LinkedInProject {
    title: string
    description: string
    url: string
    startedOn: string
    finishedOn: string
}

export interface LinkedInImportPreview {
    profile: LinkedInProfile | null
    positions: LinkedInPosition[]
    education: LinkedInEducation[]
    skills: LinkedInSkill[]
    certifications: LinkedInCertification[]
    projects: LinkedInProject[]
    counts: {
        experiences: number
        education: number
        skills: number
        certifications: number
        projects: number
    }
}
