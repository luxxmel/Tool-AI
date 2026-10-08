import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { WorkspaceBackgroundProvider } from "@/context/WorkspaceBackgroundContext";
import { PopupProvider } from "@/context/PopupContext";
import NotificationToast from "@/components/notifications/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

// Font hỗ trợ tiếng Việt đầy đủ
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Biết Tuốt AI — Hỏi Gì Cũng Biết, Làm Gì Cũng Tinh",
  description: "Biết Tuốt AI — Nền tảng trí tuệ nhân tạo, trợ lý đa năng và giải đáp mọi thắc mắc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <WorkspaceBackgroundProvider>
                <PopupProvider>
                  {children}
                  <NotificationToast />
                </PopupProvider>
              </WorkspaceBackgroundProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
