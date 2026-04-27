"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  History,
  MessageCircle,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/upload", label: "Upload Test", Icon: Upload },
  { href: "/history", label: "History", Icon: History },
  { href: "/trends", label: "Trends", Icon: TrendingUp },
  { href: "/chat", label: "AI Chat", Icon: MessageCircle },
] as const;

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>BT</div>
        {!isCollapsed ? <span className={styles.logoText}>BloodTrack</span> : null}
      </div>

      <div className={styles.logoFooter}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.toggle}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className={styles.toggleIcon} /> : <ChevronLeft className={styles.toggleIcon} />}
        </Button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={isActive ? "page" : undefined}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <Database className={styles.bottomIcon} />
        <span>Local storage</span>
      </div>
    </aside>
  );
}
