import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { copyToClipboard } from '../../lib/utils'
import type { CopySuggestionsResult } from '../../types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        const ok = await copyToClipboard(text)
        if (ok) {
          setCopied(true)
          toast.message('Copied to clipboard')
          setTimeout(() => setCopied(false), 1500)
        } else {
          toast.error('Could not copy')
        }
      }}
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] btn-press px-2 py-1 rounded"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CopySuggestionsPanel({
  result,
}: {
  result: CopySuggestionsResult
}) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Ad headlines">
        <div
          className="overflow-hidden rounded-[10px]"
          style={{ border: '1px solid var(--border-default)' }}
        >
          {result.ad_headlines.map((headline, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 text-[13px]"
              style={{
                background:
                  i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-page)',
                borderBottom:
                  i < result.ad_headlines.length - 1
                    ? '1px solid var(--border-subtle)'
                    : undefined,
              }}
            >
              <span className="text-[12px] font-semibold text-[var(--text-muted)] w-5 tabular-nums">
                {i + 1}
              </span>
              <p className="flex-1 text-[var(--text-primary)] leading-snug">
                {headline}
              </p>
              <CopyButton text={headline} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Value propositions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.value_propositions.map((prop, i) => (
            <div
              key={i}
              className="bg-white rounded-[12px] p-4 flex flex-col justify-between gap-3"
              style={{
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {prop}
              </p>
              <CopyButton text={prop} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Resonant phrases">
        <div className="flex flex-col gap-2">
          {result.resonant_phrases.map((phrase, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-2 px-3"
              style={{
                background: 'var(--accent-light)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <span
                className="font-mono-sm text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1"
              >
                ❝ {phrase} ❞
              </span>
              <CopyButton text={phrase} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Search keywords">
        <div className="flex flex-wrap gap-2">
          {result.search_keywords.map((kw) => (
            <KeywordPill key={kw} keyword={kw} />
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-[12px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function KeywordPill({ keyword }: { keyword: string }) {
  const [scaled, setScaled] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(keyword)
        if (ok) toast.message('Copied to clipboard')
        setScaled(true)
        setTimeout(() => setScaled(false), 100)
      }}
      className="text-[13px] cursor-pointer transition-transform"
      style={{
        background: 'var(--bg-page)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        padding: '6px 12px',
        color: 'var(--text-secondary)',
        transform: scaled ? 'scale(0.96)' : 'scale(1)',
      }}
    >
      {keyword}
    </button>
  )
}
