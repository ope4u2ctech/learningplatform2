import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LayoutDashboard, BookOpen, ScanLine, Mic, FileText, Sparkles, ChartNoAxesCombined, Trophy, Settings, CircleHelp, Bell, Search, ChevronDown, Sun, Moon, Menu, X, ArrowUpRight, LogOut, ShieldCheck } from 'lucide-react'
import { Brand } from './brand'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'
import { useAuth } from '@/lib/auth-context'

const learningNavigation = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', key: 'dashboard' },
  { label: 'Question bank', icon: BookOpen, path: '/learn/mcqs', key: 'mcqs' },
  { label: 'Spotters', icon: ScanLine, path: '/learn/spotters', key: 'spotters' },
  { label: 'Viva practice', icon: Mic, path: '/learn/viva', key: 'viva' },
  { label: 'Study notes', icon: FileText, path: '/learn/notes', key: 'notes' },
  { label: 'AI tutor', icon: Sparkles, path: '/learn/ai-tutor', key: 'ai-tutor' },
]

export function AppShell({ children, active = 'dashboard', title = 'Dashboard' }: { children: ReactNode; active?: string; title?: string }) {
  const { user, profile, ready, dark, toggleTheme, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [logoutError, setLogoutError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const sidebar = useRef<HTMLElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => { setIsMobile(media.matches); if (!media.matches) setMobileOpen(false) }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!isMobile || !mobileOpen) return
    const focusable = sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = focusable?.[0]
    const last = focusable?.[focusable.length - 1]
    first?.focus()
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = originalOverflow; menuButton.current?.focus() }
  }, [mobileOpen, isMobile])
  const name = profile?.fullName ?? user?.name ?? 'Future doctor'
  const initials = name.split(' ').map(part => part[0]).slice(0, 2).join('')
  return <div className="workspace">
    <a href="#main-content" className="skip-link">Skip to content</a>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside id="workspace-navigation" ref={sidebar} inert={isMobile && !mobileOpen} aria-hidden={isMobile && !mobileOpen ? true : undefined} className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
      <div className="workspace-label"><span className="status-dot" />Your learning workspace</div>
      <nav aria-label="Main navigation" className="main-navigation"><p className="nav-section-label">LEARN</p>{learningNavigation.map(item => <a href={item.key === 'dashboard' && user ? '/dashboard' : item.path} key={item.key} aria-current={active === item.key ? 'page' : undefined} className={`nav-item ${active === item.key ? 'nav-active' : ''}`}><item.icon size={19} strokeWidth={1.65} /><span>{item.label}</span>{item.key === 'ai-tutor' && <span className="nav-ai-badge">AI</span>}</a>)}<p className="nav-section-label progress-nav-label">YOUR GROWTH</p><a href="/progress" className={`nav-item ${active === 'progress' ? 'nav-active' : ''}`}><ChartNoAxesCombined size={19} strokeWidth={1.65} /><span>My progress</span></a><a href="/achievements" className={`nav-item ${active === 'achievements' ? 'nav-active' : ''}`}><Trophy size={19} strokeWidth={1.65} /><span>Achievements</span></a>{profile?.role === 'administrator' && <a href="/admin" className={`nav-item ${active === 'admin' ? 'nav-active' : ''}`}><ShieldCheck size={19} /><span>Administration</span></a>}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tutor"><span className="tutor-mini-icon"><Sparkles size={19} /></span><strong>A little help goes a long way.</strong><p>Your anatomy questions,<br />answered with care.</p><a href="/learn/ai-tutor">Meet your AI tutor <ArrowUpRight size={15} /></a></div><a href="/settings" className={`nav-item ${active === 'settings' ? 'nav-active' : ''}`}><Settings size={19} strokeWidth={1.65} /><span>Settings</span></a><button className="nav-item" onClick={() => setHelpOpen(true)}><CircleHelp size={19} strokeWidth={1.65} /><span>Help & resources</span></button><div className="sidebar-footer">Built for the doctors of tomorrow.</div></div>
    </aside>
    <div className="workspace-body" inert={isMobile && mobileOpen}><header className="topbar"><div className="topbar-title"><button ref={menuButton} className="mobile-menu" aria-controls="workspace-navigation" aria-expanded={mobileOpen} aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><span>{title}</span></div><div className="topbar-actions"><form className="global-search" action="/learn/mcqs" role="search"><Search size={17} /><input name="q" aria-label="Search anatomy topics" placeholder="Search a topic…" value={search} onChange={event => setSearch(event.target.value)} /><span>↵</span></form><button className="icon-button theme-button" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><button className="icon-button notification-button" onClick={() => setNotificationsOpen(true)} aria-label="View notifications"><Bell size={19} />{profile && !profile.onboardingComplete && <span className="notification-dot" />}</button><div className="topbar-divider" />{ready && user ? <div className="profile-menu-wrap"><button className="profile-toggle" aria-expanded={menuOpen} aria-controls="account-menu" onClick={() => setMenuOpen(!menuOpen)}><span className="avatar">{profile?.avatarKey ? <img src={`/api/avatar?v=${encodeURIComponent(profile.avatarKey)}`} alt="" /> : initials}</span><span className="profile-toggle-name"><strong>{name.split(' ')[0]}</strong><span>{profile?.level ?? 'Student'} · {profile?.course ?? 'Anatomy'}</span></span><ChevronDown size={14} /></button>{menuOpen && <><button className="menu-dismiss" aria-label="Close account menu" onClick={() => setMenuOpen(false)} /><div id="account-menu" className="account-menu"><a href="/profile">Your profile</a><a href="/settings">Account settings</a><button onClick={() => void signOut().catch(() => setLogoutError('Could not sign out. Please try again.'))}><LogOut size={15} />Sign out</button>{logoutError && <p role="alert">{logoutError}</p>}</div></>}</div> : <Button asChild size="sm"><a href="/login">Sign in <ArrowUpRight size={14} /></a></Button>}</div></header><main id="main-content" className="main-content">{children}</main><footer className="workspace-footer"><span>Made for curious minds. Built for better understanding.</span><span>Abdulsobbur Anatomy <span className="footer-dot">•</span> Learn with purpose</span></footer></div>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent><DialogTitle className="dialog-heading">Your learning companion</DialogTitle><DialogDescription className="dialog-subtitle">A simple guide to getting more from your workspace.</DialogDescription><div className="resource-list"><p><strong>Practice a little, every day.</strong> Start with MCQs, review the explanations, and revisit your weaker topics.</p><p><strong>Prepare for practicals.</strong> Use spotters to identify structures, and viva practice to build confidence explaining them.</p><p><strong>Ask when you get stuck.</strong> Your AI tutor explains concepts and connects them to what you already know.</p><p className="medical-disclaimer">This platform supports learning, not diagnosis or treatment. Check AI explanations against your university’s approved textbooks.</p></div><Button asChild className="w-full"><a href="/learn/notes">Explore study notes <ArrowUpRight /></a></Button></DialogContent></Dialog>
    <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}><DialogContent><DialogTitle className="dialog-heading">You’re all caught up</DialogTitle><DialogDescription className="dialog-subtitle">Your learning updates appear here.</DialogDescription><div className="notification-empty"><Bell size={35} /><p>{user ? 'A few focused minutes today can make a real difference. Your next study session is ready when you are.' : 'Create your account to track milestones and get personalized study recommendations.'}</p></div><Button asChild className="w-full"><a href={user ? '/learn/mcqs' : '/signup'}>{user ? 'Start a study session' : 'Create your account'}</a></Button></DialogContent></Dialog>
  </div>
}
