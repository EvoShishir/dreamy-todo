"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LuSquareCheck, LuUser, LuLogOut } from "react-icons/lu";
import { useUser } from "../contexts/UserContext";

const navItems = [
  { name: "Todos", path: "/", icon: LuSquareCheck },
  { name: "Account Information", path: "/profile", icon: LuUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : "Loading...";
  const displayEmail = user?.email || "";

  return (
    <aside className="fixed left-0 top-0 w-72 bg-[#0D224A] text-white h-screen flex flex-col overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 border-b border-[#1A2E4D]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center relative">
            {user?.profile_image ? (
              <Image
                src={user.profile_image}
                alt="User avatar"
                width={96}
                height={96}
                className="object-cover"
              />
            ) : (
              <LuUser size={32} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-center min-w-0">
            <div className="font-medium text-sm truncate">{displayName}</div>
            <div className="text-xs text-gray-400 truncate">{displayEmail}</div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-linear-to-r from-[#5272FF] tp-[#0D224A] text-white"
                  : "text-gray-300 hover:bg-[#1A2E4D]"
              }`}
            >
              <IconComponent size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors w-full p-6 border-t border-[#1A2E4D] cursor-pointer"
      >
        <LuLogOut size={20} />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </aside>
  );
}
