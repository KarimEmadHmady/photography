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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mostafa-metwaly-photography.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'معرض تصوير حفلات الزفاف والسيشن | أماكن تصوير متميزة',
  description:
    'موقع المصور الفوتوغرافي المتخصص في توثيق حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: siteUrl,
    siteName: 'Mostafa Metwaly Photography',
    title: 'معرض تصوير حفلات الزفاف والسيشن | أماكن تصوير متميزة',
    description:
      'موقع المصور الفوتوغرافي المتخصص في توثيق حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        secureUrl: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'معرض تصوير حفلات الزفاف والسيشن | مصطفى متولي',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'معرض تصوير حفلات الزفاف والسيشن | أماكن تصوير متميزة',
    description:
      'موقع المصور الفوتوغرافي المتخصص في توثيق حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
    images: [`${siteUrl}/og-image.jpg`],
  },
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
