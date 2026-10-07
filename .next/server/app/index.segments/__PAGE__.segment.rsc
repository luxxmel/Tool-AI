1:"$Sreact.fragment"
2:I[1304,[],"ClientPageRoot"]
3:I[3556,["9268","static/chunks/aaea2bcf-ced0baf6afc35212.js","8489","static/chunks/8187f03c-3d0af74c63219ccc.js","1285","static/chunks/de934490-5ff273284e8a3544.js","4283","static/chunks/55281adb-236e11caa5158f1c.js","8500","static/chunks/8500-f4d7bfbe7500f274.js","6867","static/chunks/6867-678fe36463dfc80f.js","8110","static/chunks/8110-4596625e35a5422f.js","8262","static/chunks/8262-ff2236b703645fc3.js","1495","static/chunks/1495-ff9856af93d81655.js","8642","static/chunks/8642-eaf76cf54b225301.js","6201","static/chunks/6201-90f50490581f0cf3.js","8676","static/chunks/8676-e326a03327dd8d87.js","1667","static/chunks/1667-978b9b0f9b9acf43.js","8974","static/chunks/app/page-801685a536edf4af.js"],"default"]
6:I[484,[],"OutletBoundary"]
7:"$Sreact.suspense"
b:I[484,[],"ViewportBoundary"]
c:I[484,[],"MetadataBoundary"]
d:I[6869,[],"IconMark"]
f:I[2593,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],""]
11:I[2398,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],"LanguageProvider"]
12:I[4211,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],"ThemeProvider"]
13:I[9782,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],"AuthProvider"]
14:I[8676,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],"WorkspaceBackgroundProvider"]
15:I[5456,["1495","static/chunks/1495-ff9856af93d81655.js","8676","static/chunks/8676-e326a03327dd8d87.js","7177","static/chunks/app/layout-3ed0f5bc2f143bf1.js"],"PopupProvider"]
16:I[7121,[],""]
17:I[7267,["8039","static/chunks/app/error-482bf3e129ee62e7.js"],"default"]
18:I[4581,[],""]
:HL["/_next/static/css/c99bf9fa50e8822a.css","style"]
:HL["/_next/static/css/640d139b88fda4b8.css","style"]
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
            0:{"buildId":"KPpVpO3IdN666hE3icu7B","data":[{"rsc":["$","$1","c",{"children":[["$","$L2",null,{"Component":"$3","serverProvidedParams":{"searchParams":{},"params":{},"promises":["$@4","$@5"]}}],null,["$","$L6",null,{"children":["$","$7",null,{"name":"Next.MetadataOutlet","children":"$@8"}]}]]}],"isPartial":"$@9","staleTime":"$a","varyParams":null},{"rsc":["$","$1","h",{"children":[null,["$","$Lb",null,{"children":[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]}],["$","div",null,{"hidden":true,"children":["$","$Lc",null,{"children":["$","$7",null,{"name":"Next.Metadata","children":[["$","title","0",{"children":"Biết Tuốt AI — Hỏi Gì Cũng Biết, Làm Gì Cũng Tinh"}],["$","meta","1",{"name":"description","content":"Biết Tuốt AI — Nền tảng trí tuệ nhân tạo, trợ lý đa năng và giải đáp mọi thắc mắc"}],["$","link","2",{"rel":"icon","href":"/favicon.ico?603d046c9a6fdfbb","type":"image/x-icon","sizes":"16x16"}],["$","$Ld","3",{}]]}]}]}],null]}],"isPartial":"$@e","staleTime":"$a","varyParams":null},{"rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/c99bf9fa50e8822a.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/css/640d139b88fda4b8.css","precedence":"next"}]],["$","html",null,{"lang":"vi","className":"__variable_4994ab __variable_258e5a __variable_6d0faf h-full antialiased","suppressHydrationWarning":true,"children":[["$","head",null,{"children":["$","$Lf",null,{"id":"clean-extension-attrs","strategy":"beforeInteractive","dangerouslySetInnerHTML":{"__html":"$10"}}]}],["$","body",null,{"className":"min-h-full flex flex-col","suppressHydrationWarning":true,"children":["$","$L11",null,{"children":["$","$L12",null,{"children":["$","$L13",null,{"children":["$","$L14",null,{"children":["$","$L15",null,{"children":["$","$L16",null,{"parallelRouterKey":"children","error":"$17","errorStyles":[],"errorScripts":null,"template":["$","$L18",null,{}],"notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":"$L19"}]],[]]}]}]}]}]}]}]}]]}]]}],"isPartial":"$@1a","staleTime":"$a","varyParams":null}],"isUpgradeableISRFallback":false,"a":"$@1b","rootVaryParams":null,"needsRuntimeRequest":"$@1c"}
4:{}
5:"$0:data:0:rsc:props:children:0:props:serverProvidedParams:params"
8:null
19:["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]
a:300
1c:true
a:C
1b:0
e:"$undefined"
1a:"$undefined"
9:"$undefined"
