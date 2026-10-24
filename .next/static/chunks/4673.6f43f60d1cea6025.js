"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4673],{2647:(e,t,a)=>{function n(e){let{title:t,subjectName:a,category:n,dateInfo:r,content:i}=e,s="═".repeat(60),l="─".repeat(60),o=new Blob([`
${s}
            BIẾT TUỐT AI — LUẬN GIẢI CHUY\xcaN S\xc2U
${s}
Chuy\xean mục: ${n}
Đương số:   ${a}
Thời điểm:  ${r||new Date().toLocaleString("vi-VN")}
Ti\xeau đề:    ${t}
${l}

`+i.replace(/\r?\n/g,"\r\n")+`\r
\r
${l}\r
Bi\xean soạn tự động bởi Trợ l\xfd Tri thức Biết Tuốt AI.\r
`],{type:"text/plain;charset=utf-8"}),d=URL.createObjectURL(o),c=document.createElement("a");c.href=d;let x=a.trim().replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g,"_")||"reading";c.download=`LuanGiai_${n.replace(/\s+/g,"_")}_${x}.txt`,document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(d)}function r(e){let{title:t,subjectName:a,category:n,dateInfo:r,content:i}=e,s=i.replace(/^### (.*$)/gim,'<h3 style="color:#b45309; margin-top:20px; margin-bottom:8px; font-size:16px;">$1</h3>').replace(/^## (.*$)/gim,'<h2 style="color:#1e3a8a; margin-top:24px; margin-bottom:10px; font-size:18px; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">$1</h2>').replace(/^# (.*$)/gim,'<h1 style="color:#0f172a; margin-top:28px; margin-bottom:12px; font-size:22px;">$1</h1>').replace(/\*\*(.*?)\*\*/gim,"<strong>$1</strong>").replace(/\*(.*?)\*/gim,"<em>$1</em>").replace(/\n\n/gim,'</p><p style="margin-bottom:12px; line-height:1.7;">').replace(/\n/gim,"<br/>"),l=window.open("","_blank");l?(l.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <title>${t} - ${a}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
          background: #fff;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          font-size: 13.5px;
        }
        .header {
          text-align: center;
          border-bottom: 2px double #cbd5e1;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .header h1 {
          font-size: 22px;
          margin: 0 0 6px 0;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header .meta {
          font-size: 12px;
          color: #64748b;
        }
        .info-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
        }
        .content {
          text-align: justify;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bản Luận Giải Số Mệnh Chuy\xean S\xe2u</h1>
        <div class="meta">Hệ Thống Trợ L\xfd Tri Thức Biết Tuốt AI • Chuy\xean mục: ${n}</div>
      </div>

      <div class="info-box">
        <div><strong>Họ v\xe0 t\xean:</strong> ${a}</div>
        <div><strong>Thời gian sinh:</strong> ${r||"Theo hồ sơ"}</div>
        <div><strong>Ng\xe0y lập:</strong> ${new Date().toLocaleDateString("vi-VN")}</div>
      </div>

      <div class="content">
        <p style="margin-bottom:12px; line-height:1.7;">${s}</p>
      </div>

      <div class="footer">
        T\xe0i liệu được kết xuất từ website Biết Tuốt AI. Mọi ph\xe2n t\xedch mang t\xednh chất tham khảo & chi\xeam nghiệm.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `),l.document.close()):alert("Vui l\xf2ng cho ph\xe9p mở popup để xuất file PDF!")}a.d(t,{A:()=>r,w:()=>n})},4673:(e,t,a)=>{a.r(t),a.d(t,{default:()=>x});var n=a(5155),r=a(2115),i=a(6840),s=a(4678),l=a(9782),o=a(1849),d=a(2647);let c=[{name:"Bạch Dương (Aries)",dates:"21/03 - 19/04",element:"Lửa",planet:"Hỏa Tinh (Mars)",icon:"♈"},{name:"Kim Ngưu (Taurus)",dates:"20/04 - 20/05",element:"Đất",planet:"Kim Tinh (Venus)",icon:"♉"},{name:"Song Tử (Gemini)",dates:"21/05 - 21/06",element:"Kh\xed",planet:"Thủy Tinh (Mercury)",icon:"♊"},{name:"Cự Giải (Cancer)",dates:"22/06 - 22/07",element:"Nước",planet:"Mặt Trăng (Moon)",icon:"♋"},{name:"Sư Tử (Leo)",dates:"23/07 - 22/08",element:"Lửa",planet:"Mặt Trời (Sun)",icon:"♌"},{name:"Xử Nữ (Virgo)",dates:"23/08 - 22/09",element:"Đất",planet:"Thủy Tinh (Mercury)",icon:"♍"},{name:"Thi\xean B\xecnh (Libra)",dates:"23/09 - 23/10",element:"Kh\xed",planet:"Kim Tinh (Venus)",icon:"♎"},{name:"Bọ Cạp (Scorpio)",dates:"24/10 - 21/11",element:"Nước",planet:"Di\xeam Vương Tinh (Pluto)",icon:"♏"},{name:"Nh\xe2n M\xe3 (Sagittarius)",dates:"22/11 - 21/12",element:"Lửa",planet:"Mộc Tinh (Jupiter)",icon:"♐"},{name:"Ma Kết (Capricorn)",dates:"22/12 - 19/01",element:"Đất",planet:"Thổ Tinh (Saturn)",icon:"♑"},{name:"Bảo B\xecnh (Aquarius)",dates:"20/01 - 18/02",element:"Kh\xed",planet:"Thi\xean Vương Tinh (Uranus)",icon:"♒"},{name:"Song Ngư (Pisces)",dates:"19/02 - 20/03",element:"Nước",planet:"Hải Vương Tinh (Neptune)",icon:"♓"}];function x({onOpenLoginModal:e}){let{user:t,updateUserCredits:a}=(0,l.A)(),[h,m]=(0,r.useState)(!1),[g,b]=(0,r.useState)(""),[p,u]=(0,r.useState)(2e3),[y,f]=(0,r.useState)(7),[N,k]=(0,r.useState)(15),[v,j]=(0,r.useState)(14),[S,T]=(0,r.useState)(20),[w,C]=(0,r.useState)("H\xe0 Nội"),[$,B]=(0,r.useState)(null),[M,A]=(0,r.useState)(""),[I,L]=(0,r.useState)(!1),[H,D]=(0,r.useState)([]);r.useEffect(()=>{try{let e=t?.id||t?.email||"guest",a=localStorage.getItem(`omni_chiemtinh_history_${e}`);if(a){let e=JSON.parse(a);Array.isArray(e)&&D(e)}}catch{}},[t?.id,t?.email]);let _=async n=>{if(n.preventDefault(),g.trim()){if(!t)return void e?.();if("ADMIN"!==t.role&&t.email?.toLowerCase()!=="hoanglinhcntti@gmail.com"&&1>(t.credits||0))return void m(!0);try{L(!0),A("");let n=3===y&&N>=21||4===y&&N<=19?"Bạch Dương (Aries)":4===y&&N>=20||5===y&&N<=20?"Kim Ngưu (Taurus)":5===y&&N>=21||6===y&&N<=21?"Song Tử (Gemini)":6===y&&N>=22||7===y&&N<=22?"Cự Giải (Cancer)":7===y&&N>=23||8===y&&N<=22?"Sư Tử (Leo)":8===y&&N>=23||9===y&&N<=22?"Xử Nữ (Virgo)":9===y&&N>=23||10===y&&N<=23?"Thi\xean B\xecnh (Libra)":10===y&&N>=24||11===y&&N<=21?"Bọ Cạp (Scorpio)":11===y&&N>=22||12===y&&N<=21?"Nh\xe2n M\xe3 (Sagittarius)":12===y&&N>=22||1===y&&N<=19?"Ma Kết (Capricorn)":1===y&&N>=20||2===y&&N<=18?"Bảo B\xecnh (Aquarius)":"Song Ngư (Pisces)",r=(Math.floor(v/2)+2*y)%12,i=(2*N+y+3)%12,s=c[r]?.name||"Thi\xean B\xecnh (Libra)",l=c[i]?.name||"Cự Giải (Cancer)",o={name:g,birthStr:`${N}/${y}/${p} l\xfac ${v.toString().padStart(2,"0")}:${S.toString().padStart(2,"0")} tại ${w}`,sunSign:n,moonSign:l,ascSign:s,mercury:c[(r+1)%12]?.name,venus:c[(r+2)%12]?.name,mars:c[(r+4)%12]?.name};B(o);let d=`Bạn l\xe0 Chuy\xean gia Chi\xeam Tinh Học (Astrologer) chuy\xean về Bản Đồ Sao C\xe1 Nh\xe2n (Natal Chart) chuẩn phương T\xe2y. H\xe3y ph\xe2n t\xedch chuy\xean s\xe2u cho:
- Đương sự: ${g}
- Ng\xe0y giờ v\xe0 nơi sinh: ${o.birthStr}
- Bộ Ba Quyền Năng (Big Three):
  + Cung Mặt Trời (Sun Sign): ${n} (Bản ng\xe3, mục đ\xedch sống)
  + Cung Mặt Trăng (Moon Sign): ${l} (Thế giới nội t\xe2m, v\xf4 thức)
  + Cung Mọc (Ascendant): ${s} (Lớp mặt nạ x\xe3 hội, ấn tượng đầu ti\xean)
- C\xe1c h\xe0nh tinh c\xe1 nh\xe2n: Sao Thủy (${o.mercury}), Sao Kim (${o.venus}), Sao Hỏa (${o.mars})

H\xe3y luận giải theo cấu tr\xfac 5 phần chuẩn x\xe1c:
1. ☀️ BỘ BA QUYỀN NĂNG (BIG THREE): Sự giao thoa giữa Mặt Trời, Mặt Trăng v\xe0 Cung Mọc tạo n\xean c\xe1 t\xednh độc bản như thế n\xe0o.
2. 💖 T\xccNH Y\xcaU & CẢM X\xdaC (SAO KIM & SAO HỎA): C\xe1ch y\xeau, nhu cầu được y\xeau, đối tượng l\xfd tưởng v\xe0 th\xe1ch thức trong mối quan hệ.
3. 💼 SỰ NGHIỆP & T\xc0I CH\xcdNH (NH\xc0 2, NH\xc0 6, NH\xc0 10): Điểm mạnh nghề nghiệp, lĩnh vực bứt ph\xe1 t\xe0i lộc.
4. 🪐 B\xc0I HỌC VŨ TRỤ (SATURN RETURN & ĐIỂM NGHẼN): Những r\xe0o cản cần vượt qua để ho\xe0n thiện linh hồn.
5. 🌌 TH\xd4NG ĐIỆP DẪN LỐI TỪ VŨ TRỤ: Lời khuy\xean định hướng trong giai đoạn hiện tại.`,x=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"deep",botId:"cosmic-chart",messages:[{role:"user",content:d}]})});if(401===x.status){e?.(),L(!1);return}if(403===x.status){m(!0),L(!1);return}if(!x.ok)throw Error("Lỗi m\xe1y chủ chi\xeam tinh");let h=x.headers.get("X-Remaining-Credits");null!==h&&a(Number(h));let b=x.body?.getReader(),u=new TextDecoder,f="";if(b){let e=!1;for(;!e;){let{value:t,done:a}=await b.read();e=a,f+=u.decode(t||new Uint8Array,{stream:!0}),A(f)}}if(f.trim()&&o){let e=new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})+" "+new Date().toLocaleDateString("vi-VN"),a={id:`chiemtinh-${Date.now()}`,name:g,dateStr:e,birthStr:o.birthStr,sunSign:o.sunSign,chartObj:o,readingText:f};D(e=>{let n=[a,...e.filter(e=>e.id!==a.id)];try{let e=t?.id||t?.email||"guest";localStorage.setItem(`omni_chiemtinh_history_${e}`,JSON.stringify(n.slice(0,30)))}catch{}return n});try{let e=t?.id||t?.email;if(e){let t={id:a.id,title:`🪐 Chi\xeam Tinh: ${g} (${o.sunSign})`,updatedAt:new Date().toISOString()},n=`omni_recent_convs_${e}`,r=localStorage.getItem(n),i=r?JSON.parse(r):[];i=[t,...i.filter(e=>e.id!==a.id)],localStorage.setItem(n,JSON.stringify(i.slice(0,30)));let s=[{id:`msg-user-${Date.now()}`,role:"user",content:`🪐 Lập bản đồ sao Chi\xeam Tinh cho ${g}, sinh ng\xe0y ${o.birthStr}`,createdAt:new Date().toISOString()},{id:`msg-ai-${Date.now()}`,role:"assistant",content:f,createdAt:new Date().toISOString()}];localStorage.setItem(`omni_chat_msgs_${a.id}`,JSON.stringify(s))}}catch{}}}catch(e){console.error(e),A("⚠️ Đang kết nối lại trạm quan s\xe1t chi\xeam tinh...")}finally{L(!1)}}};return(0,n.jsxs)("div",{className:"w-full max-w-6xl mx-auto p-3 sm:p-6 text-slate-800 dark:text-slate-100 min-h-[85vh]",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between pb-6 mb-6 border-b border-cyan-200 dark:border-cyan-900/40",children:[(0,n.jsxs)("div",{className:"flex items-center gap-3",children:[(0,n.jsx)("div",{className:"w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-600 to-indigo-600 dark:from-cyan-950 dark:via-teal-900 dark:to-cyan-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 dark:shadow-cyan-900/50 border border-cyan-300 dark:border-cyan-400/30 text-white",children:"\uD83E\uDE90"}),(0,n.jsxs)("div",{children:[(0,n.jsxs)("h1",{className:"text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2",children:["Bản Đồ Sao Chi\xeam Tinh (Natal Chart)",(0,n.jsx)("span",{className:"text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30",children:"12 Cung Ho\xe0ng Đạo"})]}),(0,n.jsx)("p",{className:"text-xs sm:text-sm text-slate-500 dark:text-slate-400",children:"Giải m\xe3 Big Three (Mặt Trời, Mặt Trăng, Cung Mọc) v\xe0 vị tr\xed c\xe1c h\xe0nh tinh c\xe1 nh\xe2n"})]})]}),(0,n.jsxs)("button",{onClick:()=>m(!0),className:"px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-amber-400/50 hover:border-amber-500 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-amber-50 dark:hover:bg-slate-800 transition-all cursor-pointer",children:[(0,n.jsx)("span",{children:"\uD83E\uDE99"})," ",t?.credits??0," Credits"]})]}),(0,n.jsxs)("form",{onSubmit:_,className:"bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl mb-8",children:[(0,n.jsxs)("h2",{className:"text-base font-bold text-cyan-700 dark:text-cyan-300 mb-4 flex items-center gap-2",children:[(0,n.jsx)("span",{children:"✨"})," Nhập th\xf4ng tin khai sinh để lập bản đồ sao"]}),(0,n.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5",children:[(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{className:"block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5",children:"Họ v\xe0 T\xean"}),(0,n.jsx)("input",{type:"text",required:!0,value:g,onChange:e=>b(e.target.value),placeholder:"VD: Trần Mai Linh",className:"w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"})]}),(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{className:"block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5",children:"Nơi Sinh (Tỉnh/Th\xe0nh phố)"}),(0,n.jsx)("input",{type:"text",required:!0,value:w,onChange:e=>C(e.target.value),placeholder:"VD: TP. Hồ Ch\xed Minh",className:"w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"})]}),(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{className:"block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5",children:"Ng\xe0y Sinh (Dương Lịch)"}),(0,n.jsxs)("div",{className:"grid grid-cols-3 gap-1.5",children:[(0,n.jsx)("input",{type:"number",min:"1",max:"31",value:N,onChange:e=>k(Number(e.target.value)),className:"px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs text-center outline-none focus:border-cyan-500",placeholder:"Ng\xe0y"}),(0,n.jsx)("input",{type:"number",min:"1",max:"12",value:y,onChange:e=>f(Number(e.target.value)),className:"px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs text-center outline-none focus:border-cyan-500",placeholder:"Th\xe1ng"}),(0,n.jsx)("input",{type:"number",min:"1940",max:"2030",value:p,onChange:e=>u(Number(e.target.value)),className:"px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs text-center outline-none focus:border-cyan-500",placeholder:"Năm"})]})]}),(0,n.jsxs)("div",{children:[(0,n.jsx)("label",{className:"block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5",children:"Giờ Sinh"}),(0,n.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,n.jsx)("input",{type:"number",min:"0",max:"23",value:v,onChange:e=>j(Number(e.target.value)),className:"px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs text-center outline-none focus:border-cyan-500",placeholder:"Giờ (0-23)"}),(0,n.jsx)("input",{type:"number",min:"0",max:"59",value:S,onChange:e=>T(Number(e.target.value)),className:"px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs text-center outline-none focus:border-cyan-500",placeholder:"Ph\xfat"})]})]})]}),(0,n.jsx)("div",{className:"flex justify-end",children:(0,n.jsx)("button",{type:"submit",disabled:I,className:"w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",children:I?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),(0,n.jsx)("span",{children:"Đang Lập Bản Đồ Sao..."})]}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("span",{children:"\uD83E\uDE90"})," Kh\xe1m Ph\xe1 Bản Đồ Sao C\xe1 Nh\xe2n"]})})})]}),H.length>0&&!$&&(0,n.jsxs)("div",{className:"mb-8 space-y-3",children:[(0,n.jsxs)("h3",{className:"text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5",children:[(0,n.jsx)("span",{children:"\uD83E\uDE90"})," Bản đồ sao Chi\xeam Tinh đ\xe3 xem gần đ\xe2y (",H.length,")"]}),(0,n.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3",children:H.map(e=>(0,n.jsxs)("div",{onClick:()=>{b(e.name),B(e.chartObj),A(e.readingText)},className:"p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 hover:bg-cyan-50/50 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col justify-between group shadow-sm dark:shadow-md",children:[(0,n.jsxs)("div",{children:[(0,n.jsxs)("div",{className:"flex items-center justify-between mb-1",children:[(0,n.jsx)("span",{className:"font-bold text-sm text-cyan-700 dark:text-cyan-300 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors",children:e.name}),(0,n.jsx)("span",{className:"text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50 font-semibold",children:e.sunSign.split(" ")[0]})]}),(0,n.jsx)("p",{className:"text-xs text-slate-500 dark:text-slate-400 truncate",children:e.birthStr})]}),(0,n.jsxs)("div",{className:"mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500",children:[(0,n.jsx)("span",{children:e.dateStr}),(0,n.jsx)("span",{className:"text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium",children:"Xem lại →"})]})]},e.id))})]}),$&&(0,n.jsxs)("div",{className:"space-y-8 animate-fadeIn",children:[(0,n.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[(0,n.jsxs)("div",{className:"p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/30 dark:from-amber-950/60 dark:to-slate-950 border border-amber-200 dark:border-amber-500/40 shadow-lg dark:shadow-xl",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between mb-3",children:[(0,n.jsx)("span",{className:"text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider",children:"Cung Mặt Trời (Sun)"}),(0,n.jsx)("span",{className:"text-2xl",children:"☀️"})]}),(0,n.jsx)("h4",{className:"text-lg font-black text-slate-900 dark:text-white",children:$.sunSign}),(0,n.jsx)("p",{className:"text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed",children:"Đại diện cho \xfd ch\xed, bản ng\xe3 cốt l\xf5i, c\xe1 t\xednh l\xfd tr\xed v\xe0 c\xe1ch bạn tỏa s\xe1ng trong cuộc đời."})]}),(0,n.jsxs)("div",{className:"p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 dark:from-indigo-950/60 dark:to-slate-950 border border-indigo-200 dark:border-indigo-500/40 shadow-lg dark:shadow-xl",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between mb-3",children:[(0,n.jsx)("span",{className:"text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider",children:"Cung Mặt Trăng (Moon)"}),(0,n.jsx)("span",{className:"text-2xl",children:"\uD83C\uDF19"})]}),(0,n.jsx)("h4",{className:"text-lg font-black text-slate-900 dark:text-white",children:$.moonSign}),(0,n.jsx)("p",{className:"text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed",children:"Thế giới cảm x\xfac nội t\xe2m s\xe2u k\xedn, trực gi\xe1c v\xe0 phản ứng tự nhi\xean khi bạn ở một m\xecnh."})]}),(0,n.jsxs)("div",{className:"p-5 rounded-2xl bg-gradient-to-br from-cyan-50 via-white to-cyan-50/30 dark:from-cyan-950/60 dark:to-slate-950 border border-cyan-200 dark:border-cyan-500/40 shadow-lg dark:shadow-xl",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between mb-3",children:[(0,n.jsx)("span",{className:"text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider",children:"Cung Mọc (Ascendant)"}),(0,n.jsx)("span",{className:"text-2xl",children:"\uD83C\uDF05"})]}),(0,n.jsx)("h4",{className:"text-lg font-black text-slate-900 dark:text-white",children:$.ascSign}),(0,n.jsx)("p",{className:"text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed",children:"Lăng k\xednh bạn nh\xecn thế giới v\xe0 phong th\xe1i b\xean ngo\xe0i m\xe0 người kh\xe1c cảm nhận về bạn."})]})]}),(0,n.jsxs)("div",{className:"bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl",children:[(0,n.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800",children:[(0,n.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,n.jsx)("span",{className:"text-2xl",children:"\uD83E\uDE90"}),(0,n.jsxs)("div",{children:[(0,n.jsx)("h3",{className:"text-base sm:text-lg font-black text-slate-900 dark:text-white",children:"Ph\xe2n T\xedch Chi Tiết Từ Nh\xe0 Chi\xeam Tinh Học"}),(0,n.jsx)("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:"Ph\xe2n giải g\xf3c chiếu c\xe1c h\xe0nh tinh, đường c\xf4ng danh, \xe1i t\xecnh v\xe0 sứ mệnh vũ trụ"})]})]}),M&&(0,n.jsxs)("div",{className:"flex items-center gap-2 shrink-0",children:[(0,n.jsxs)("button",{type:"button",onClick:()=>(0,d.A)({title:"Bản Đồ Sao Chi\xeam Tinh — 12 Cung Ho\xe0ng Đạo",subjectName:g||"Đương Số",category:"Bản Đồ Sao Chi\xeam Tinh",dateInfo:$?`${$.birthStr} • Nơi sinh: ${$.birthCity||"Việt Nam"}`:void 0,content:M}),className:"px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs",title:"In hoặc lưu th\xe0nh file PDF",children:[(0,n.jsx)("span",{children:"\uD83D\uDDA8️"}),(0,n.jsx)("span",{children:"Xuất PDF"})]}),(0,n.jsxs)("button",{type:"button",onClick:()=>(0,d.w)({title:"Bản Đồ Sao Chi\xeam Tinh — 12 Cung Ho\xe0ng Đạo",subjectName:g||"Đương Số",category:"Bản Đồ Sao Chi\xeam Tinh",dateInfo:$?`${$.birthStr} • Nơi sinh: ${$.birthCity||"Việt Nam"}`:void 0,content:M}),className:"px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",title:"Tải văn bản b\xe0i luận giải về m\xe1y (.txt)",children:[(0,n.jsx)("span",{children:"\uD83D\uDCE5"}),(0,n.jsx)("span",{children:"Tải TXT"})]})]})]}),M?(0,n.jsx)("div",{className:"prose dark:prose-invert prose-cyan max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4",children:(0,n.jsx)(i.oz,{remarkPlugins:[s.A],children:M})}):(0,n.jsx)("div",{className:"py-12 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse",children:"Đang t\xednh to\xe1n c\xe1c g\xf3c hợp v\xe0 bi\xean soạn lời luận giải..."})]})]}),(0,n.jsx)(o.Ay,{isOpen:h,onClose:()=>m(!1)})]})}}}]);