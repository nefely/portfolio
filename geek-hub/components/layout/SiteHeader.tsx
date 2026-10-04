import Link from "next/link";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { HeaderSearch } from "./HeaderSearch";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";

// Серверний компонент: статична оболонка рендериться один раз, а
// інтерактивні острівці (навігація, пошук, меню юзера) — окремі клієнтські
// компоненти, тож зміна сесії чи маршруту не перерендерює весь хедер.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <MobileNav />
        <Link href="/" className="shrink-0" aria-label="GeekHub home">
          <Logo />
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
