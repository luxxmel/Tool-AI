import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { WorkspaceBackgroundProvider } from "@/context/WorkspaceBackgroundContext";
import { PopupProvider } from "@/context/PopupContext";
import NotificationToast from "@/components/notifications/NotificationToast";
import CreditGiftModal from "@/components/notifications/CreditGiftModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Font hỗ trợ tiếng Việt đầy đủ với mọi cấp độ đậm nhạt
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://biettuot.io.vn"),
  title: {
    default: "Biết Tuốt AI — Hỏi Gì Cũng Biết, Làm Gì Cũng Tín",
    template: "%s | Biết Tuốt AI",
  },
  description: "Biết Tuốt AI (biettuot.io.vn) — Nền tảng Trí tuệ Nhân tạo toàn năng cho người Việt. Trợ lý đa năng, Giải toán 24/7, Học tiếng Anh, Bói Tarot, Luận giải Tử Vi & Bát Tự, Sáng tác nội dung và Vẽ ảnh nghệ thuật AI.",
  keywords: [
    "Biết Tuốt AI",
    "biettuot.io.vn",
    "AI Việt Nam",
    "Trí tuệ nhân tạo",
    "Giải toán AI",
    "Học tiếng Anh AI",
    "Bói Tarot AI",
    "Xem tử vi AI",
    "Chiêm tinh học",
    "Bát tự",
    "Vẽ tranh AI",
    "Viết văn AI",
    "ChatGPT tiếng Việt",
    "Gemini tiếng Việt"
  ],
  authors: [{ name: "Biết Tuốt AI Team", url: "https://biettuot.io.vn" }],
  creator: "Biết Tuốt AI",
  publisher: "Biết Tuốt AI",
  alternates: {
    canonical: "https://biettuot.io.vn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Biết Tuốt AI — Hỏi Gì Cũng Biết, Làm Gì Cũng Tín",
    description: "Nền tảng trí tuệ nhân tạo toàn năng hàng đầu cho người Việt: Trợ lý thông minh, Giải toán, Học ngoại ngữ, Tử Vi, Tarot và Sáng tạo nghệ thuật.",
    url: "https://biettuot.io.vn",
    siteName: "Biết Tuốt AI",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biết Tuốt AI — Trí Tuệ Nhân Tạo Đa Năng",
    description: "Hỏi gì cũng biết, làm gì cũng tín. Trợ lý AI số 1 cho người Việt.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('omni_theme_mode');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Script
          id="clean-extension-attrs"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stripAttrs = function(node) {
                    if (!node || !node.attributes) return;
                    var attrs = Array.from(node.attributes);
                    for (var i = 0; i < attrs.length; i++) {
                      var name = attrs[i].name;
                      if (name && (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0)) {
                        node.removeAttribute(name);
                      }
                    }
                  };
                  var cleanAll = function() {
                    stripAttrs(document.documentElement);
                    stripAttrs(document.body);
                    var all = document.querySelectorAll('*');
                    for (var i = 0; i < all.length; i++) {
                      stripAttrs(all[i]);
                    }
                  };
                  cleanAll();
                  if (typeof window !== 'undefined' && window.MutationObserver) {
                    var obs = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName) {
                          if (m.attributeName.indexOf('bis_') === 0 || m.attributeName.indexOf('__processed_') === 0) {
                            m.target.removeAttribute(m.attributeName);
                          }
                        }
                      }
                    });
                    obs.observe(document.documentElement, { attributes: true, subtree: true });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
              {/* Structured Data (Schema.org JSON-LD) tối ưu cho Googlebot & AI Overview */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://biettuot.io.vn/#website",
                  "url": "https://biettuot.io.vn/",
                  "name": "Biết Tuốt AI",
                  "alternateName": ["BietTuot", "Biet Tuot AI", "biettuot.io.vn"],
                  "description": "Nền tảng trí tuệ nhân tạo toàn năng hàng đầu cho người Việt. Tích hợp hỏi đáp tổng hợp, giải toán, học tiếng Anh, tử vi, tarot, chiêm tinh, sáng tạo nội dung và trợ lý chuyên sâu.",
                  "inLanguage": "vi-VN",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://biettuot.io.vn/?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://biettuot.io.vn/#organization",
                  "name": "Biết Tuốt AI",
                  "url": "https://biettuot.io.vn/",
                  "logo": "https://biettuot.io.vn/icon.png",
                  "sameAs": [
                    "https://facebook.com/biettuot.io.vn"
                  ]
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://biettuot.io.vn/#software",
                  "name": "Biết Tuốt AI",
                  "operatingSystem": "All, Web, Android, iOS, Windows, macOS",
                  "applicationCategory": "ProductivityApplication, EducationalApplication, MultimediaApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "VND"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "1280"
                  }
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://biettuot.io.vn/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Biết Tuốt AI là gì?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Biết Tuốt AI (biettuot.io.vn) là nền tảng trí tuệ nhân tạo toàn năng cho người Việt, cung cấp hàng loạt công cụ thông minh như trợ lý giải toán từng bước, học tiếng Anh phản xạ, xem bói Tarot chuẩn xác, luận giải Tử Vi & Bát Tự trọn đời, viết lách sáng tạo, vẽ ảnh nghệ thuật và quét tài liệu thông minh."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Sử dụng Biết Tuốt AI có miễn phí không?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Có. Người dùng có thể trải nghiệm miễn phí các tính năng cốt lõi của Biết Tuốt AI ngay trên trang web mà không cần cài đặt phần mềm phức tạp."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Biết Tuốt AI có thể giúp giải bài tập và học tập không?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Biết Tuốt AI sở hữu các gia sư AI chuyên sâu về Giải Toán, Lý, Hóa, Tiếng Anh với khả năng phân tích hình ảnh đề bài, đưa ra đáp án kèm giải thích chi tiết từng bước dễ hiểu."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Biết Tuốt AI có xem được Tử Vi và Tarot không?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Có. Biết Tuốt AI trang bị các AI chuyên gia huyền học: Tarot Reader giải nghĩa 78 lá bài, Thầy Tử Vi Master lập và bình giải lá số theo giờ sinh, Chiêm Tinh Học và Bát Tự Tứ Trụ chuẩn xác."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <WorkspaceBackgroundProvider>
                <PopupProvider>
                  {children}
                  <NotificationToast />
                  <CreditGiftModal />
                </PopupProvider>
              </WorkspaceBackgroundProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
