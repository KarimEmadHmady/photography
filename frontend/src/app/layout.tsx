import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'معرض تصوير حفلات الزفاف والسيشن | أماكن تصوير متميزة',
  description: 'موقع المصور الفوتوغرافي المتخصص في توثيق حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased flex flex-col justify-between">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
