import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="border-t py-10"
      style={{ borderColor: 'rgba(148,163,184,.12)', color: '#9fb0cc' }}
    >
      <div className="container flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
        <div className="flex items-center gap-2.5 font-semibold">
          <div
            className="grid size-7 place-items-center rounded-lg text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          >
            T
          </div>
          <span className="text-[#e5eefc]">TechAtlas</span>
        </div>
        <p>© {new Date().getFullYear()} TechAtlas. All rights reserved.</p>
        <nav className="flex gap-5">
          <Link href="/terms" className="transition-colors hover:text-[#e5eefc]">
            利用規約
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[#e5eefc]">
            プライバシーポリシー
          </Link>
        </nav>
      </div>
    </footer>
  )
}
