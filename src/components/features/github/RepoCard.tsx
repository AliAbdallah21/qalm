'use client'

import { useState } from 'react'
import { Star, GitFork, Github, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { GithubRepo } from '@/features/github/types'

interface RepoCardProps {
    repo: GithubRepo
}

export function RepoCard({ repo }: RepoCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="bg-surface-card border border-border-subtle rounded-[2rem] p-8 flex flex-col justify-between group hover:border-accent-blue/30 transition-all relative overflow-hidden h-full">
            <div className="relative z-10">
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                            <Github size={20} className="text-[var(--text-primary)]" />
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-primary)] italic tracking-tight truncate" title={repo.repo_name}>
                            {repo.repo_name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-main/50 px-3 py-1.5 rounded-full border border-border-subtle">
                        <span className="flex items-center gap-1.5">
                            <Star size={12} className="text-warning" /> {repo.stars}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <GitFork size={12} className="text-accent-blue" /> {repo.forks}
                        </span>
                    </div>
                </div>

                {repo.description && (
                    <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6 line-clamp-2">
                        {repo.description}
                    </p>
                )}

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-accent-blue" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Neural Summary</h4>
                    </div>

                    <div className={`relative ${!isExpanded ? 'max-h-24 overflow-hidden' : ''} transition-all duration-300`}>
                        <div className="text-sm text-text-secondary bg-surface-main/50 p-5 rounded-2xl border border-border-subtle prose prose-invert prose-sm max-w-none font-medium leading-relaxed italic">
                            {repo.readme_summary ? (
                                <ReactMarkdown>{repo.readme_summary}</ReactMarkdown>
                            ) : (
                                'No README summary available for this repository.'
                            )}
                        </div>
                        {!isExpanded && repo.readme_summary && repo.readme_summary.length > 150 && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-main/80 to-transparent flex items-end justify-center pb-2" />
                        )}
                    </div>

                    {repo.readme_summary && repo.readme_summary.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-[10px] font-black text-accent-blue uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp size={14} />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={14} />
                                    Read Analysis
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                    {repo.languages && Object.keys(repo.languages).slice(0, 3).map(lang => (
                        <span key={lang} className="px-3 py-1 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-[9px] font-black text-accent-blue uppercase tracking-widest">
                            {lang}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${repo.is_featured
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-surface-hover text-text-muted border-border-subtle'
                        }`}>
                        {repo.is_featured ? 'Featured' : 'Standard'}
                    </span>
                    <a
                        href={repo.html_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-accent-blue/10 transition-colors" />
        </div>
    )
}