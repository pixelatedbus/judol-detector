// app/layout.tsx
import React from 'react';
import './globals.css'; // <-- Add this import

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>judol detector!!</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        {/* The <style> tag has been removed */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
