1:"$Sreact.fragment"
2:I[1304,[],"ClientPageRoot"]
3:I[5964,["9268","static/chunks/aaea2bcf-ebd78913fc6c7a23.js","8500","static/chunks/8500-f4d7bfbe7500f274.js","6867","static/chunks/6867-74a2289ae42fa4ea.js","1495","static/chunks/1495-f60962b919901355.js","8642","static/chunks/8642-62913d82e9024831.js","6201","static/chunks/6201-5cc06028417b695c.js","8676","static/chunks/8676-492206b7aaa20ac1.js","4584","static/chunks/4584-ca271e2fc9f43a06.js","8974","static/chunks/app/page-63203da6d1d2cd3f.js"],"default"]
6:I[484,[],"OutletBoundary"]
7:"$Sreact.suspense"
b:I[484,[],"ViewportBoundary"]
c:I[484,[],"MetadataBoundary"]
d:I[6869,[],"IconMark"]
f:I[2593,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],""]
:HL["/_next/static/css/ef1b0eaa9e5d2e5d.css","style"]
:HL["/_next/static/css/abc79714628a0c44.css","style"]
a:X
10:T6db,
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
            0:{"buildId":"NnnEEIoVhCmOnlz6BUaf5","data":[{"rsc":["$","$1","c",{"children":[["$","$L2",null,{"Component":"$3","serverProvidedParams":{"searchParams":{},"params":{},"promises":["$@4","$@5"]}}],null,["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]]}],"isPartial":"$@9","staleTime":"$a","varyParams":null},{"rsc":["$","$1","h",{"children":[null,["$","$Lb",null,{"children":[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"}]]}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$7",null,{"name":"Next.Metadata","children":[["$","title","0",{"children":"Biết Tuốt AI — Hỏi Gì Cũng Biết, Làm Gì Cũng Tín"}],["$","meta","1",{"name":"description","content":"Biết Tuốt AI — Nền tảng trí tuệ nhân tạo, trợ lý đa năng và giải đáp mọi thắc mắc"}],["$","meta","2",{"name":"robots","content":"index, follow"}],["$","meta","3",{"name":"googlebot","content":"index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"}],["$","meta","4",{"property":"og:title","content":"Biết Tuốt AI — Trí Tuệ Nhân Tạo Đa Năng"}],["$","meta","5",{"property":"og:description","content":"Hỏi gì cũng biết, làm gì cũng tín. Nền tảng AI toàn năng hàng đầu cho người Việt."}],["$","meta","6",{"property":"og:locale","content":"vi_VN"}],["$","meta","7",{"property":"og:type","content":"website"}],["$","meta","8",{"name":"twitter:card","content":"summary"}],["$","meta","9",{"name":"twitter:title","content":"Biết Tuốt AI — Trí Tuệ Nhân Tạo Đa Năng"}],["$","meta","10",{"name":"twitter:description","content":"Hỏi gì cũng biết, làm gì cũng tín. Nền tảng AI toàn năng hàng đầu cho người Việt."}],["$","link","11",{"rel":"icon","href":"/favicon.ico?603d046c9a6fdfbb","type":"image/x-icon","sizes":"16x16"}],["$","$Ld","12",{}]]}]}]}],null]}],"isPartial":"$@e","staleTime":"$a","varyParams":null},{"rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/ef1b0eaa9e5d2e5d.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/abc79714628a0c44.css","precedence":"next"}]],["$","html",null,{"lang":"vi","className":"__variable_4994ab __variable_258e5a __variable_d4ddd7 dark h-full antialiased","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","script",null,{"dangerouslySetInnerHTML":{"__html":"\n              (function() {\n                try {\n                  var saved = localStorage.getItem('omni_theme_mode');\n                  if (saved === 'light') {\n                    document.documentElement.classList.remove('dark');\n                  } else {\n                    document.documentElement.classList.add('dark');\n                  }\n                } catch(e) {\n                  document.documentElement.classList.add('dark');\n                }\n              })();\n            "}}],["$","$Lf",null,{"id":"clean-extension-attrs","strategy":"beforeInteractive","dangerouslySetInnerHTML":{"__html":"$10"}}]]}],"$L11"]}]]}],"isPartial":"$@12","staleTime":"$a","varyParams":null}],"isUpgradeableISRFallback":false,"a":"$@13","rootVaryParams":null,"needsRuntimeRequest":"$@14"}
15:I[2398,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"LanguageProvider"]
16:I[4211,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"ThemeProvider"]
17:I[9782,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"AuthProvider"]
18:I[8676,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"WorkspaceBackgroundProvider"]
19:I[5456,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"PopupProvider"]
1a:I[7121,[],""]
1b:I[7267,["8039","static/chunks/app/error-e9c5387f196f6e2e.js"],"default"]
1c:I[4581,[],""]
1d:I[8489,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"default"]
1e:I[2127,["1495","static/chunks/1495-f60962b919901355.js","8676","static/chunks/8676-492206b7aaa20ac1.js","7177","static/chunks/app/layout-6b592564462bd91c.js"],"default"]
4:{}
5:"$0:data:0:rsc:props:children:0:props:serverProvidedParams:params"
8:null
11:["$","body",null,{"className":"min-h-full flex flex-col","suppressHydrationWarning":true,"children":["$","$L15",null,{"children":["$","$L16",null,{"children":["$","$L17",null,{"children":["$","$L18",null,{"children":["$","$L19",null,{"children":[["$","$L1a",null,{"parallelRouterKey":"children","error":"$1b","errorStyles":[],"errorScripts":null,"template":["$","$L1c",null,{}],"notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]]}],["$","$L1d",null,{}],["$","$L1e",null,{}]]}]}]}]}]}]}]
a:300
14:true
a:C
13:0
e:"$undefined"
9:"$undefined"
12:"$undefined"
