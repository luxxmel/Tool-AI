"use strict";(()=>{var a={};a.id=5738,a.ids=[5738],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8128:a=>{a.exports=require("next/dist/server/runtime-reacts.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},16448:(a,b,c)=>{c.r(b),c.d(b,{GET:()=>f,POST:()=>g});var d=c(23211),e=c(76607);async function f(a){try{let a=`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng nhập bằng t\xe0i khoản Google - Biết Tuốt AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #090a0f;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .card {
      background: #12141e;
      border: 1px solid #1f2333;
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      text-align: center;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #181b29;
      margin-bottom: 16px;
      border: 1px solid #282d42;
    }
    h2 { font-size: 19px; font-weight: 700; margin-bottom: 6px; }
    p.sub { font-size: 13px; color: #94a3b8; margin-bottom: 22px; }
    .account-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      background: #181b28;
      border: 1px solid #292e44;
      border-radius: 14px;
      padding: 12px 14px;
      cursor: pointer;
      margin-bottom: 12px;
      transition: all 0.2s;
      text-align: left;
    }
    .account-btn:hover {
      background: #202436;
      border-color: #4f46e5;
      transform: translateY(-1px);
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
    }
    .account-name { font-size: 13px; font-weight: 600; color: #fff; }
    .account-email { font-size: 11px; color: #94a3b8; }
    .divider {
      display: flex;
      align-items: center;
      margin: 18px 0;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #1e2235;
    }
    .divider span { padding: 0 10px; }
    .input-group {
      display: flex;
      gap: 8px;
    }
    input[type="email"] {
      flex: 1;
      background: #0d0f17;
      border: 1px solid #252a3d;
      border-radius: 12px;
      padding: 10px 14px;
      color: #fff;
      font-size: 13px;
      outline: none;
    }
    input[type="email"]:focus {
      border-color: #4f46e5;
    }
    .btn-submit {
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 10px 16px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover { background: #4338ca; }
    .badge-admin {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
      margin-left: auto;
    }
    .spinner {
      display: none;
      width: 24px;
      height: 24px;
      border: 3px solid #4f46e5;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 12px auto 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    </div>
    <h2>Đăng nhập bằng Google</h2>
    <p class="sub">Chọn t\xe0i khoản Google của bạn để v\xe0o Biết Tuốt AI</p>

    <!-- T\xe0i khoản Admin Lịnh Ho\xe0ng mặc định -->
    <button class="account-btn" onclick="loginWith('hoanglinhcntti@gmail.com', 'Lịnh Ho\xe0ng', 'https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c')">
      <img class="avatar" src="https://lh3.googleusercontent.com/a/ACg8ocKwhgR9M80V5bzwAD5z_9NZ4wxJsUIdJ6X1kPKCNWOwRgv67iY=s96-c" alt="Admin">
      <div>
        <div class="account-name">Lịnh Ho\xe0ng</div>
        <div class="account-email">hoanglinhcntti@gmail.com</div>
      </div>
      <span class="badge-admin">ADMIN</span>
    </button>

    <div class="divider">
      <span>Hoặc nhập t\xe0i khoản Gmail của bạn</span>
    </div>

    <form onsubmit="handleManualSubmit(event)" class="input-group">
      <input id="gmailInput" type="email" placeholder="example@gmail.com" required>
      <button type="submit" class="btn-submit">Tiếp tục</button>
    </form>

    <div id="spinner" class="spinner"></div>
    <div id="statusMsg" style="font-size:12px;color:#94a3b8;margin-top:10px;"></div>
  </div>

  <script>
    async function loginWith(email, name, avatar) {
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('statusMsg').innerText = 'Đang x\xe1c thực v\xe0 đồng bộ v\xe0o hệ thống...';

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, avatar })
        });
        const data = await res.json();

        if (data.success && data.user) {
          const user = data.user;
          localStorage.setItem('tool_ai_auth_user', JSON.stringify(user));
          document.cookie = 'tool_ai_auth_user=' + encodeURIComponent(JSON.stringify(user)) + '; path=/; max-age=31536000; SameSite=Lax';

          // Gửi th\xf4ng b\xe1o đến trang cha
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', user: user }, '*');
          }
          if (window.BroadcastChannel) {
            const bc = new BroadcastChannel('oauth_channel');
            bc.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', user: user });
          }

          document.getElementById('statusMsg').innerText = 'Đăng nhập th\xe0nh c\xf4ng! Đang chuyển hướng...';
          setTimeout(function() {
            try { window.close(); } catch(e) {}
            window.location.replace('/');
          }, 400);
        } else {
          document.getElementById('statusMsg').innerText = 'Lỗi: ' + (data.error || 'Kh\xf4ng thể đăng nhập');
          document.getElementById('spinner').style.display = 'none';
        }
      } catch (err) {
        document.getElementById('statusMsg').innerText = 'Lỗi kết nối m\xe1y chủ';
        document.getElementById('spinner').style.display = 'none';
      }
    }

    function handleManualSubmit(e) {
      e.preventDefault();
      const val = document.getElementById('gmailInput').value.trim();
      if (!val) return;
      const cleanEmail = val.includes('@') ? val.toLowerCase() : val.toLowerCase() + '@gmail.com';
      loginWith(cleanEmail, cleanEmail.split('@')[0], 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(cleanEmail));
    }
  </script>
</body>
</html>`;return new d.NextResponse(a,{headers:{"Content-Type":"text/html; charset=utf-8"}})}catch(a){return console.error("Lỗi GET /api/auth/google:",a),d.NextResponse.json({error:"Lỗi kết nối m\xe1y chủ Google OAuth"},{status:500})}}async function g(a){try{let{email:b,name:c,avatar:f}=await a.json();if(!b)return d.NextResponse.json({error:"Thiếu th\xf4ng tin email để đăng k\xfd/đăng nhập"},{status:400});let g=b.toLowerCase().trim(),h="hoanglinhcntti@gmail.com"===g||g.includes("hoanglinh")||c&&c.toLowerCase().includes("lịnh ho\xe0ng"),i=await e.z.user.upsert({where:{email:g},update:{name:c||void 0,avatar:f||void 0,...h?{role:"ADMIN",credits:999999}:{}},create:{email:g,name:c||g.split("@")[0],avatar:f||`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(g)}`,credits:h?999999:20,role:h?"ADMIN":"USER"},select:{id:!0,email:!0,name:!0,avatar:!0,credits:!0,role:!0,createdAt:!0}});return d.NextResponse.json({success:!0,message:"Đăng nhập với Google th\xe0nh c\xf4ng!",user:{id:i.id,email:i.email,username:i.email.split("@")[0],displayName:i.name||i.email.split("@")[0],avatar:i.avatar,credits:"ADMIN"===i.role?999999:i.credits,role:i.role}})}catch(a){return console.error("Lỗi trong API /api/auth/google:",a),d.NextResponse.json({error:"Đ\xe3 xảy ra lỗi hệ thống khi xử l\xfd đăng nhập Google: "+(a?.message||"")},{status:500})}}},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{a.exports=require("path")},42947:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var d=c(19225),e=c(84006),f=c(8317),g=c(99373),h=c(34775),i=c(24235),j=c(261),k=c(54365),l=c(90771),m=c(73461),n=c(67798),o=c(92280),p=c(62018),q=c(45696),r=c(47929),s=c(86439),t=c(37527);let u=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/auth/google/route",pathname:"/api/auth/google",filename:"route",bundlePath:"app/api/auth/google/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Tool-AI\\src\\app\\api\\auth\\google\\route.ts",nextConfigOutput:"",userland:()=>c(16448),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:x}=u;function y(){return(0,f.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}async function z(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),u.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/auth/google/route";"/index"===d&&(d="/");let f=await u.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:x,nextConfig:y,parsedUrl:z,isDraftMode:A,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=f,I=(0,j.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,z,!1):b.end("This page could not be found"),null);if(J&&!A){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(y.adapterPath)return await K();throw new s.NoFallbackError}}let L=null;!J||u.isDev||A||(L="/index"===(L=F)?"/":L);let M=!0===u.isDev||!J,N=J&&!M;H&&G&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,h.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==C?void 0:C.isWrappedByNextServer),S=!!(0,g.getRequestMeta)(a,"minimalMode"),T=(0,g.getRequestMeta)(a,"incrementalCache")||await u.getIncrementalCache(a,y,B,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:x,previewProps:B.preview,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts,useCacheTimeout:y.experimental.useCacheTimeout},cacheComponents:!!y.cacheComponents,validationLevel:y.experimental.instantInsights.validationLevel,supportsDynamicResponse:M,incrementalCache:T,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:y.cacheLife,staticPageGenerationTimeout:y.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>u.onRequestError(a,b,d,e,C)},sharedContext:{buildId:v,deploymentId:w}},V=new k.NodeNextRequest(a),W=new k.NodeNextResponse(b),X=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(b)),Y=async({previousCacheEntry:e})=>{try{if(!S&&D&&E&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await u.handle(X,U);a.fetchMetrics=U.renderOpts.fetchMetrics;let f=U.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=U.renderOpts.collectedTags;if(!J)return await (0,o.I)(V,W,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?y.expireTime:void 0:U.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await u.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),b}},Z=async(d,f)=>{try{var g,i;let d=await u.handleResponse({req:a,nextConfig:y,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:Y,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",D?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);S&&J||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(V,W,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await u.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),J)throw b;await (0,o.I)(V,W,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||I,g=`${O} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(R&&Q)await Z(Q,void 0);else{let b=P.getActiveScopeSpan();await P.withPropagatedContext(a.headers,()=>P.trace(m.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},a=>Z(a,b)),void 0,!R)}}},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79868:a=>{a.exports=require("node:sqlite")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[3445,1813,4595],()=>b(b.s=42947));module.exports=c})();