import { Dna } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <a href="/" aria-label="Abdulsobbur Anatomy home" className="brand"><span className="brand-mark"><Dna size={25} strokeWidth={1.7} /></span><span><span className="brand-name">Anatomy<span className="brand-period">.</span></span>{!compact && <span className="brand-caption">BY ABDULSOBBUR</span>}</span></a>
}
