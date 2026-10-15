import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import { ShareProvider } from '../components/ShareModal';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

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
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased flex flex-col justify-between`}>
        <AuthProvider>
          <ShareProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </ShareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
