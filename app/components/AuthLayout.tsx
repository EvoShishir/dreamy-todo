import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section */}
      <aside className="w-2/5 bg-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={540}
            height={360}
            className="object-contain mx-auto"
          />
        </div>
      </aside>

      {/* Right Section */}
      <main className="w-3/5 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-2">{title}</h1>
          <p className="text-gray-500 text-center mb-6">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
