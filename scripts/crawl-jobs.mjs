#!/usr/bin/env node
import { mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../public/feeds/crawled-jobs.json')

function stripHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function toDate(v) {
  if (!v) return new Date().toISOString().slice(0, 10)
  if (typeof v === 'number') {
    return new Date(v * (v < 1e12 ? 1000 : 1)).toISOString().slice(0, 10)
  }
  const s = String(v)
  if (/^\d+$/.test(s)) return toDate(Number(s))
  return s.slice(0, 10)
}

async function fetchRemotive() {
  const res = await fetch('https://remotive.com/api/remote-jobs?limit=100')
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`)
  const data = await res.json()
  return (data.jobs || []).map((j) => ({
    sourceId: 'remotive',
    sourceName: 'Remotive',
    externalId: String(j.id),
    title: j.title,
    company: j.company_name,
    city:
      !j.candidate_required_location ||
      /worldwide|anywhere|remote/i.test(j.candidate_required_location)
        ? '远程'
        : (j.candidate_required_location.split(/[,/|]/)[0] || '远程').trim(),
    type: j.job_type || '全职',
    salary: j.salary || '面议',
    tags: (j.tags || []).slice(0, 8),
    postedAt: toDate(j.publication_date),
    description: stripHtml(j.description || '').slice(0, 240),
    requirementText: [
      stripHtml(j.description || '').slice(0, 1200),
      j.category ? `Category: ${j.category}` : '',
      (j.tags || []).length ? `Tags: ${j.tags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    applyUrl: j.url,
  }))
}

async function fetchArbeitnow() {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api')
  if (!res.ok) throw new Error(`Arbeitnow HTTP ${res.status}`)
  const data = await res.json()
  return (data.data || []).slice(0, 100).map((j, i) => ({
    sourceId: 'arbeitnow',
    sourceName: 'Arbeitnow',
    externalId: String(j.slug || j.url || i),
    title: j.title,
    company: j.company_name,
    city: j.remote
      ? '远程'
      : String(j.location || '欧洲').split(',')[0].trim(),
    type: (j.job_types && j.job_types[0]) || '全职',
    salary: '面议',
    tags: (j.tags || []).slice(0, 8),
    postedAt: toDate(j.created_at),
    description: stripHtml(j.description || '').slice(0, 240),
    requirementText: [
      stripHtml(j.description || '').slice(0, 1200),
      (j.tags || []).length ? `Tags: ${j.tags.join(', ')}` : '',
      j.remote ? 'Remote friendly' : '',
    ]
      .filter(Boolean)
      .join('\n'),
    applyUrl: j.url,
  }))
}

async function fetchHimalayas() {
  const res = await fetch(
    'https://himalayas.app/jobs/api?limit=80&offset=0',
  )
  if (!res.ok) throw new Error(`Himalayas HTTP ${res.status}`)
  const data = await res.json()
  const list = data.jobs || data.data || []
  return list.slice(0, 80).map((j, i) => {
    const desc = stripHtml(j.description || j.excerpt || '')
    return {
      sourceId: 'himalayas',
      sourceName: 'Himalayas',
      externalId: String(j.id || j.slug || i),
      title: j.title || 'Untitled',
      company: j.companyName || j.company || 'Unknown',
      city: j.location || (j.countries && j.countries[0]) || '远程',
      type: j.employmentType || '全职',
      salary: j.salary || '面议',
      tags: (j.categories || j.skills || []).slice(0, 8).map(String),
      postedAt: toDate(j.pubDate || j.publishedAt || j.created_at),
      description: desc.slice(0, 240),
      requirementText: [
        desc.slice(0, 1200),
        (j.categories || []).length
          ? `Categories: ${j.categories.join(', ')}`
          : '',
        'Remote-friendly public feed',
      ]
        .filter(Boolean)
        .join('\n'),
      applyUrl: j.applicationLink || j.url || j.guid,
    }
  })
}

const [remotive, arbeitnow, himalayas] = await Promise.all([
  fetchRemotive(),
  fetchArbeitnow(),
  fetchHimalayas().catch((err) => {
    console.error('Himalayas skip:', err.message)
    return []
  }),
])
const jobs = [...remotive, ...arbeitnow, ...himalayas]
const payload = {
  crawledAt: new Date().toISOString(),
  sources: {
    remotive: remotive.length,
    arbeitnow: arbeitnow.length,
    himalayas: himalayas.length,
  },
  jobs,
}

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(payload))
const info = await stat(OUT)
console.log(
  JSON.stringify(
    {
      file: OUT,
      total: jobs.length,
      remotive: remotive.length,
      arbeitnow: arbeitnow.length,
      bytes: info.size,
      samples: jobs
        .slice(0, 5)
        .map((j) => `${j.sourceName}: ${j.company} · ${j.title}`),
    },
    null,
    2,
  ),
)
