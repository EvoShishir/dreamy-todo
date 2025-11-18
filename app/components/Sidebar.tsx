"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LuSquareCheck, LuUser, LuLogOut } from "react-icons/lu";

const navItems = [
  { name: "Todos", path: "/", icon: LuSquareCheck },
  { name: "Account Information", path: "/profile", icon: LuUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 w-72 bg-[#0A1E3D] text-white h-screen flex flex-col overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 border-b border-[#1A2E4D]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center relative">
            <Image
              src="/default-avatar.png"
              alt="User avatar"
              width={96}
              height={96}
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <LuUser size={32} />
            </div>
          </div>
          <div className="flex-1 text-center min-w-0">
            <div className="font-medium text-sm truncate">amanuel</div>
            <div className="text-xs text-gray-400 truncate">
              amanuel@gmail.com
            </div>
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
                  ? "bg-[#5272FF] text-white"
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
      <div className="p-6 border-t border-[#1A2E4D]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors w-full"
        >
          <LuLogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
