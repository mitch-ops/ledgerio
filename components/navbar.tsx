"use client";

import { useState } from "react";
import {
  Menu,
  Home,
  Users,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { signOutAction } from "@/app/actions";
import { useGroups } from "@/app/GroupsContext";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { groups } = useGroups();

  const handleSignOut = () => {
    setIsOpen(false);
    signOutAction();
  };

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between w-full my-4 mx-4">
        <Link href="/dashboard">
          <div className="flex col items-center space-x-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Ledgerio</span>
          </div>
        </Link>
        <div className="flex items-center">
          <ThemeSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Groups
                  </h3>
                  <ul className="space-y-2 pl-7">
                    {groups.map((group) => (
                      <li key={group.id}>
                        <Link
                          href={`/groups/${group.id}`}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {group.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Help & Support</span>
                </Link>
                <button
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
