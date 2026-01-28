import React from "react";

export default function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 min-h-screen">
      <div className="max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
