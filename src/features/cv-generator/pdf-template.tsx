import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
    Font,
    renderToBuffer
} from '@react-pdf/renderer';
import type { StructuredCV } from './types';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' },
        { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Oblique.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000',
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        fontSize: 9,
        flexWrap: 'wrap',
    },
    link: {
        color: '#0000FF',
        textDecoration: 'none',
    },
    section: {
        marginTop: 15,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        borderBottom: '1pt solid #ccc',
        paddingBottom: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    experienceEntry: {
        marginBottom: 10,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    companyName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0000FF',
    },
    roleTitle: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    boldText: {
        fontWeight: 'bold',
    },
    dates: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    location: {
        fontSize: 9,
        fontStyle: 'italic',
    },
    bulletList: {
        marginTop: 4,
        marginLeft: 10,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bulletPoint: {
        width: 10,
        fontSize: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 10,
        textAlign: 'justify',
    },
    skillRow: {
        flexDirection: 'row',
        marginBottom: 4,
        gap: 4,
    },
    projectItem: {
        marginBottom: 6,
    },
    summary: {
        fontSize: 10,
        marginBottom: 10,
        textAlign: 'justify',
    }
});

const CVDocument = ({ data }: { data: StructuredCV }) => {
    return (
        <Document title={`CV - ${data.header.name}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.header.name}</Text>
                    {/* We might want to pass job_title to the template as well, but StructuredCV header doesn't have it by default. 
              The user mentioned "current title (large, bold) centered at top" in style rules.
              I will look at StructuredCV again. It has summary. 
          */}
                    <Text style={styles.title}>{data.header.title}</Text>
                    <View style={styles.contactRow}>
                        <Text>{data.header.phone}</Text>
                        <Text>•</Text>
                        <Text>{data.header.email}</Text>
                        <Text>•</Text>
                        <Link style={styles.link} src={data.header.github}>GitHub</Link>
                        <Text>•</Text>
                        <Link style={styles.link} src={data.header.linkedin}>LinkedIn</Link>
                    </View>
                </View>


                {/* Professional Experience */}
                {data.experience.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Experience</Text>
                        {data.experience.map((exp, i) => (
                            <View key={i} style={styles.experienceEntry}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.companyName}>{exp.company}</Text>
                                    <Text style={styles.dates}>{exp.start_date} - {exp.end_date}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.roleTitle}>{exp.title}</Text>
                                    <Text style={styles.location}>{exp.location}</Text>
                                </View>
                                <View style={styles.bulletList}>
                                    {exp.bullets.map((bullet, j) => (
                                        <View key={j} style={styles.bulletItem}>
                                            <Text style={styles.bulletPoint}>•</Text>
                                            <Text style={styles.bulletText}>{bullet}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {data.skills.categories.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        {data.skills.categories.map((cat, i) => (
                            <View key={i} style={styles.skillRow}>
                                <Text style={styles.boldText}>{cat.name}:</Text>
                                <Text>{cat.skills.join(', ')}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Certifications */}
                {data.certificates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {data.certificates.map((cert, i) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.boldText}>{cert.title}</Text>
                                    <Link style={styles.link} src={cert.url}>Verify</Link>
                                </View>
                                <Text style={styles.location}>{cert.issuer} | {cert.date}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.companyName}>{edu.institution}</Text>
                                    <Text style={styles.dates}>{edu.dates}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text>{edu.degree} in {edu.field}</Text>
                                    <Text style={styles.location}>{edu.grade}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((proj, i) => (
                            <View key={i} style={styles.projectItem}>
                                <Link style={[styles.boldText, styles.link]} src={proj.url}>{proj.name}</Link>
                                <Text style={{ marginTop: 2 }}>{proj.description}</Text>
                                <Text style={{ fontSize: 8, color: '#666', marginTop: 1 }}>
                                    Tech: {proj.tech_stack.join(', ')}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};

export async function generateCVPdf(cvData: StructuredCV): Promise<Buffer> {
    const buffer = await renderToBuffer(<CVDocument data={cvData} />);
    return buffer;
}
