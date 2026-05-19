import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'room-reader — Know the room before you enter it',
  description: 'A rehearsal room for high-stakes communication with editable audience cards and topic-specific lenses.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
