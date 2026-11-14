1:"$Sreact.fragment"
2:I[2593,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],""]
:HL["/_next/static/css/ef1b0eaa9e5d2e5d.css","style"]
:HL["/_next/static/css/db2ed32dd4c6e276.css","style"]
3:T6db,
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
            4:Tb72,{"@context":"https://schema.org","@graph":[{"@type":"WebSite","@id":"https://biettuot.io.vn/#website","url":"https://biettuot.io.vn/","name":"Biết Tuốt AI","alternateName":["BietTuot","Biet Tuot AI","biettuot.io.vn"],"description":"Nền tảng trí tuệ nhân tạo toàn năng hàng đầu cho người Việt. Tích hợp hỏi đáp tổng hợp, giải toán, học tiếng Anh, tử vi, tarot, chiêm tinh, sáng tạo nội dung và trợ lý chuyên sâu.","inLanguage":"vi-VN","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://biettuot.io.vn/?q={search_term_string}"},"query-input":"required name=search_term_string"}},{"@type":"Organization","@id":"https://biettuot.io.vn/#organization","name":"Biết Tuốt AI","url":"https://biettuot.io.vn/","logo":"https://biettuot.io.vn/icon.png","sameAs":["https://facebook.com/biettuot.io.vn"]},{"@type":"SoftwareApplication","@id":"https://biettuot.io.vn/#software","name":"Biết Tuốt AI","operatingSystem":"All, Web, Android, iOS, Windows, macOS","applicationCategory":"ProductivityApplication, EducationalApplication, MultimediaApplication","offers":{"@type":"Offer","price":"0","priceCurrency":"VND"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"1280"}},{"@type":"FAQPage","@id":"https://biettuot.io.vn/#faq","mainEntity":[{"@type":"Question","name":"Biết Tuốt AI là gì?","acceptedAnswer":{"@type":"Answer","text":"Biết Tuốt AI (biettuot.io.vn) là nền tảng trí tuệ nhân tạo toàn năng cho người Việt, cung cấp hàng loạt công cụ thông minh như trợ lý giải toán từng bước, học tiếng Anh phản xạ, xem bói Tarot chuẩn xác, luận giải Tử Vi & Bát Tự trọn đời, viết lách sáng tạo, vẽ ảnh nghệ thuật và quét tài liệu thông minh."}},{"@type":"Question","name":"Sử dụng Biết Tuốt AI có miễn phí không?","acceptedAnswer":{"@type":"Answer","text":"Có. Người dùng có thể trải nghiệm miễn phí các tính năng cốt lõi của Biết Tuốt AI ngay trên trang web mà không cần cài đặt phần mềm phức tạp."}},{"@type":"Question","name":"Biết Tuốt AI có thể giúp giải bài tập và học tập không?","acceptedAnswer":{"@type":"Answer","text":"Biết Tuốt AI sở hữu các gia sư AI chuyên sâu về Giải Toán, Lý, Hóa, Tiếng Anh với khả năng phân tích hình ảnh đề bài, đưa ra đáp án kèm giải thích chi tiết từng bước dễ hiểu."}},{"@type":"Question","name":"Biết Tuốt AI có xem được Tử Vi và Tarot không?","acceptedAnswer":{"@type":"Answer","text":"Có. Biết Tuốt AI trang bị các AI chuyên gia huyền học: Tarot Reader giải nghĩa 78 lá bài, Thầy Tử Vi Master lập và bình giải lá số theo giờ sinh, Chiêm Tinh Học và Bát Tự Tứ Trụ chuẩn xác."}}]}]}7:X
0:{"buildId":"N3xu8rtyS7SA-kVglxmeN","data":[{"rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/ef1b0eaa9e5d2e5d.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/db2ed32dd4c6e276.css","precedence":"next"}]],["$","html",null,{"lang":"vi","className":"__variable_4994ab __variable_258e5a __variable_d4ddd7 dark h-full antialiased","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","script",null,{"dangerouslySetInnerHTML":{"__html":"\n              (function() {\n                try {\n                  var saved = localStorage.getItem('omni_theme_mode');\n                  if (saved === 'light') {\n                    document.documentElement.classList.remove('dark');\n                  } else {\n                    document.documentElement.classList.add('dark');\n                  }\n                } catch(e) {\n                  document.documentElement.classList.add('dark');\n                }\n              })();\n            "}}],["$","$L2",null,{"id":"clean-extension-attrs","strategy":"beforeInteractive","dangerouslySetInnerHTML":{"__html":"$3"}}],["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"$4"}}]]}],"$L5"]}]]}],"isPartial":"$@6","staleTime":"$7","varyParams":null}],"isUpgradeableISRFallback":false,"a":"$@8","rootVaryParams":null,"needsRuntimeRequest":"$@9"}
a:I[2398,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"LanguageProvider"]
b:I[4211,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"ThemeProvider"]
c:I[9782,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"AuthProvider"]
d:I[8676,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"WorkspaceBackgroundProvider"]
e:I[5456,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"PopupProvider"]
f:I[7121,[],""]
10:I[7267,["8039","static/chunks/app/error-e9c5387f196f6e2e.js"],"default"]
11:I[4581,[],""]
12:I[8489,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"default"]
13:I[2127,["1495","static/chunks/1495-a2dfb90c78055931.js","412","static/chunks/412-ad60d7e303f54c2c.js","7177","static/chunks/app/layout-8bf120c52f5b5813.js"],"default"]
5:["$","body",null,{"className":"min-h-full flex flex-col","suppressHydrationWarning":true,"children":["$","$La",null,{"children":["$","$Lb",null,{"children":["$","$Lc",null,{"children":["$","$Ld",null,{"children":["$","$Le",null,{"children":[["$","$Lf",null,{"parallelRouterKey":"children","error":"$10","errorStyles":[],"errorScripts":null,"template":["$","$L11",null,{}],"notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]]}],["$","$L12",null,{}],["$","$L13",null,{}]]}]}]}]}]}]}]
7:300
9:true
7:C
8:0
6:"$undefined"
