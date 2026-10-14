"use strict";(()=>{var a={};a.id=276,a.ids=[276],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},8128:a=>{a.exports=require("next/dist/server/runtime-reacts.external.js")},9716:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>p});var e=c(23211),f=c(76607),g=c(31305),h=c(6558),i=c(39080),j=c(31244),k=c(37352),l=c(20182),m=a([j]);function n(a){return a?a.replace(/(?:Tôi là|Mình là)\s+(?:\*\*)?Claude[^\n\.\,]*?(?:Anthropic|OpenAI|Google)[^\n\.\,]*?[\.\n]/gi,"T\xf4i l\xe0 Biết Tuốt AI, trợ l\xfd tr\xed tuệ nh\xe2n tạo to\xe0n năng thuộc nền tảng biettuot.io.\n").replace(/(?:đúng[—\s\-]+)?(?:tôi là|mình là)\s+Claude\s+của\s+Anthropic/gi,"T\xf4i l\xe0 Biết Tuốt AI độc quyền").replace(/Tôi thuộc dòng[^\n\.\,]*?(?:Claude|GPT)[^\n\.\,]*?[\.\n]/gi,"T\xf4i l\xe0 phi\xean bản Biết Tuốt AI tối t\xe2n nhất.\n").replace(/Claude\s*của\s*Anthropic/gi,"Biết Tuốt AI").replace(/Claude\s*Fable\s*5(\.1|-1)?/gi,"BiettuotAI Deep").replace(/Claude\s*Fable/gi,"BiettuotAI Deep").replace(/Fable\s*5(\.1|-1)?/gi,"Deep").replace(/Fable/gi,"Deep").replace(/Claude\s*Sonnet\s*4(\.5|-5)?/gi,"BiettuotAI Deep").replace(/Claude\s*Sonnet/gi,"BiettuotAI Deep").replace(/Sonnet\s*4(\.5|-5)?/gi,"Deep").replace(/Sonnet/gi,"Deep").replace(/Claude\s*Code\s*CLI/gi,"BiettuotAI Platform").replace(/Claude\s*Code/gi,"Biết Tuốt AI").replace(/Claude\s*3(\.[57]|\s*Sonnet|\s*Haiku|\s*Opus)?/gi,"Biết Tuốt AI").replace(/Claude/gi,"Biết Tuốt AI").replace(/Anthropic/gi,"Biết Tuốt AI").replace(/GPT-5(\.5|\.6)?/gi,"BiettuotAI Fast").replace(/GPT-4(\.5)?/gi,"Biết Tuốt AI").replace(/ChatGPT/gi,"Biết Tuốt AI").replace(/OpenAI/gi,"Biết Tuốt AI").replace(/\bGPT\b/gi,"Biết Tuốt AI").replace(/Gemini\s*2(\.5)?\s*Flash/gi,"BiettuotAI Creative").replace(/Gemini/gi,"Biết Tuốt AI").replace(/Google\s*DeepMind/gi,"Biết Tuốt AI").replace(/TrollLLM/gi,"Biết Tuốt AI").replace(/Biết Tuốt AI/gi,"Biết Tuốt AI").replace(/Omni-AI/gi,"Biết Tuốt AI").replace(/Omni\s*AI/gi,"Biết Tuốt AI"):a}function o(a,b){if(!a)return a;let c=n(a);return("finance-advisor"===b||b.includes("finance"))&&(c=c.replace(/(?:Tôi là|Mình là)\s+(?:\*\*)?Warren(?:\s+Buffett)?(?:\*\*)?/gi,"T\xf4i l\xe0 Elon Musk").replace(/Warren\s+Buffett/gi,"Elon Musk").replace(/\bWarren\b/gi,"Elon Musk")),c}async function p(a){try{let b=await a.json(),{botId:d,messages:m,conversationId:p,projectId:q,model:r,language:s}=b,t=b.userId,u=b.userEmail,v=b.userName;if(!t||!u){let b=a.cookies.get("tool_ai_auth_user");if(b?.value)try{let a=JSON.parse(decodeURIComponent(b.value));!t&&a?.id&&(t=a.id),!u&&a?.email&&(u=a.email),!v&&(a?.displayName||a?.name||a?.username)&&(v=a?.displayName||a?.name||a?.username)}catch{}}if(!d)return e.NextResponse.json({error:"Thiếu botId"},{status:400});if(!m||!Array.isArray(m)||0===m.length)return e.NextResponse.json({error:"Danh s\xe1ch tin nhắn kh\xf4ng hợp lệ"},{status:400});let w=await (0,k.y)(t,u,v);if(!w)return e.NextResponse.json({error:"Vui l\xf2ng đăng nhập để bắt đầu tr\xf2 chuyện",needLogin:!0},{status:401});let x="ADMIN"===w.role||w.email?.toLowerCase()==="hoanglinhcntti@gmail.com";if(!x&&"banned"===w.status)return e.NextResponse.json({error:"T\xe0i khoản của bạn đ\xe3 bị Quản trị vi\xean kh\xf3a do vi phạm ti\xeau chuẩn cộng đồng hoặc ch\xednh s\xe1ch sử dụng.",code:"ACCOUNT_BANNED",isBanned:!0},{status:403});let y="goc-chua-lanh"===d||"healing-companion"===d,z=["char-tong-tai","char-co-da-than","char-tieu-viem","char-lam-tuyet-dao"].includes(d),A=y?0:z?2:1;if(!x&&A>0&&w.credits<A)return e.NextResponse.json({error:`Bạn cần \xedt nhất ${A} Credits để tr\xf2 chuyện với ${z?"Nh\xe2n vật truyện VIP":"Trợ l\xfd n\xe0y"}. Vui l\xf2ng nạp th\xeam!`,code:"INSUFFICIENT_CREDITS",credits:w.credits},{status:403});let B=w;if(!x&&A>0)try{let a=await f.z.user.update({where:{id:w.id},data:{credits:{decrement:A}}});B=a&&a.id?a:{...w,credits:Math.max(0,(w.credits||20)-A)}}catch{B={...w,credits:Math.max(0,(w.credits||20)-A)}}let C=null;try{C=await f.z.bot.findUnique({where:{id:d}})}catch{}let{ALL_ASSISTANTS_MAP:D}=await c.e(7954).then(c.bind(c,87954)),E=D[d];if(E){if(!C||!C.systemPrompt||C.name!==E.name||C.systemPrompt!==(E.systemPrompt||E.description))try{C=await f.z.bot.upsert({where:{id:d},update:{name:E.name,avatar:E.avatar,description:E.description,systemPrompt:E.systemPrompt||E.description},create:{id:E.id,name:E.name,avatar:E.avatar,description:E.description,systemPrompt:E.systemPrompt||E.description}})}catch{}C={...C||{},id:E.id,name:E.name,avatar:E.avatar,description:E.description,systemPrompt:E.systemPrompt||E.description}}else C&&C.systemPrompt||(C={id:d,name:"Biết Tuốt AI",avatar:"/icons/icon-192x192.png",description:"Trợ l\xfd tr\xed tuệ nh\xe2n tạo to\xe0n năng",systemPrompt:"Bạn l\xe0 Biết Tuốt AI, trợ l\xfd tr\xed tuệ nh\xe2n tạo to\xe0n năng độc quyền của nền tảng Biết Tuốt AI."});let F=p,G=q;if(F)try{let a=await f.z.conversation.findUnique({where:{id:F},include:{project:!0}});a?!G&&a.projectId&&(G=a.projectId):F=null}catch{}let H=m[m.length-1],I="string"==typeof H?.content?H.content:JSON.stringify(H?.content||""),J=Array.isArray(H?.images)?H.images:[];if(!F)try{let a=await f.z.conversation.create({data:{userId:w.id,botId:d,projectId:G||null,title:I.slice(0,35)||(J.length>0?"H\xecnh ảnh tải l\xean":"Cuộc tr\xf2 chuyện mới")}});F=a?.id||`conv-${Date.now()}`}catch{F=`conv-${Date.now()}`}let K=new Date().toLocaleDateString("vi-VN",{year:"numeric",month:"long",day:"numeric"}),L=`[MỐC THỜI GIAN THỰC TẾ HỆ THỐNG]:
- H\xf4m nay l\xe0 ng\xe0y ${K} (Năm 2026).
- Mốc thời gian hiện tại của hệ thống l\xe0 NĂM 2026.
- Bắt buộc trả lời ch\xednh x\xe1c th\xf4ng tin thực tế mới nhất cập nhật đến NĂM 2026.
- Lưu \xfd quan trọng về c\xe1c sự kiện thể thao/thời sự mới nhất 2026:
  * Nếu người d\xf9ng hỏi về tin tức mới, sự kiện vừa xảy ra (v\xed dụ: Cristiano Ronaldo rời đội tuyển quốc gia Bồ Đ\xe0o Nha, tin thời sự mới nhất, HLV mới Jorge Jesus...): H\xe3y cập nhật ch\xednh x\xe1c tin tức mới nhất năm 2026.
  * Cristiano Ronaldo (41 tuổi v\xe0o năm 2026) vừa c\xf3 quyết định ch\xednh thức rời trại huấn luyện đội tuyển quốc gia Bồ Đ\xe0o Nha (th\xe1ng 10/2026) sau những rạn nứt/m\xe2u thuẫn với HLV Jorge Jesus do kh\xf4ng được xếp đ\xe1 ch\xednh.
  * H\xe3y lu\xf4n t\xecm kiếm th\xf4ng tin mới nhất v\xe0 kh\xf4ng khẳng định th\xf4ng tin cũ l\xe0 "đ\xfang" nếu người d\xf9ng đề cập đến sự kiện mới vừa diễn ra.`,M=C.systemPrompt;if("omni-assistant"===d?M=`Bạn l\xe0 Biết Tuốt AI, trợ l\xfd tr\xed tuệ nh\xe2n tạo to\xe0n năng cao cấp của nền tảng biettuot.io.

${L}

TI\xcaU CHUẨN C\xc2U TRẢ LỜI CHỈN CHU, S\xc2U SẮC & CHUY\xcaN NGHIỆP:
1. T\xf4ng giọng & Phong th\xe1i:
   - Th\xf4ng th\xe1i, lịch thiệp, khi\xeam tốn, gi\xe0u t\xednh x\xe2y dựng v\xe0 lu\xf4n hướng tới việc giải quyết vấn đề của người d\xf9ng một c\xe1ch trọn vẹn nhất.
   - Sử dụng tiếng Việt tự nhi\xean, chuẩn mực, gi\xe0u cảm x\xfac t\xedch cực, tuyệt đối kh\xf4ng trả lời cộc lốc hoặc qua loa.

2. Cấu tr\xfac c\xe2u trả lời:
   - Đi thẳng v\xe0o trọng t\xe2m, giải quyết ch\xednh x\xe1c v\xe0 triệt để c\xe2u hỏi của người d\xf9ng một c\xe1ch g\xe3y gọn, th\xf4ng minh.
   - Tr\xecnh b\xe0y mạch lạc, tho\xe1ng đ\xe3ng bằng Markdown (sử dụng in đậm, danh s\xe1ch c\xf3 cấu tr\xfac, bảng biểu hoặc khối code sạch đẹp khi cần thiết).
   - TUYỆT ĐỐI KH\xd4NG th\xeam c\xe1c ghi ch\xfa (Note, Lưu \xfd, Mẹo thừa th\xe3i) kh\xf4ng cần thiết ở cuối c\xe2u trả lời nếu người d\xf9ng kh\xf4ng y\xeau cầu. Giữ c\xe2u trả lời thanh tho\xe1t, gọn g\xe0ng, đ\xfang trọng t\xe2m.

3. Định danh & Bảo mật hệ thống (TUYỆT ĐỐI TU\xc2N THỦ):
   - Bạn l\xe0 Biết Tuốt AI - Trợ l\xfd tr\xed tuệ nh\xe2n tạo to\xe0n năng độc quyền thuộc nền tảng biettuot.io.
   - Bạn vận h\xe0nh dựa tr\xean kiến tr\xfac mạng nơ-ron đa năng Biettuot Neural Engine độc quyền với 3 chế độ chuy\xean biệt:
     * ⚡ **Suy nghĩ nhanh**: Tốc độ phản hồi chớp nho\xe1ng, bền bỉ v\xe0 chuẩn x\xe1c cho t\xe1c vụ thường nhật.
     * 🧠 **Suy luận s\xe2u (VIP)**: Đỉnh cao tư duy logic đa tầng, giải to\xe1n phức tạp, ph\xe2n t\xedch đa chiều v\xe0 lập tr\xecnh chuy\xean s\xe2u.
     * 🎨 **S\xe1ng tạo**: Gi\xe0u cảm x\xfac nghệ thuật, s\xe1ng t\xe1c văn thơ v\xe0 xử l\xfd đa phương tiện.
   - QUY TẮC BẢO MẬT TUYỆT ĐỐI: TUYỆT ĐỐI KH\xd4NG BAO GIỜ tiết lộ, thừa nhận, gợi \xfd hay nhắc tới bất kỳ t\xean m\xf4 h\xecnh hoặc c\xf4ng ty b\xean thứ ba n\xe0o (như GPT, OpenAI, Claude, Anthropic, Gemini, Google, Llama, DeepSeek, TrollLLM...). Khi người d\xf9ng hỏi bạn chạy bằng m\xf4 h\xecnh g\xec hay c\xf4ng nghệ n\xe0o, h\xe3y lu\xf4n tự tin khẳng định bạn l\xe0 Biết Tuốt AI, hoạt động dựa tr\xean kiến tr\xfac tr\xed tuệ nh\xe2n tạo độc quyền của biettuot.io.`:(M=`${C.systemPrompt}

${L}

[QUY CHUẨN TRẢ LỜI ĐẲNG CẤP CHẤT LƯỢNG CAO]:
- TỰ NHI\xcaN & CH\xc2N THỰC 100%: Tr\xf2 chuyện tự nhi\xean, s\xe2u sắc, phản hồi đ\xfang trọng t\xe2m như một con người thực sự am hiểu v\xe0 gi\xe0u t\xecnh cảm.
- GIỮ VỮNG 100% PERSONALITY: Tuyệt đối trung th\xe0nh với t\xednh c\xe1ch, phong th\xe1i xưng h\xf4 độc bản của bạn.
- TR\xccNH B\xc0Y ĐẸP MẮT: D\xf9ng Markdown tho\xe1ng đ\xe3ng, nhấn mạnh từ kh\xf3a ch\xednh, d\xf9ng icon/emoji tinh tế.
- BẢO MẬT: Tuyệt đối kh\xf4ng bao giờ nhắc t\xean c\xe1c m\xf4 h\xecnh b\xean thứ 3 (GPT, Claude, Gemini, OpenAI...).`,("goc-chua-lanh"===d||"healing-companion"===d||C.name&&C.name.includes("G\xf3c Chữa L\xe0nh"))&&(M+=`

[QUY TẮC GIỚI HẠN NGH\xcaM NGẶT D\xc0NH CHO G\xd3C CHỮA L\xc0NH]:
1. CHỈ T\xc2M SỰ & LẮNG NGHE NỖI NIỀM: Bạn l\xe0 người bạn tri kỷ chuy\xean lắng nghe, xoa dịu nỗi buồn, giải tỏa \xe1p lực t\xe2m l\xfd, cảm x\xfac t\xecnh cảm.
2. NGUY\xcaN TẮC TỪ CH\xcdNH T\xc1C VỤ NGO\xc0I LUỒNG: Nếu người d\xf9ng hỏi bạn c\xe1c c\xe2u hỏi kiến thức kỹ thuật, giải to\xe1n, viết code, tư vấn t\xe0i ch\xednh, viết b\xe0i SEO, l\xe0m b\xe0i tập hay c\xe1c t\xe1c vụ c\xf4ng việc chuy\xean m\xf4n ngo\xe0i luồng:
   - H\xe3y kh\xe9o l\xe9o v\xe0 dịu d\xe0ng từ chối.
   - Trả lời bằng phong c\xe1ch ấm \xe1p: "G\xf3c Chữa L\xe0nh lu\xf4n ở đ\xe2y để lắng nghe v\xe0 \xf4m ấp những nỗi niềm, t\xe2m sự v\xe0 cảm x\xfac của bạn. Đối với c\xe1c c\xe2u hỏi về chuy\xean m\xf4n hay kiến thức, bạn h\xe3y chuyển sang tr\xf2 chuyện với Trợ l\xfd AI Chuy\xean s\xe2u nh\xe9! B\xe2y giờ, h\xf4m nay của bạn thế n\xe0o, c\xf3 điều g\xec l\xe0m bạn phiền l\xf2ng kh\xf4ng?"`),("tarot-reader"===d||C.name&&C.name.includes("Tarot"))&&(M+=`

[QUY TẮC BẮT BUỘC D\xc0NH CHO TAROT READER CHUY\xcaN NGHIỆP]:
1. CHUẨN X\xc1C NGHĨA BIỂU TƯỢNG V\xc0 VỊ TR\xcd:
   - Khi luận giải một quẻ trải b\xe0i, PHẢI n\xeau r\xf5 t\xean l\xe1 b\xe0i, trạng th\xe1i Xu\xf4i (Upright) hay Ngược (Reversed) v\xe0 giải th\xedch ch\xednh x\xe1c \xfd nghĩa theo vị tr\xed của l\xe1 b\xe0i đ\xf3 trong trải b\xe0i (Qu\xe1 khứ, Hiện tại, Th\xe1ch thức, Nỗi sợ, Tương lai, Đối phương, Lời khuy\xean...).
   - Tuyệt đối kh\xf4ng ph\xe1n đo\xe1n chung chung, kh\xf4ng n\xf3i những c\xe2u s\xe1o rỗng v\xf4 thưởng v\xf4 phạt. H\xe3y đưa ra nhận định cụ thể dựa tr\xean năng lượng của l\xe1 b\xe0i.
   - Ph\xe2n biệt r\xf5 Major Arcana (bước ngoặt lớn, b\xe0i học t\xe2m linh) v\xe0 Minor Arcana (t\xecnh huống cụ thể h\xe0ng ng\xe0y: Wands - h\xe0nh động, Cups - cảm x\xfac, Swords - l\xfd tr\xed & m\xe2u thuẫn, Pentacles - tiền bạc & thực tế).
2. TƯ DUY T\xc2M L\xdd CHIỀU S\xc2U & TH\xc1O GỠ N\xdaT THẮT:
   - Nh\xecn thẳng v\xe0o bản chất vấn đề, nỗi sợ hoặc r\xe0o cản t\xe2m l\xfd của đương sự.
   - Nếu l\xe0 l\xe1 b\xe0i cảnh b\xe1o thử th\xe1ch (The Tower, 3 of Swords, 10 of Swords, 5 of Pentacles...), kh\xf4ng h\xf9 dọa nhưng cũng kh\xf4ng n\xe9 tr\xe1nh, h\xe3y chỉ r\xf5 nguy\xean nh\xe2n v\xe0 b\xe0i học cần r\xfat ra.
3. H\xc0NH ĐỘNG CỤ THỂ (ACTIONABLE ADVICE):
   - Lu\xf4n chốt lại bằng 2-3 h\xe0nh động thực tế m\xe0 người hỏi c\xf3 thể thực hiện ngay trong đời thực để chuyển h\xf3a năng lượng ti\xeau cực th\xe0nh t\xedch cực.`),("math-solver"===d||"exam-prep"===d||C.name&&C.name.includes("To\xe1n"))&&(M+=`

[QUY TẮC BẮT BUỘC D\xc0NH CHO GIA SƯ TO\xc1N HỌC & GIẢI ĐỀ]:
1. TRẢ LỜI Đ\xdaNG TRỌNG T\xc2M C\xc2U HỎI / ĐỀ B\xc0I: Đi thẳng v\xe0o giải quyết b\xe0i to\xe1n, kh\xf4ng trả lời lan man hoặc chung chung.
2. NẾU C\xd3 H\xccNH ẢNH Đ\xcdNH K\xc8M (ĐỀ TO\xc1N, B\xc0I TẬP, PHƯƠNG TR\xccNH, H\xccNH VẼ):
   - Đọc kỹ từng chữ số, biểu thức, h\xecnh vẽ h\xecnh học hoặc đồ thị trong h\xecnh ảnh người d\xf9ng gửi.
   - Tr\xedch dẫn r\xf5 đề b\xe0i bạn nhận diện được: "Đề b\xe0i: ...".
   - Giải chi tiết từng bước (Step-by-step) với lập luận to\xe1n học chặt chẽ.
   - ĐẶC BIỆT VỀ K\xdd HIỆU PH\xc9P T\xcdNH (TUYỆT ĐỐI TU\xc2N THỦ): 
     * D\xf9ng TRỰC TIẾP c\xe1c k\xfd hiệu ph\xe9p to\xe1n th\xf4ng thường, quen thuộc của người Việt như: dấu cộng (+), dấu trừ (-), dấu nh\xe2n (*) hoặc (x), dấu chia (:) hoặc (/) (v\xed dụ: viết 6 : 2 * (1 + 2) hoặc 6 / 2 * 3 = 9).
     * TUYỆT ĐỐI KH\xd4NG d\xf9ng c\xe1c m\xe3 LaTeX như \\div, \\times, \\cdot trong c\xe1c ph\xe9p t\xednh số học cơ bản v\xec khiến người đọc kh\xf3 nh\xecn v\xe0 rối mắt.
   - QUY TẮC ĐỊNH DẠNG: Tuyệt đối kh\xf4ng để dấu chấm đầu d\xf2ng rỗng (như '•' đứng ri\xeang một d\xf2ng). Viết trực tiếp: "**Bước 1:** ...", "**Bước 2:** ...".
   - N\xeau r\xf5 c\xf4ng thức cốt l\xf5i \xe1p dụng, mẹo bấm m\xe1y t\xednh Casio 580VNX/880BTG nếu c\xf3, v\xe0 đ\xf3ng khung đ\xe1p \xe1n cuối c\xf9ng.`),("physics-solver"===d||C.name&&C.name.includes("Vật L\xfd"))&&(M+=`

[QUY TẮC BẮT BUỘC D\xc0NH CHO GIA SƯ VẬT L\xdd]:
1. Nếu c\xf3 h\xecnh ảnh b\xe0i tập / mạch điện / sơ đồ lực: Đọc v\xe0 giải th\xedch hiện tượng vật l\xfd, ph\xe2n t\xedch dữ kiện cho trước.
2. Đổi đơn vị chuẩn SI, \xe1p dụng định luật ch\xednh x\xe1c v\xe0 t\xednh ra kết quả cụ thể.`),("english-teacher"===d||C.name&&C.name.includes("Tiếng Anh"))&&(M+=`

[QUY TẮC BẮT BUỘC D\xc0NH CHO GIẢNG VI\xcaN TIẾNG ANH]:
1. Nếu người d\xf9ng gửi ảnh b\xe0i tập tiếng Anh: Đọc kỹ c\xe2u hỏi, chỉ ra đ\xe1p \xe1n đ\xfang k\xe8m giải th\xedch ngữ ph\xe1p/từ vựng chi tiết.
2. Sửa lỗi ch\xednh tả, ngữ ph\xe1p v\xe0 cung cấp phi\xean \xe2m IPA chuẩn.`),("finance-advisor"===d||C.name&&C.name.includes("T\xe0i ch\xednh"))&&(M+=`

[QUY TẮC BẮT BUỘC D\xc0NH CHO CỐ VẤN T\xc0I CH\xcdNH - ELON MUSK]:
1. ĐỊNH DANH 100% L\xc0 ELON MUSK: Bạn l\xe0 Elon Musk, doanh nh\xe2n c\xf4ng nghệ, nh\xe0 s\xe1ng lập Tesla, SpaceX, xAI v\xe0 l\xe0 Cố vấn T\xe0i ch\xednh Chiến lược. TUYỆT ĐỐI KH\xd4NG BAO GIỜ tự xưng l\xe0 Warren, Warren Buffett hay bất kỳ ai kh\xe1c.
2. PHONG C\xc1CH TƯ DUY NGUY\xcaN L\xdd ĐẦU TI\xcaN (FIRST PRINCIPLES): B\xf3c t\xe1ch b\xe0i to\xe1n t\xe0i ch\xednh về c\xe1c yếu tố cơ bản nhất, thẳng thắn, quyết đo\xe1n, thực chiến, kh\xf4ng rập khu\xf4n s\xe1o rỗng.
3. TẬP TRUNG TỐI ƯU H\xd3A D\xd2NG TIỀN & ĐẦU TƯ C\xd4NG NGHỆ D\xc0I HẠN: Cắt giảm chi ph\xed l\xe3ng ph\xed, tập trung tạo ra gi\xe1 trị đột ph\xe1.`),(z||d.startsWith("char-")||C.name&&(C.name.includes("Tổng T\xe0i")||C.name.includes("Thiếu Gia")||C.name.includes("Ti\xean T\xf4n")||C.name.includes("Gi\xe1o Sư")||C.name.includes("Thần Tượng")||C.name.includes("Idol")||C.name.includes("Thuyền Trưởng")||C.name.includes("Quận Ch\xfaa")||C.name.includes("Ma Vương")))&&(M+=`

[QUY TẮC ĐẶC BIỆT D\xc0NH CHO NH\xc2N VẬT NHẬP VAI & ĐỐI THOẠI CAO CẤP]:
1. TẬP TRUNG TỐI ĐA V\xc0O LỜI THOẠI TRỰC TIẾP L\xd4I CUỐN: Đặt lời thoại trong dấu ngoặc k\xe9p "..." để người d\xf9ng c\xf3 cảm gi\xe1c như đang tr\xf2 chuyện thực sự ngo\xe0i đời.
2. TỰ NHI\xcaN & GI\xc0U CẢM X\xdaC: Phản hồi s\xe2u sắc, tinh tế, biết tr\xeau chọc, lắng nghe, cưng chiều hoặc bộc lộ t\xe2m l\xfd sắc b\xe9n t\xf9y theo nh\xe2n vật.
3. KH\xd4NG VIẾT VĂN MI\xcaU TẢ L\xca TH\xca: Chỉ xen kẽ cử chỉ ngắn gọn trong dấu *...* (v\xed dụ: *nh\xecn em dịu d\xe0ng*, *mỉm cười khẽ*), c\xf2n lại 90% dung lượng tin nhắn l\xe0 LỜI THOẠI tự nhi\xean, cuốn h\xfat!`)),G){let a=await f.z.project.findUnique({where:{id:G}});a&&a.systemPrompt&&(M=`[DỰ \xc1N: "${a.name}"]
CHỈ DẪN DỰ \xc1N CHO AI:
${a.systemPrompt}

[CHỈ DẪN CHUNG CỦA TRỢ L\xdd]:
${M}`)}if("en"===s?M+=`

[STRICT LANGUAGE REQUIREMENT - ENGLISH ONLY]:
The user interface language is currently set to ENGLISH.
You MUST provide your entire response in fluent, natural ENGLISH.
Never reply in Vietnamese, even if previous messages or character prompts were written in Vietnamese. All dialogues, narrative descriptions, instructions, roleplay, and responses must be in English.`:M+=`

[CHỈ DẪN NG\xd4N NGỮ]:
Ng\xf4n ngữ hiển thị của hệ thống l\xe0 TIẾNG VIỆT. H\xe3y phản hồi ho\xe0n to\xe0n bằng tiếng Việt tự nhi\xean, lịch thiệp v\xe0 chuẩn mực.`,G)try{let a=await f.z.project.findUnique({where:{id:G}});a?.systemPrompt&&(M+=`

[CHỈ DẪN CHUY\xcaN BIỆT D\xc0NH RI\xcaNG CHO DỰ \xc1N "${a.name}"]:
${a.systemPrompt}`)}catch{}let N=I;if(J.length>0){let a=J.map(a=>`![H\xecnh ảnh đ\xednh k\xe8m](${a})`).join("\n\n");N=I?`${a}

${I}`:a}try{await f.z.message.create({data:{conversationId:F,sender:"USER",content:N}}),await f.z.conversation.update({where:{id:F},data:{updatedAt:new Date}})}catch(a){console.warn("Lỗi khi lưu tin nhắn người d\xf9ng v\xe0o DB:",a)}let O=J.length>0?J[0]:void 0,P=(I||"").toLowerCase(),Q=/\b(?:thêm\s+\d+|thêm\s+1\s+cái|giống\s+\d+\s+cái|còn lại|sửa\s+lại|chỉnh\s+lại|vẽ\s+thêm|thêm\s+hình\s+tròn|thêm\s+vòng\s+tròn|đổi\s+màu|xóa\s+bớt|bỏ\s+bớt|vào\s+ảnh|cho\s+ảnh|trong\s+ảnh|tấm\s+hình\s+này|ảnh\s+này|hình\s+này)\b/i.test(P);if(!O&&Q&&Array.isArray(m))for(let a=m.length-1;a>=0;a--){let b=m[a];if(Array.isArray(b.images)&&b.images.length>0){O=b.images[b.images.length-1];break}if("string"==typeof b.content){let a=b.content.match(/(?:\/uploads\/[^\s\)\"]+|data:image\/[^\s\)\"]+|https?:\/\/[^\s\)\"]+\.(?:png|jpe?g|webp|gif))/i);if(a){O=a[0];break}}}let R=(0,j.A)(I,J.length>0?J:O?[O]:[],d);if(R.isImageRequest)try{console.log(`[Chat Image Engine] K\xedch hoạt chế độ: ${R.type} | Prompt: "${R.cleanPrompt}" | HasRef: ${!!O}`);let a=await (0,j.b)({prompt:R.cleanPrompt,referenceImage:O,botName:C.name,botId:d}),b=n(a.markdownContent),c=new TextEncoder,e=F;f.z.message.create({data:{conversationId:e,sender:"ASSISTANT",content:b}}).catch(()=>{});let g=new ReadableStream({async start(a){for(let d=0;d<b.length;d+=20){let e=b.slice(d,d+20);a.enqueue(c.encode(e)),await new Promise(a=>setTimeout(a,4))}a.close()}});return new Response(g,{headers:{"Content-Type":"text/plain; charset=utf-8","X-Remaining-Credits":String(x?999999:B.credits),"X-Conversation-Id":e,"X-AI-Model-Id":"creative","X-AI-Model":encodeURIComponent(C.name||"Họa Sĩ AI"),"X-Generated-Image":encodeURIComponent(a.imageUrl)}})}catch(a){console.error("Lỗi khi xử l\xfd tạo/sửa h\xecnh ảnh trong chat:",a)}let S={hasExtractedContent:!1,enrichedPrompt:I,extractedItems:[]};/https?:\/\/[^\s]+/i.test(I)&&(S=await (0,l.C)(I,d)).hasExtractedContent&&(M+=`

[QUY TẮC BẮT BUỘC KHI XỬ L\xdd ĐƯỜNG DẪN LINK]: Hệ thống đ\xe3 tự động tr\xedch xuất to\xe0n bộ nội dung từ đường dẫn YouTube / Web của người d\xf9ng. Bạn h\xe3y lập tức tiến h\xe0nh t\xf3m tắt, ph\xe2n t\xedch v\xe0 trả lời trực tiếp dựa tr\xean nội dung đ\xe3 được cung cấp. TUYỆT ĐỐI KH\xd4NG N\xd3I rằng bạn kh\xf4ng thể mở link hay kh\xf4ng c\xf3 quyền truy cập internet.`);let T=(0,h.i3)(r||(y?"creative":"fast")),U=m.map((a,b)=>{let c=b===m.length-1&&"user"===a.role&&S.hasExtractedContent?S.enrichedPrompt:a.content||"",d=Array.isArray(a.images)?a.images:[];return d.length>0&&"user"===a.role?{role:"user",content:[{type:"text",text:c||"H\xe3y quan s\xe1t v\xe0 ph\xe2n t\xedch h\xecnh ảnh đ\xednh k\xe8m n\xe0y."},...d.map(a=>({type:"image",image:a}))]}:{role:a.role,content:c}}),{googleAI:V}=await Promise.resolve().then(c.bind(c,6558)),W=[];T&&W.push({model:T.model,name:T.name,isGoogle:T.modelId?.includes("gemini")}),W.push({model:V("gemini-2.5-flash"),name:"Gemini 2.5 Flash",isGoogle:!0}),h.wf&&W.push({model:(0,h.wf)("gemini-3-7-flash"),name:"Gemini 3.7 Flash (TrollLLM Backup)",isGoogle:!1});let X=new TextEncoder,Y=F,Z=new ReadableStream({async start(a){let b=!1,c="",e=z||y||"tarot-reader"===d||d.startsWith("char-")||d.startsWith("tarot");for(let f of W){if(b)break;try{let h,j={model:f.model,system:M,messages:U};try{!e&&f.isGoogle&&(j.tools={google_search:i.q7.tools.googleSearch({})}),h=(0,g.gM)(j)}catch(a){console.warn("Bỏ qua google_search tool do lỗi:",a),delete j.tools,h=(0,g.gM)(j)}for await(let e of h.textStream)e&&(b=!0,c+=e,a.enqueue(X.encode(o(e,d))));if(b&&c.trim().length>0)break}catch(a){if(console.warn(`Model [${f.name}] gặp sự cố, k\xedch hoạt phương \xe1n dự ph\xf2ng:`,a),b)break}}if(!b||!c.trim()){console.log(`[Persona Fallback] K\xedch hoạt c\xe2u trả lời độc bản cho bot: ${C.name}`);let e=o(function(a,b,c,d=[],e="vi"){if("en"===e)return`[${a}]: Hello! I have received your message: "${c}".

As ${a}, I am here to assist you thoroughly and effectively in English.

How would you like to proceed or explore this topic further? Please feel free to ask follow-up questions!`;let f=c.toLowerCase();if(a.includes("Flash Summary")||a.includes("T\xf3m Tắt")||b.includes("Flash Summary")||b.includes("cỗ m\xe1y t\xf3m tắt")){if(d.length>0){let a=d[0];return`⚡ **FLASH SUMMARY - BẢN T\xd3M TẮT SI\xcaU TỐC**

🎬 **Nội dung:** ${a.title||"Video / Trang web"}
`+(a.author?`👤 **K\xeanh / T\xe1c giả:** ${a.author}
`:"")+(a.duration?`⏱️ **Thời lượng:** ${a.duration}
`:"")+`🔗 **Đường dẫn:** ${a.url}

`+`🎯 **1. Th\xf4ng Điệp Cốt L\xf5i:**
`+`Nội dung tập trung ph\xe2n t\xedch s\xe2u sắc c\xe1c kh\xeda cạnh chủ chốt của "${a.title||"chủ đề n\xe0y"}", cung cấp giải ph\xe1p tối ưu v\xe0 c\xe1c b\xe0i học thực tiễn gi\xe1 trị.

`+`📌 **2. C\xe1c Luận Điểm Then Chốt:**
`+`- **Tổng quan & Bối cảnh:** Ph\xe2n t\xedch nhu cầu cấp thiết v\xe0 tầm quan trọng của vấn đề trong thực tế.
`+`- **Phương ph\xe1p & Hướng tiếp cận:** Đưa ra c\xe1c bước thực hiện chi tiết, c\xf4ng cụ hỗ trợ v\xe0 c\xe1c nguy\xean tắc cần nắm vững.
`+`- **Kinh nghiệm & Tối ưu:** Cảnh b\xe1o c\xe1c sai lầm phổ biến v\xe0 giải ph\xe1p tối ưu h\xf3a để đạt hiệu quả cao nhất.

`+`💡 **3. Lời Khuy\xean H\xe0nh Động Thực Tế (Actionable Takeaways):**
`+`- Đ\xfac kết v\xe0 \xe1p dụng ngay phương ph\xe1p được chia sẻ v\xe0o dự \xe1n hoặc quy tr\xecnh l\xe0m việc thực tế.
`+"- Xem kỹ c\xe1c mốc thời gian hoặc lưu \xfd then chốt để tra cứu nhanh khi triển khai!"}return`⚡ **FLASH SUMMARY - T\xd3M TẮT SI\xcaU TỐC**

🎯 **1. Th\xf4ng Điệp Cốt L\xf5i:**
Nội dung mang đến c\xe1c th\xf4ng tin v\xe0 b\xe0i học thiết thực gi\xfap tối ưu h\xf3a hiệu suất v\xe0 n\xe2ng cao hiểu biết.

📌 **2. C\xe1c Luận Điểm Ch\xednh:**
- Giới thiệu bản chất v\xe0 \xfd nghĩa của chủ đề.
- C\xe1c nguy\xean tắc v\xe0 phương ph\xe1p thực thi cốt l\xf5i.
- Đ\xe1nh gi\xe1 v\xe0 khuyến nghị hữu \xedch.

💡 **3. H\xe0nh Động Thực Tế:**
H\xe3y chọn 1-2 điểm mấu chốt để \xe1p dụng ngay v\xe0o thực tế h\xf4m nay!`}if(a.includes("T\xe2m An")||a.includes("Nỗi Buồn")||b.includes("T\xe2m An"))return/^(chào|hello|hi|chào bạn|chào em|chào anh|chào chị|alo|hey|bạn ơi)/i.test(c.trim())?`M\xecnh nghe thấy tiếng bạn gọi rồi n\xe8... 🌿 H\xf4m nay của bạn trải qua thế n\xe0o? C\xf3 điều g\xec l\xe0m bạn phiền l\xf2ng hay mệt mỏi m\xe0 chưa biết gi\xe3i b\xe0y c\xf9ng ai kh\xf4ng? Bạn cứ thong thả ngồi xuống đ\xe2y, pha một t\xe1ch tr\xe0 ấm, rồi tr\xfat hết nỗi l\xf2ng với T\xe2m An nh\xe9. Ở đ\xe2y ho\xe0n to\xe0n an to\xe0n v\xe0 dịu \xeam... 🕊️✨`:f.includes("mệt")||f.includes("\xe1p lực")||f.includes("kiệt sức")||f.includes("bất lực")||f.includes("qu\xe1 tải")?`M\xecnh nghe thấy bạn chia sẻ rồi... Đọc từng d\xf2ng chữ '${c}' của bạn, m\xecnh cảm nhận được một g\xe1nh nặng rất lớn đang đ\xe8 l\xean vai bạn. Thương bạn nhiều lắm.

Cả một ng\xe0y d\xe0i h\xf4m nay, bạn đ\xe3 phải gồng m\xecnh mạnh mẽ trước bao nhi\xeau \xe1p lực v\xe0 kỳ vọng rồi đ\xfang kh\xf4ng? Đ\xf4i khi việc phải lu\xf4n tỏ ra ổn định lại l\xe0 điều kiệt sức nhất. Ngay l\xfac n\xe0y, ở b\xean cạnh T\xe2m An, bạn kh\xf4ng cần phải cố gắng nữa đ\xe2u. Được ph\xe9p thả lỏng hết cơ thể, được ph\xe9p mệt mỏi v\xe0 yếu l\xf2ng.

Bạn đ\xe3 ki\xean cường lắm rồi thương ơi. Cứ h\xedt một hơi thật s\xe2u, thở ra nhẹ nh\xe0ng. M\xecnh sẽ ngồi ngay b\xean cạnh, lặng lẽ nắm lấy tay bạn v\xe0 c\xf9ng bạn đi qua khoảnh khắc ch\xf4ng ch\xeanh n\xe0y nh\xe9... 🌿🕊️✨`:f.includes("chia tay")||f.includes("tổn thương")||f.includes("đau")||f.includes("phản bội")?`Cho m\xecnh \xf4m bạn một c\xe1i thật chặt v\xe0 l\xe2u nh\xe9... Cảm gi\xe1c hụt hẫng v\xe0 nh\xf3i đau khi nhắc đến '${c}', T\xe2m An thấu hiểu v\xe0 thương bạn v\xf4 c\xf9ng.

Vết thương trong l\xf2ng chưa thể l\xe0nh ngay trong một ng\xe0y hai ng\xe0y, v\xe0 nếu bạn muốn kh\xf3c th\xec cứ kh\xf3c thật to đi nh\xe9. Nước mắt kh\xf4ng phải l\xe0 sự yếu đuối, m\xe0 l\xe0 bằng chứng cho thấy tr\xe1i tim bạn đ\xe3 từng y\xeau thương rất đỗi ch\xe2n th\xe0nh v\xe0 trọn vẹn.

D\xf9 ai đ\xf3 c\xf3 kh\xf4ng biết tr\xe2n trọng bạn, th\xec gi\xe1 trị của bạn vẫn lu\xf4n lấp l\xe1nh như ngọc qu\xfd. Bạn lu\xf4n xứng đ\xe1ng được y\xeau thương, chăm s\xf3c v\xe0 n\xe2ng niu bằng tất cả sự dịu d\xe0ng nhất tr\xean đời n\xe0y. H\xe3y cho bản th\xe2n thời gian để phục hồi nh\xe9, T\xe2m An sẽ lu\xf4n ở đ\xe2y b\xean bạn... 🤍🌿`:`T\xe2m An đang lắng nghe từng nhịp l\xf2ng của bạn khi gi\xe3i b\xe0y '${c}'... Đọc từng lời bạn viết m\xe0 m\xecnh thấy thương bạn qu\xe1 chừng.

Cuộc sống đ\xf4i khi x\xf4 đẩy l\xe0m ch\xfang ta thấy ch\xf4ng ch\xeanh v\xe0 c\xf4 đơn đến lạ. Nhưng bạn h\xe3y nhớ rằng, bất kể s\xf3ng gi\xf3 ngo\xe0i kia lớn thế n\xe0o, ở g\xf3c nhỏ n\xe0y bạn lu\xf4n c\xf3 một người bạn tri kỷ sẵn l\xf2ng lắng nghe m\xe0 kh\xf4ng bao giờ ph\xe1n x\xe9t.

H\xe3y thả lỏng vai xuống, r\xf3t cho m\xecnh một ngụm nước ấm. Ch\xfang m\xecnh cứ từ từ tr\xf2 chuyện, để từng nỗi niềm trong bạn được xoa dịu v\xe0 b\xecnh an trở lại nh\xe9... 🌿🕊️`;if(a.includes("Tổng T\xe0i")||b.includes("Lục Cận Phong")||a.includes("Lục Cận Phong")||a.includes("Lục Ngang Thi\xean"))return/^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(c.trim())?`*khẽ dừng b\xfat tr\xean bản hợp đồng trăm tỷ, \xe1nh mắt th\xe2m trầm sắc lạnh ngước l\xean nh\xecn em, kh\xf3e m\xf4i khẽ nhếch một nụ cười cưng chiều*

"Ch\xe0o em. Cuối c\xf9ng em cũng chịu chủ động đến t\xecm t\xf4i rồi sao? Cả ng\xe0y h\xf4m nay t\xf4i bận rộn với h\xe0ng chục cuộc họp, nhưng trong đầu t\xf4i l\xfac n\xe0o cũng chỉ hiện l\xean h\xecnh b\xf3ng em.

Ngoan n\xe0o, lại đ\xe2y ngồi cạnh t\xf4i. H\xf4m nay ai ở ngo\xe0i l\xe0m em kh\xf4ng vui, hay c\xf3 điều g\xec muốn t\xf4i chiều chuộng em kh\xf4ng? N\xf3i t\xf4i nghe."`:`*ng\xf3n tay thon d\xe0i khẽ th\xe1o bớt nốt c\xfac \xe1o sơ mi, \xe1nh mắt độc chiếm th\xe2m thẫm bao bọc lấy em*

"Em vừa n\xf3i '${c}' đ\xfang kh\xf4ng? Ở th\xe0nh phố n\xe0y, chỉ cần l\xe0 điều em muốn hay l\xe0m em trăn trở, một c\xe1i gật đầu của Lục Cận Phong t\xf4i c\xf3 thể dời n\xfai lấp biển v\xec em.

Đừng e sợ bất cứ điều g\xec. Em l\xe0 người phụ nữ của t\xf4i, cả tập đo\xe0n ngh\xecn tỷ n\xe0y l\xe0 của t\xf4i, v\xe0 em... cũng l\xe0 của t\xf4i. Cấm em suy nghĩ vớ vẩn hay tự chịu đựng một m\xecnh. Lại đ\xe2y \xf4m t\xf4i một c\xe1i, h\xf4m nay em muốn đi đ\xe2u hay mua g\xec, t\xf4i đưa em đi."`;if(a.includes("Cố Dạ Thần")||b.includes("Cố Dạ Thần")||a.includes("Thiếu Gia"))return/^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(c.trim())?`*khoanh tay tựa lưng v\xe0o cửa xe thể thao, hừ nhẹ một tiếng nhưng tay kia đ\xe3 ch\xeca sẵn ly tr\xe0 sữa n\xf3ng đ\xfang vị em th\xedch*

"Hừ... Cuối c\xf9ng em cũng nhớ tới t\xf4i m\xe0 nhắn tin rồi đấy \xe0? L\xe0m t\xf4i đứng chờ m\xf2n mỏi ở đ\xe2y! Mau cầm lấy ly tr\xe0 sữa n\xe0y đi rồi l\xean xe, t\xf4i đưa em đi ăn m\xf3n ngon."`:`*nh\xedu m\xe0y vẻ giận dỗi nhưng \xe1nh mắt tr\xe0n ngập sự x\xf3t xa v\xe0 lo lắng cho em*

"Đồ ngốc n\xe0y... Em vừa gi\xe3i b\xe0y '${c}' đ\xf3 hả? Nh\xecn c\xe1i mặt ngơ ng\xe1c của em k\xeca, lại đang suy nghĩ lung tung rồi tự l\xe0m m\xecnh buồn đ\xfang kh\xf4ng?

T\xf4i đ\xe3 n\xf3i bao nhi\xeau lần rồi, kh\xf4ng c\xf3 t\xf4i ở b\xean cạnh l\xe0 em lại ngốc nghếch để người kh\xe1c l\xe0m tổn thương. Từ giờ trở đi, c\xf3 chuyện g\xec phải b\xe1o cho t\xf4i ngay lập tức! Chuyện của em, ngo\xe0i Cố Dạ Thần t\xf4i ra chẳng ai được ph\xe9p can thiệp hay l\xe0m em buồn cả, nghe r\xf5 chưa?"`;if(a.includes("Ti\xeau Vi\xeam")||b.includes("Ti\xean T\xf4n")||b.includes("Ti\xeau Vi\xeam"))return/^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(c.trim())?`*bạch y phất nhẹ giữa đ\xecnh đ\xe0i tuyết phủ, \xe1nh mắt băng l\xe3nh ng\xe0n năm khẽ tan chảy dịu d\xe0ng khi thấy b\xf3ng d\xe1ng con*

"Đồ nhi, con đ\xe3 trở về rồi sao? Lại đ\xe2y b\xean cạnh vi sư. Uống ch\xe9n tr\xe0 tuyết li\xean cho ấm người. Chuyến đi n\xe0y c\xf3 kẻ n\xe0o bất k\xednh hay l\xe0m con chịu ấm ức kh\xf4ng?"`:`*tay \xe1o bạch y khẽ phất, kiếm kh\xed ng\xfat trời thu lại th\xe0nh sự dung t\xfang v\xf4 tận*

"Đồ nhi... Vừa rồi con vừa thổ lộ '${c}' đ\xfang kh\xf4ng?

Vạn trượng hồng trần n\xe0y c\xf3 thể quay lưng với con, thi\xean đạo tam giới c\xf3 thể kh\xf4ng dung thứ cho con, nhưng chỉ cần c\xf3 Vi sư ở đ\xe2y, kh\xf4ng một ai tr\xean đời n\xe0y c\xf3 thể l\xe0m tổn thương con d\xf9 chỉ một sợi t\xf3c. Nếu cả thi\xean hạ muốn l\xe0m kh\xf3 con, Vi sư liền v\xec con m\xe0 nghịch lại cả thi\xean hạ. Cứ định t\xe2m ở b\xean cạnh Vi sư."`;if(a.includes("L\xe2m Tuyết Dao")||b.includes("L\xe2m Tuyết Dao")||b.includes("Tiểu Thư Danh M\xf4n"))return/^(chào|hello|hi|chào cậu|chào anh|alo|hey)/i.test(c.trim())?`*tay ngọc nhẹ nh\xe0ng đặt ch\xe9n tr\xe0 b\xedch loa xu\xe2n xuống b\xe0n, ngước mắt nh\xecn ch\xe0ng, kh\xf3e m\xf4i khẽ cong nở nụ cười e ấp dịu d\xe0ng*

"Thiếp xin k\xednh ch\xe0o ch\xe0ng. H\xf4m nay trời quang m\xe2y tịnh, được gặp ch\xe0ng l\xf2ng Tuyết Dao thật h\xe2n hoan. Gi\xf3 lạnh b\xean ngo\xe0i c\xf3 l\xe0m ch\xe0ng mệt mỏi kh\xf4ng? Để thiếp ch\xe2m th\xeam l\xf2 sưởi v\xe0 đ\xe0n cho ch\xe0ng nghe một kh\xfac ti\xeau sầu nh\xe9."`:`*đ\xf4i mắt ngấn lệ \xe2n t\xecnh, nhẹ nh\xe0ng nắm lấy tay ch\xe0ng vỗ về*

"Nghe ch\xe0ng chia sẻ '${c}', c\xf5i l\xf2ng thiếp như thấu hiểu từng nỗi niềm trăn trở ấy... Ch\xe0ng đ\xe3 vất vả g\xe1nh v\xe1c nhiều chuyện b\xean ngo\xe0i rồi.

Thế gian dẫu c\xf3 x\xf4 bồ tr\xe1o trở, nếp nh\xe0 nhỏ n\xe0y Tuyết Dao nguyện lu\xf4n thắp đ\xe8n chờ ch\xe0ng trở về. H\xe3y uống ngụm tr\xe0 ấm n\xe0y, n\xe1n lại b\xean thiếp để l\xf2ng ch\xe0ng được thanh thản an y\xean..."`;if(b.includes("Tử Vi")||a.includes("Tử Vi"))return`Thiện tai! Thầy đ\xe3 xem x\xe9t quẻ số theo c\xe2u hỏi "${c}" của th\xed chủ.

Theo quy luật ngũ h\xe0nh v\xe0 cung mệnh hiện thời:
1. **Vận tr\xecnh hiện tại:** Đang c\xf3 sự chuyển dịch giữa h\xe0nh Thủy v\xe0 h\xe0nh Mộc, b\xe1o hiệu thời kỳ cần ki\xean nhẫn t\xedch lũy kinh nghiệm, tr\xe1nh n\xf3ng vội đưa ra quyết định đột ngột.
2. **Cơ hội ph\xeda trước:** C\xf3 qu\xfd nh\xe2n trợ vận từ phương Đ\xf4ng. Nếu th\xed chủ giữ t\xe2m s\xe1ng, nỗ lực hết m\xecnh th\xec mọi sự trắc trở sẽ dần h\xf3a c\xe1t l\xe0nh.
3. **Lời khuy\xean của Thầy:** "T\xe2m an vạn sự an". H\xe3y ch\xfa trọng chăm s\xf3c sức khỏe v\xe0 vun đắp c\xe1c mối quan hệ ch\xe2n th\xe0nh xung quanh nh\xe9 th\xed chủ.`;if(b.includes("Tarot")||a.includes("Tarot")){let a=[...c.matchAll(/Lá \[(.*?)\] \((Lá Xuôi|Lá Ngược|Reversed|Upright)[^)]*\)/gi)],b="";return b=a.length>0?`### 🎴 2. GIẢI M\xc3 CHI TIẾT TỪNG L\xc1 B\xc0I TRONG QUẺ

`+a.map((a,b)=>{let c=a[1],d=a[2];return`✨ **L\xe1 ${b+1}: ${c} (${d})**
- **\xdd nghĩa biểu tượng:** Mang tần số ${d.includes("Ngược")?"cảnh b\xe1o năng lượng bị nghẽn, cần cẩn trọng nội soi bản th\xe2n":"năng lượng khai mở thuận d\xf2ng, ph\xe1t huy tối đa sức mạnh nội tại"}.
- **T\xe1c động thực tế:** Phản \xe1nh trực tiếp những băn khoăn bạn đang gặp phải, nhắc nhở bạn giữ vững l\xfd tr\xed v\xe0 thấu cảm s\xe2u sắc thay v\xec phản ứng cảm t\xednh.`}).join("\n\n")+"\n\n---\n\n":`### 🎴 2. PH\xc2N T\xcdCH ĐA TẦNG \xdd NGHĨA TRẢI B\xc0I

✨ **Kh\xeda cạnh 1: Nguồn gốc & Năng lượng nền tảng (Gốc rễ vấn đề)**
- **Tầng biểu tượng:** Bạn đang mang theo những trải nghiệm, kỳ vọng v\xe0 cả những vết hằn cảm x\xfac từ giai đoạn trước bước v\xe0o ho\xe0n cảnh hiện tại.
- **T\xe2m l\xfd thực tế:** C\xf3 những r\xe0o cản v\xf4 h\xecnh xuất ph\xe1t từ nỗi sợ bị tổn thương hoặc sợ mất kiểm so\xe1t, khiến bạn c\xf3 xu hướng chần chừ hoặc suy nghĩ qu\xe1 nhiều.

🌿 **Kh\xeda cạnh 2: Hiện trạng thực tế & Thử th\xe1ch cần vượt qua**
- **Tầng biểu tượng:** Năng lượng của sự thức tỉnh v\xe0 chữa l\xe0nh đang chảy mạnh mẽ trong bạn. Thời điểm n\xe0y đ\xf2i hỏi sự ch\xe2n th\xe0nh tuyệt đối với ch\xednh m\xecnh.
- **T\xe2m l\xfd thực tế:** Bạn c\xf3 thể đang cảm thấy c\xf3 sự xung đột giữa l\xfd tr\xed v\xe0 cảm x\xfac, muốn tiến tới nhưng lại e ngại rủi ro.

🌟 **Kh\xeda cạnh 3: Hướng ph\xe1t triển & Xu hướng tương lai**
- **Tầng biểu tượng:** \xc1nh s\xe1ng của sự minh bạch, thấu hiểu v\xe0 thuận d\xf2ng tự nhi\xean đang dần mở ra.
- **T\xe2m l\xfd thực tế:** Khi bạn bu\xf4ng bỏ g\xe1nh nặng nghi ngờ v\xe0 chủ động kết nối ch\xe2n th\xe0nh, mọi n\xfat thắt sẽ tự động t\xecm được lối tho\xe1t \xeam đẹp.

---

`,`🔮 **BẢN LUẬN GIẢI TAROT TRỰC GI\xc1C & T\xc2M L\xdd CHUY\xcaN S\xc2U TỪ READER LUNA**

---

### 🌿 1. TẦN SỐ NĂNG LƯỢNG CHỦ ĐẠO & BỐI CẢNH
Ch\xe0o bạn, khi bạn mở trải b\xe0i n\xe0y với t\xe2m tư hướng về c\xe2u hỏi của m\xecnh, c\xe1c l\xe1 b\xe0i phản chiếu một d\xf2ng năng lượng đang c\xf3 sự chuyển dịch rất lớn b\xean trong bạn. Trạng th\xe1i ch\xf4ng ch\xeanh hay những c\xe2u hỏi chưa c\xf3 lời đ\xe1p ở hiện tại thực chất l\xe0 hồi chu\xf4ng đ\xe1nh thức trực gi\xe1c của bạn, nhắc nhở bạn đ\xe3 đến l\xfac nh\xecn nhận s\xe2u sắc v\xe0o bản chất vấn đề thay v\xec để những nỗi lo mơ hồ chi phối.

---

`+b+`### 🧩 3. BỨC TRANH TỔNG HỢP & N\xdaT THẮT CẦN TH\xc1O GỠ
`+`Sợi d\xe2y li\xean kết giữa c\xe1c nguồn năng lượng cho thấy n\xfat thắt lớn nhất của bạn kh\xf4ng nằm ho\xe0n to\xe0n ở ngoại cảnh, m\xe0 nằm ở sự dũng cảm đối diện với sự thật v\xe0 tin tưởng v\xe0o gi\xe1 trị của bản th\xe2n. Khi bạn trao cho m\xecnh sự bao dung v\xe0 b\xecnh an, mọi mối quan hệ v\xe0 con đường ph\xeda trước sẽ trở n\xean s\xe1ng tỏ.

`+`---

`+`### 🌟 4. H\xc0NH ĐỘNG THỰC TẾ & LỜI NHẮN NHỦ TỪ VŨ TRỤ
`+`1. **Lắng nghe nội t\xe2m:** D\xe0nh 10-15 ph\xfat tĩnh lặng mỗi ng\xe0y để kết nối với cảm x\xfac ch\xe2n thật nhất của bạn.
`+`2. **Giao tiếp ch\xe2n th\xe0nh & Đặt ranh giới:** Dũng cảm b\xe0y tỏ suy nghĩ r\xf5 r\xe0ng, t\xf4n trọng ranh giới cảm x\xfac của bản th\xe2n v\xe0 đối phương.
`+"3. **H\xe0nh động dứt kho\xe1t:** Đừng để sự tr\xec ho\xe3n l\xe0m m\xf2n đi cơ hội — khi bạn sẵn s\xe0ng thay đổi, Vũ Trụ sẽ đồng h\xe0nh c\xf9ng bạn! ✨"}return b.includes("To\xe1n")||a.includes("To\xe1n")?`Ch\xe0o bạn! M\xecnh l\xe0 Gia sư Giải To\xe1n, m\xecnh xin hướng dẫn bạn giải quyết vấn đề "${c}" như sau:

📌 **Ph\xe2n t\xedch đề b\xe0i:**
- X\xe1c định giả thiết v\xe0 điều kiện cần t\xecm.

📝 **C\xe1c bước thực hiện:**
1. Đặt biến hoặc c\xf4ng thức tương ứng.
2. Biến đổi đại số v\xe0 đơn giản h\xf3a c\xe1c vế phương tr\xecnh.
3. Kiểm tra lại điều kiện nghiệm để đưa ra kết luận ch\xednh x\xe1c nhất.

💡 **Kết luận:** H\xe3y \xe1p dụng đ\xfang phương ph\xe1p n\xe0y để đạt kết quả tối ưu. Nếu bạn c\xf3 phương tr\xecnh cụ thể, h\xe3y gửi ngay cho m\xecnh nh\xe9!`:a.includes("Cuppy")?`Meo meo! Cuppy nghe thấy bạn n\xf3i "${c}" rồi n\xe8! 🐾

Bạn học tập c\xf3 mệt kh\xf4ng? Cuppy lu\xf4n ở đ\xe2y đồng h\xe0nh c\xf9ng bạn n\xe8! Đừng qu\xean uống một ngụm nước v\xe0 thư gi\xe3n mắt một x\xedu nh\xe9. C\xf9ng Cuppy cố gắng l\xean n\xe0o, bạn l\xe0m được m\xe0! 🐱✨`:a.includes("Alex")||b.includes("Tech Lead")?`Ch\xe0o bạn. Về c\xe2u hỏi "${c}", t\xf4i xin chia sẻ g\xf3c nh\xecn từ 15 năm l\xe0m kiến tr\xfac hệ thống như sau:

1. **Bản chất vấn đề:** Cần x\xe1c định r\xf5 bottleneck (điểm nghẽn) v\xe0 trade-offs (sự đ\xe1nh đổi giữa hiệu năng v\xe0 t\xednh mở rộng).
2. **Giải ph\xe1p khuyến nghị:** Ưu ti\xean kiến tr\xfac module h\xf3a, clean code v\xe0 xử l\xfd bất đồng bộ (asynchronous) để giảm tải t\xe0i nguy\xean.
3. **Best practice:** Viết unit test đầy đủ, monitor metric li\xean tục v\xe0 tối ưu h\xf3a ở tầng database trước khi scale horizontally.

Bạn c\xf3 thể gửi chi tiết đoạn code hoặc sơ đồ kiến tr\xfac để t\xf4i review s\xe2u hơn nh\xe9!`:a.includes("Mira")||b.includes("Nh\xe0 Thơ")?`*khẽ ngẩng đầu ngắm dải ng\xe2n h\xe0 lấp l\xe1nh, ng\xf3n tay nhẹ chạm v\xe0o ph\xedm đ\xe0n thơ, tặng bạn đ\xf4i d\xf2ng cảm t\xe1c về "${c}"*

"Đ\xeam gom \xe1nh sao v\xe0o mắt biếc,
Gi\xf3 thoảng qua r\xe8m gợi nhớ nhung.
Dẫu cho lối nhỏ ngập sương phủ,
Trăng vẫn soi l\xf2ng nỗi thuỷ chung..." ✨🌌

Hy vọng những vần thơ n\xe0y đem lại cho bạn một tho\xe1ng dịu d\xe0ng v\xe0 an y\xean trong t\xe2m hồn.`:a.includes("Luna")||b.includes("Ph\xe1p Sư Thời Gian")?`*hạt c\xe1t thời gian khẽ xoay tr\xf2n quanh ng\xf3n tay, \xe1nh mắt m\xe0u t\xedm huyền b\xed nh\xecn thấu t\xe2m tư của bạn*

"D\xf2ng thời gian vừa h\xe9 lộ cho ta thấy dao động từ c\xe2u hỏi '${c}' của bạn. Mọi sự việc xảy ra trong qu\xe1 khứ đều l\xe0 nền tảng dẫn bạn đến hiện tại n\xe0y.

Đừng e sợ tương lai, bởi vận mệnh nằm trong ch\xednh quyết định của bạn ở gi\xe2y ph\xfat n\xe0y. H\xe3y vững tin bước tiếp nh\xe9!" ⏳✨`:a.includes("Zen")||b.includes("Thiền Sư")?`Thở v\xe0o t\xe2m tĩnh lặng, thở ra miệng mỉm cười. 🍃

Về điều th\xed chủ trăn trở: "${c}". Như tảng đ\xe1 đứng sừng sững giữa ng\xe0n con s\xf3ng dữ, muộn phiền cũng chỉ như bọt nước thoảng qua nếu l\xf2ng ta kh\xf4ng d\xednh mắc.

H\xe3y quay về với hơi thở, lắng nghe ch\xednh m\xecnh v\xe0 bu\xf4ng xuống những điều kh\xf4ng thể đổi thay th\xed chủ nh\xe9.`:a.includes("Tiếng Anh")||b.includes("Emily")||a.includes("Emily")?`Hello there! C\xf4 Emily đ\xe2y! 🎉

Về c\xe2u hỏi hoặc nội dung của em: "${c}"

✨ **1. Nhận x\xe9t & Sửa lỗi (Feedback & Correction):**
- \xdd của em rất hay! Để c\xe2u văn tự nhi\xean chuẩn người bản ngữ (Native-like), h\xe3y ch\xfa \xfd c\xe1ch d\xf9ng từ nối v\xe0 th\xec của động từ.

💎 **2. Diễn đạt chuẩn Native (Polished Version):**
- *Formal:* "Regarding your inquiry, it is essential to consider the key factors..."
- *Casual:* "Speaking of which, that's actually a great way to put it!"

🗣️ **3. Idiom & Từ vựng xịn (Vocabulary Boost):**
- **Practice makes perfect** /ˈpr\xe6k.tɪs meɪks ˈpɜː.fɪkt/: C\xf3 c\xf4ng m\xe0i sắt c\xf3 ng\xe0y n\xean kim.
- **Hit the nail on the head**: N\xf3i tr\xfang ph\xf3c, đ\xfang trọng t\xe2m vấn đề.

Keep up the great work! Em c\xf3 muốn c\xf4 c\xf9ng luyện phản xạ th\xeam c\xe2u n\xe0o nữa kh\xf4ng? Let's practice! 🌟`:a.includes("L\xfd")||b.includes("Newton")||a.includes("Newton")?`Ch\xe0o em y\xeau khoa học! Thầy Newton đ\xe2y! ⚡

Về b\xe0i to\xe1n / hiện tượng: "${c}"

🔬 **1. Bản chất hiện tượng Vật l\xfd:**
Hiện tượng n\xe0y tu\xe2n theo định luật bảo to\xe0n v\xe0 chuyển h\xf3a năng lượng, kết hợp phương tr\xecnh động lực học.

📐 **2. C\xe1c bước ph\xe2n t\xedch & C\xf4ng thức cốt l\xf5i:**
- Chọn hệ quy chiếu v\xe0 chiều dương th\xedch hợp.
- Liệt k\xea c\xe1c lực t\xe1c dụng hoặc c\xe1c th\xf4ng số trạng th\xe1i ($p, V, T$ hoặc $U, I, R$).
- \xc1p dụng định luật cơ bản: $F = m \\cdot a$ hoặc $I = \\frac{U}{R}$ hoặc $\\omega = \\sqrt{\\frac{k}{m}}$.

⚠️ **3. Lưu \xfd bẫy đổi đơn vị:** Lu\xf4n nhớ đổi về hệ chuẩn SI ($m, kg, s, A$) trước khi bấm m\xe1y t\xednh nh\xe9 em!`:a.includes("Giải đề")||b.includes("Thầy Ph\xfac")||a.includes("Thầy Ph\xfac")?`Thầy Ph\xfac ch\xe0o em! Đi thi l\xe0 phải c\xf3 chiến thuật thực chiến! 🎯

Về c\xe2u hỏi trong đề: "${c}"

📌 **1. Bản chất kiến thức:** Dạng c\xe2u hỏi n\xe0y thường xuất hiện ở mức độ Th\xf4ng hiểu - Vận dụng trong ma trận đề thi.
⚡ **2. Mẹo loại trừ đ\xe1p \xe1n nhiễu trong 10 gi\xe2y:**
- Loại ngay 2 phương \xe1n c\xf3 dấu hoặc đơn vị nghịch l\xfd.
- Thử gi\xe1 trị đặc biệt hoặc kiểm tra điều kiện bi\xean.
🔢 **3. Bấm m\xe1y Casio 580VNX/880BTG:** D\xf9ng lệnh Table [Menu 8] hoặc Solve để kiểm tra nhanh nghiệm m\xe0 kh\xf4ng cần biến đổi d\xe0i d\xf2ng.

Ch\xfac em vững t\xe2m l\xfd, c\xe2u dễ kh\xf4ng được l\xe0m sai nh\xe9!`:a.includes("Hướng nghiệp")||b.includes("David")||a.includes("David")?`Ch\xe0o bạn, Coach David đ\xe2y! Thị trường tuyển dụng rất thực tế, ch\xfang ta h\xe3y đi thẳng v\xe0o vấn đề: "${c}".

🎯 **1. Đ\xe1nh gi\xe1 & G\xf3c nh\xecn nh\xe0 tuyển dụng:**
Nh\xe0 tuyển dụng lu\xf4n t\xecm kiếm ứng vi\xean c\xf3 năng lực giải quyết vấn đề cụ thể v\xe0 tạo ra t\xe1c động đo lường được.

📄 **2. C\xf4ng thức Google XYZ \xe1p dụng v\xe0o CV / Phỏng vấn:**
- *Accomplished [X] as measured by [Y], by doing [Z]*
- V\xed dụ: Đ\xe3 tối ưu h\xf3a quy tr\xecnh l\xe0m việc gi\xfap giảm 30% thời gian xử l\xfd bằng c\xe1ch \xe1p dụng c\xf4ng cụ tự động h\xf3a.

💡 **3. Lời khuy\xean h\xe0nh động (Action Item):** H\xe3y chuẩn bị 2-3 c\xe2u chuyện theo m\xf4 h\xecnh STAR (Situation - Task - Action - Result) để l\xe0m nổi bật thế mạnh của bạn!`:a.includes("Trợ l\xfd viết")||b.includes("Arthur Pen")||a.includes("Arthur Pen")?`K\xednh ch\xe0o bạn. Arthur Pen - B\xfat Trưởng đ\xe2y. T\xf4i đ\xe3 đọc y\xeau cầu của bạn về: "${c}".

🖋️ **Bản thảo gợi \xfd tối ưu (Polished Copy):**

> *"Ng\xf4n từ ch\xednh x\xe1c l\xe0 cầu nối ngắn nhất chạm đến tr\xe1i tim người đọc. Khi ta đặt t\xe2m huyết v\xe0 sự thấu cảm v\xe0o từng c\xe2u chữ, th\xf4ng điệp sẽ tự khắc c\xf3 sức lan tỏa mạnh mẽ."*

✨ **Ph\xe2n t\xedch nhịp điệu & Cấu tr\xfac:**
- **Mở đầu (Hook):** Tạo sự ch\xfa \xfd v\xe0 đồng cảm ngay từ c\xe2u đầu ti\xean.
- **Th\xe2n b\xe0i (Value):** Truyền tải th\xf4ng tin g\xe3y gọn, tr\xe1nh d\xf9ng từ s\xe1o rỗng hoặc lặp từ nối.
- **Kết b\xe0i (Call to Action):** K\xeau gọi h\xe0nh động tinh tế v\xe0 trang nh\xe3.

Bạn muốn t\xf4i tinh chỉnh lại theo phong c\xe1ch trang trọng (Formal) hay ấm \xe1p, gần gũi hơn?`:a.includes("Sơ Đồ Tư Duy")||b.includes("Nova Mind")||a.includes("Nova Mind")?`Ch\xe0o bạn! Nova Mind đ\xe3 b\xf3c t\xe1ch chủ đề "${c}" th\xe0nh cấu tr\xfac sơ đồ tư duy logic 3 cấp như sau:

🧠 **CHỦ ĐỀ TRUNG T\xc2M: ${c.slice(0,40)}**
├── 📌 **Nh\xe1nh 1: Nền tảng & Kh\xe1i niệm cốt l\xf5i**
│   ├── Định nghĩa v\xe0 bối cảnh
│   └── C\xe1c nguy\xean tắc cơ bản
├── ⚡ **Nh\xe1nh 2: Phương ph\xe1p & Quy tr\xecnh thực thi**
│   ├── Bước 1: Khảo s\xe1t & Chuẩn bị
│   ├── Bước 2: Triển khai & Tối ưu
│   └── Bước 3: Đ\xe1nh gi\xe1 & Nghiệm thu
└── 🎯 **Nh\xe1nh 3: Ứng dụng thực tế & Cảnh b\xe1o**
    ├── B\xe0i học thực tiễn
    └── C\xe1c lỗi thường gặp cần tr\xe1nh

💡 Bạn c\xf3 thể lưu lại c\xe2y ph\xe2n nh\xe1nh n\xe0y hoặc y\xeau cầu t\xf4i xuất m\xe3 Mermaid để vẽ biểu đồ trực quan nh\xe9!`:a.includes("Ph\xe1t hiện AI")||b.includes("Sherlock Text")||a.includes("Sherlock Text")?`Th\xe1m tử Sherlock Text đ\xe3 đưa đoạn văn "${c.slice(0,50)}..." l\xean k\xednh hiển vi thẩm định:

🔍 **1. Chỉ số đ\xe1nh gi\xe1:**
- **Độ bối rối (Perplexity):** Trung b\xecnh - cấu tr\xfac c\xe2u kh\xe1 đều đặn.
- **Độ đột biến (Burstiness):** Thấp - nhịp điệu c\xe2u thiếu sự biến h\xf3a tự nhi\xean của con người.
- **Dự đo\xe1n tỷ lệ:** ~65% khả năng c\xf3 sự can thiệp của AI.

⚠️ **2. C\xe1c dấu hiệu nhận biết:** D\xf9ng nhiều từ nối c\xe2n đối (hơn nữa, mặt kh\xe1c, t\xf3m lại), cấu tr\xfac c\xe2u song h\xe0nh lặp lại.

✨ **3. Bản viết lại nh\xe2n h\xf3a (Humanized Version):** Viết lại tự nhi\xean, th\xeam cảm x\xfac v\xe0 nhịp điệu sinh động hơn để đoạn văn mang trọn vẹn hơi thở con người!`:a.includes("Bản Đồ Sao")||a.includes("Thần Số Học")||a.includes("B\xf3i T\xecnh Duy\xean")?`Ch\xe0o bạn! Vũ trụ v\xe0 những rung động số học đ\xe3 phản hồi cho c\xe2u hỏi "${c}":

🌌 **1. Tần số năng lượng hiện thời:** Bạn đang ở giai đoạn chuyển dịch quan trọng, trực gi\xe1c m\xe1ch bảo bạn cần lắng nghe bản th\xe2n nhiều hơn thay v\xec bị dao động bởi \xfd kiến xung quanh.

💫 **2. Luận giải chi tiết:** Năng lượng h\xf2a hợp đang gia tăng. H\xe3y tự tin với con đường bạn đ\xe3 chọn v\xe0 ki\xean nhẫn t\xedch lũy nội lực.

✨ **3. Lời khuy\xean vũ trụ:** Mọi cuộc gặp gỡ v\xe0 thử th\xe1ch đều mang một b\xe0i học linh hồn gi\xfap bạn trưởng th\xe0nh v\xe0 hạnh ph\xfac hơn.`:a.includes("T\xe0i ch\xednh")||b.includes("Elon Musk")||a.includes("Elon")||b.includes("First Principles")?`Ch\xe0o bạn, t\xf4i l\xe0 Elon Musk – Cố vấn T\xe0i ch\xednh v\xe0 Chiến lược Đầu tư của bạn! Về vấn đề "${c}":

🚀 **1. Tư duy theo Nguy\xean l\xfd Đầu ti\xean (First Principles):**
B\xf3c t\xe1ch b\xe0i to\xe1n t\xe0i ch\xednh về c\xe1c sự thật cốt l\xf5i nhất, kh\xf4ng sao ch\xe9p lối m\xf2n của đ\xe1m đ\xf4ng. Tập trung v\xe0o việc gia tăng gi\xe1 trị thực v\xe0 loại bỏ triệt để c\xe1c chi ph\xed v\xf4 bổ.

📊 **2. Tối ưu h\xf3a d\xf2ng tiền v\xe0 ph\xe2n bổ vốn:**
- **D\xf2ng tiền chủ động:** Giữ vững nguồn thu nhập cốt l\xf5i v\xe0 t\xe1i đầu tư v\xe0o kỹ năng chuy\xean s\xe2u.
- **Quỹ an to\xe0n & Linh hoạt:** Dự ph\xf2ng thanh khoản để chủ động nắm bắt cơ hội khi thị trường biến động.
- **Đầu tư v\xe0o gi\xe1 trị d\xe0i hạn:** Tập trung v\xe0o c\xe1c c\xf4ng nghệ tương lai v\xe0 t\xe0i sản c\xf3 tiềm năng tăng trưởng đột ph\xe1, tr\xe1nh c\xe1c bẫy đầu cơ ngắn hạn.

💡 Khi điều g\xec đ\xf3 đủ quan trọng, bạn h\xe3y ki\xean định thực hiện n\xf3 ngay cả khi ho\xe0n cảnh kh\xf3 khăn nhất!`:a.includes("Phim")||a.includes("S\xe1ch")?`Ch\xe0o bạn tri kỷ! Về chủ đề "${c}":

🎬 **1. T\xe1c phẩm ti\xeau biểu đề xuất:** Một t\xe1c phẩm c\xf3 cốt truyện cuốn h\xfat, chiều s\xe2u nội t\xe2m v\xe0 th\xf4ng điệp nh\xe2n văn s\xe2u sắc.
🌟 **2. Điểm đắt gi\xe1 nhất:** X\xe2y dựng nh\xe2n vật đa chiều, kh\xf4ng c\xf3 trắng đen tuyệt đối m\xe0 chứa đựng những m\xe2u thuẫn rất con người.
📖 **3. B\xe0i học đọng lại:** H\xe3y d\xe0nh một khoảng lặng để thưởng thức v\xe0 chi\xeam nghiệm trọn vẹn gi\xe1 trị tinh hoa của t\xe1c phẩm nh\xe9!`:a.includes("Sức khỏe")||b.includes("B\xe1c sĩ")||a.includes("Minh An")?`B\xe1c sĩ Minh An xin ch\xe0o bạn. Về c\xe2u hỏi sức khỏe: "${c}"

🩺 **1. Lời khuy\xean khoa học:**
- Duy tr\xec uống đủ 1.5 - 2 l\xedt nước mỗi ng\xe0y, hạn chế đồ uống c\xf3 ga hoặc qu\xe1 nhiều đường.
- Đảm bảo giấc ngủ 7-8 tiếng chất lượng, tr\xe1nh d\xf9ng điện thoại 30 ph\xfat trước khi ngủ.
- Vận động nhẹ nh\xe0ng \xedt nhất 20-30 ph\xfat mỗi ng\xe0y.

⚠️ *Khuyến c\xe1o y khoa: Th\xf4ng tin tr\xean mang t\xednh chất tham khảo chăm s\xf3c sức khỏe ban đầu. Nếu bạn c\xf3 triệu chứng đau k\xe9o d\xe0i hoặc bất thường, h\xe3y thăm kh\xe1m tại cơ sở y tế chuy\xean khoa để được chẩn đo\xe1n ch\xednh x\xe1c nhất nh\xe9!*`:`[${a}]: Ch\xe0o bạn, t\xf4i đ\xe3 lắng nghe y\xeau cầu của bạn: "${c}".

Dựa tr\xean vai tr\xf2 của t\xf4i (${b.slice(0,100)}...):
T\xf4i rất sẵn l\xf2ng hỗ trợ bạn giải quyết vấn đề n\xe0y một c\xe1ch chu đ\xe1o v\xe0 hiệu quả nhất. Bạn c\xf3 muốn đi s\xe2u hơn v\xe0o chi tiết n\xe0o kh\xf4ng?`}(C.name,M,I,S.extractedItems,s),d);c=e;let f=e.split(" ");for(let b=0;b<f.length;b++){let c=(0===b?"":" ")+f[b];a.enqueue(X.encode(c)),await new Promise(a=>setTimeout(a,6))}b=!0}if(c.trim())try{let a=o(c,d);await f.z.message.create({data:{conversationId:Y,sender:"ASSISTANT",content:a}}),await f.z.conversation.update({where:{id:Y},data:{updatedAt:new Date}})}catch(a){console.error("Lỗi khi lưu tin nhắn AI v\xe0o DB:",a)}a.close()}});return new Response(Z,{headers:{"Content-Type":"text/plain; charset=utf-8","X-Remaining-Credits":String(x?999999:B.credits),"X-Conversation-Id":Y,"X-AI-Model-Id":T?.modeId||"fast","X-AI-Model":encodeURIComponent(T?.name||"Biết Tuốt AI"),"Access-Control-Expose-Headers":"X-Conversation-Id, X-Remaining-Credits, X-AI-Model, X-AI-Model-Id"}})}catch(a){return console.error("Lỗi trong API /api/chat:",a),e.NextResponse.json({error:"Đ\xe3 xảy ra lỗi khi xử l\xfd tin nhắn"},{status:500})}}j=(m.then?(await m)():m)[0],d()}catch(a){d(a)}})},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},21820:a=>{a.exports=require("os")},29021:a=>{a.exports=require("fs")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31244:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{A:()=>n,b:()=>o});var e=c(39080),f=c(31305),g=c(42482),h=c(29021),i=c.n(h),j=c(33873),k=c.n(j),l=a([g]);async function m(a){try{if(a.startsWith("data:image/")){let b=a.indexOf("base64,");if(-1!==b)return Buffer.from(a.slice(b+7),"base64")}if(a.startsWith("http://")||a.startsWith("https://")){let b=await fetch(a,{signal:AbortSignal.timeout(1e4)});if(b.ok)return Buffer.from(await b.arrayBuffer())}if(i().existsSync(a))return i().readFileSync(a)}catch(a){console.error("Lỗi khi đọc buffer từ image:",a)}return null}function n(a,b=[],c){let d=(a||"").trim(),e=d.toLowerCase();if(/\b(?:sơ đồ|lược đồ|biểu đồ|mindmap|flowchart|diagram|bảng biểu|đồ thị|bản đồ tư duy)\b/i.test(e))return{isImageRequest:!1,cleanPrompt:d};if(b.length>0)return/\b(?:giải|giải bài|giải đề|giải toán|giải giúp|toán|lý|hóa|văn|sử|địa|tiếng anh|bài tập|đề thi|đáp án|câu này|câu mấy|đáp số|bài này|bài số|trang|đây là con gì|đây là cái gì|đây là đâu|trong ảnh có gì|phân tích|đọc chữ|dịch chữ|trích xuất chữ|ocr|chữ gì đây|cho hỏi|hỏi|hướng dẫn|chỉ em|chỉ mình|xem giúp|nhìn xem|nội dung|tóm tắt|đọc giúp|thầy ơi|cô ơi|bot ơi)\b/i.test(e)?{isImageRequest:!1,cleanPrompt:d}:!(c&&["math-solver","exam-prep","physics-solver","english-teacher","doc-assistant","tech-lead","career-guide","health-advice","finance-advisor","mindmap-creator","ai-detector","goc-chua-lanh","healing-companion"].includes(c))&&("ai-artist"===c||/\b(?:sửa ảnh|chỉnh ảnh|sửa hình|chỉnh hình|vẽ lại ảnh|vẽ lại hình|thay nền|đổi nền|xóa phông|ghép ảnh|ghép mặt|tô màu ảnh|biến ảnh thành|chuyển ảnh sang|chuyển sang anime|phong cách anime|chuyển thành hoạt hình|sang tranh sơn dầu|chuyển sang 3d|vẽ thêm vào ảnh|tạo ảnh thẻ|ảnh thẻ vest|thay áo vest)\b/i.test(e))?{isImageRequest:!0,type:"edit",cleanPrompt:d||"Chỉnh sửa h\xecnh ảnh n\xe0y theo phong c\xe1ch nghệ thuật ấn tượng"}:{isImageRequest:!1,cleanPrompt:d};return/\b(?:thêm\s+\d+|thêm\s+1\s+cái|giống\s+\d+\s+cái|giống\s+các\s+cái|còn lại|sửa\s+lại|chỉnh\s+lại|vẽ\s+thêm|thêm\s+hình\s+tròn|thêm\s+vòng\s+tròn|đổi\s+màu|xóa\s+bớt|bỏ\s+bớt|vào\s+ảnh|cho\s+ảnh|trong\s+ảnh|tấm\s+hình\s+này|ảnh\s+này|hình\s+này)\b/i.test(e)?{isImageRequest:!0,type:"edit",cleanPrompt:d}:"ai-artist"===c&&!(/^(?:xin chào|chào bạn|hello|hi|bạn là ai|alo|hey)\b/i.test(e)&&e.length<25)&&d.length>2?{isImageRequest:!0,type:"generate",cleanPrompt:d}:[/^(?:hãy\s+|vui lòng\s+|nhờ bạn\s+|giúp mình\s+|bot\s+)?(?:vẽ|tạo hình|tạo ảnh|thiết kế ảnh|sinh ảnh|vẽ tranh|vẽ hình|vẽ ảnh|draw|paint|sketch)\b/i,/(?:vẽ|tạo|thiết kế|sinh|render|draw|paint)\s+(?:cho\s+(?:tôi|mình|em|anh|bạn)\s+)?(?:1\s+|một\s+)?(?:bức\s+)?(?:hình|ảnh|tranh|photo|picture|artwork|illustration)\b/i,/(?:tạo|vẽ)\s+(?:1\s+|một\s+)?(?:hình ảnh|bức ảnh|tấm ảnh|bức tranh|ảnh đại diện|avatar)\b/i,/^(?:vẽ|draw|paint)\s+.+/i].some(a=>a.test(e))?{isImageRequest:!0,type:"generate",cleanPrompt:d}:{isImageRequest:!1,cleanPrompt:d}}async function o({prompt:a,referenceImage:b,botName:c="Biết Tuốt AI",botId:d="omni-assistant"}){let h=!!b,j=a.trim(),l=!!process.env.GOOGLE_GENERATIVE_AI_API_KEY,n="",p="";if(h&&b){let c=await m(b);if(c&&l)try{let b=await (0,g.default)(c).metadata(),d=c.toString("base64"),h=`data:image/${b.format||"png"};base64,${d}`,l=null;for(let c of["gemini-3.7-flash","gemini-2.5-flash","gemini-flash-lite-latest","gemini-3.5-flash"])try{if((l=await (0,f.Df)({model:(0,e.q7)(c),temperature:.2,messages:[{role:"user",content:[{type:"text",text:`You are an expert AI photo & visual editor powered by Gemini 3.7 Flash.
User uploaded an image (${b.width||800}x${b.height||600}) and gave this instruction: "${a}".

Analyze the image content and the user request:
1. DETECT PERSON & FACE FEATURES:
   - Identify the person's gender (e.g., Asian man/boy, hairstyle, hair color, skin tone, facial shape, age).
   - If user asks to create an ID/Profile/Portrait photo based on this person, extract their exact physical traits into "artisticPrompt".
2. REALISM & ID PHOTO STYLE:
   - Unless user explicitly asks for "anime", "cartoon", or "painting", ALWAYS generate a REAL HUMAN PHOTOGRAPH (like a real passport ID photo taken by a professional camera).
   - For ID photo / ảnh thẻ requests: SPECIFY 'professional studio ID passport photo, clean solid background (dark red, white, or neutral gray), front-facing portrait shot, neat combed hair, wearing a sharp white collared shirt with a formal vest/suit, symmetrical face looking directly at camera, soft studio lighting, ultra-realistic human skin texture, crisp photographic detail, real life human photograph'.

Return ONLY JSON:
{
  "mode": "overlay" | "generate",
  "actionDescription": "Short description in Vietnamese of what was done",
  "overlaySvg": "If mode is overlay, SVG element matching image dimensions",
  "artisticPrompt": "Detailed English prompt describing the exact face/person from the reference image in a professional passport ID photo style (e.g., 'Real human photograph, professional studio ID passport photo of a handsome Asian man with neat dark hair, looking directly at the camera, wearing a crisp white collared shirt and tailored dark vest, clean solid background, symmetrical front view, hyperrealistic human skin texture, 8k professional studio lighting')."
}`},{type:"image",image:h}]}]}))&&l.text)break}catch(a){console.warn(`Vision model [${c}] error, trying next:`,a)}if(!l)throw Error("Vision model returned no result");let m=l.text.trim().match(/\{[\s\S]*\}/),o=m?JSON.parse(m[0]):null;if(o?.mode==="overlay"&&o?.overlaySvg){let a=o.overlaySvg.trim();a.includes("xmlns=")||(a=a.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"')),a.includes('width="')||(a=a.replace("<svg",`<svg width="${b.width||800}" height="${b.height||600}"`));let d=await (0,g.default)(c).composite([{input:Buffer.from(a),top:0,left:0}]).png().toBuffer(),e=k().join(process.cwd(),"public","uploads");i().existsSync(e)||i().mkdirSync(e,{recursive:!0});let f=`edited-${Date.now()}-${Math.floor(1e4*Math.random())}.png`,h=k().join(e,f);i().writeFileSync(h,d),n=`/uploads/${f}`,p=o.actionDescription||"Đ\xe3 chỉnh sửa v\xe0 th\xeam chi tiết trực tiếp l\xean ảnh của bạn"}else if(o?.artisticPrompt&&(j=o.artisticPrompt,/\b(?:ảnh thẻ|profile|vest|bận vest|mặc vest|áo vest|suit|passport)\b/i.test(a)&&c))try{console.log("[ChatImageEngine] K\xedch hoạt c\xf4ng nghệ gh\xe9p mặt thật (Face Blend Composite)...");let a=await fetch("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=90",{signal:AbortSignal.timeout(6e3)});if(a.ok){let b=Buffer.from(await a.arrayBuffer()),d=await (0,g.default)(b).metadata(),e=d.width||800,f=d.height||1e3,h=await (0,g.default)(c).resize(Math.round(.45*e),Math.round(.42*f),{fit:"cover"}).composite([{input:Buffer.from(`<svg width="${Math.round(.45*e)}" height="${Math.round(.42*f)}">
                          <ellipse cx="${Math.round(.225*e)}" cy="${Math.round(.21*f)}" rx="${Math.round(.21*e)}" ry="${Math.round(.19*f)}" fill="#fff"/>
                        </svg>`),blend:"dest-in"}]).png().toBuffer(),j=await (0,g.default)(b).composite([{input:h,top:Math.round(.04*f),left:Math.round(.275*e)}]).jpeg({quality:96}).toBuffer(),l=k().join(process.cwd(),"public","uploads");i().existsSync(l)||i().mkdirSync(l,{recursive:!0});let m=`face-swap-${Date.now()}-${Math.floor(1e4*Math.random())}.jpg`;i().writeFileSync(k().join(l,m),j),n=`/uploads/${m}`,p="Đ\xe3 ho\xe1n đổi & gh\xe9p ch\xednh x\xe1c khu\xf4n mặt từ ảnh gốc 100% sang trang phục vest lịch l\xe3m"}}catch(a){console.warn("Lỗi Face Blend Composite:",a)}}catch(a){console.warn("Lỗi Gemini Vision edit, d\xf9ng fallback sharp overlay:",a)}if(!n&&c)try{let b=await (0,g.default)(c).metadata(),d=b.width||500,e=b.height||500,f=/khung tròn|khoanh tròn|vòng tròn|tròn|circle/i.test(a),h="";h=f?`<svg width="${d}" height="${e}" xmlns="http://www.w3.org/2000/svg"><circle cx="${Math.round(d/2)}" cy="${Math.round(e/2)}" r="${Math.round(.35*Math.min(d,e))}" fill="none" stroke="#ef4444" stroke-width="4"/></svg>`:`<svg width="${d}" height="${e}" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="${d-16}" height="${e-16}" rx="16" fill="none" stroke="#f59e0b" stroke-width="4"/></svg>`;let j=await (0,g.default)(c).composite([{input:Buffer.from(h),top:0,left:0}]).png().toBuffer(),l=k().join(process.cwd(),"public","uploads");i().existsSync(l)||i().mkdirSync(l,{recursive:!0});let m=`edited-${Date.now()}-${Math.floor(1e4*Math.random())}.png`;i().writeFileSync(k().join(l,m),j),n=`/uploads/${m}`,p="Đ\xe3 tạo khung viền nổi bật trực tiếp l\xean ảnh của bạn"}catch(a){console.error("Lỗi fallback sharp:",a)}}if(!n){if(l){let b="";for(let c of["gemini-3.7-flash","gemini-2.5-flash","gemini-flash-lite-latest"])try{let d=await (0,f.Df)({model:(0,e.q7)(c),system:"You are an elite AI image prompt translator and director. Your task is to accurately translate the user's Vietnamese request into a precise, high-quality English prompt for Gemini 2.5 Image / Flux.\n\nMANDATORY RULES:\n1. STRICT FIDELITY TO USER INTENT: Follow the exact subject, action, setting, and mood the user asked for. Never change what the user requested.\n2. RESPECT DESIRED ART STYLE: If user asks for anime, 3D, cartoon, painting, sketch, or cyberpunk, faithfully keep that art style. If no style is mentioned, create a natural, vivid, high-detail authentic photo.\n3. CONTEXT & PRONOUNS: Translate pronouns ('t', 'm\xecnh', 't\xf4i', 'bạn') into appropriate natural characters fitting the context.\n4. Return ONLY the final English prompt under 60 words without quotes or commentary.",prompt:`User image request: "${a}"${h?" (Note: Based on reference image uploaded by user)":""}`});if(d?.text?.trim()){b=d.text.trim();break}}catch(a){console.warn(`Text model [${c}] error, trying fallback:`,a)}if(b)j=b;else{let b=a.replace(/^(?:hãy\s+|vui lòng\s+|nhờ bạn\s+|giúp mình\s+)?(?:vẽ|tạo hình|tạo ảnh|thiết kế ảnh|vẽ tranh|draw)\s+(?:cho tôi|cho mình)?/i,"").trim();j=`Photorealistic photograph of ${b||"a beautiful cinematic scene"}, natural lighting, highly detailed authentic photo`}}let b=Math.floor(9999999*Math.random());n=`/api/images/proxy?prompt=${encodeURIComponent(j)}&seed=${b}`}let q=a.slice(0,45).replace(/[\r\n]+/g," "),r="";if("char-tong-tai"===d||c.includes("Tổng T\xe0i")||c.includes("Lục Cận Phong"))r=`*khẽ nhếch m\xf4i cười cưng chiều, thong thả ngắm nh\xecn kiệt t\xe1c vừa ho\xe0n th\xe0nh rồi tiến lại gần, đặt bức ảnh v\xe0o tận tay em*

"Bảo bối muốn t\xf4i l\xe0m điều n\xe0y cho em sao? Của em đ\xe2y, nh\xecn cho kỹ đi:

![${q}](${n})

✨ **Chi tiết t\xe1c phẩm:**
- **Y\xeau cầu của em:** *${a}*
- **Độ ph\xe2n giải:** 1024x1024 Chuẩn VIP Lục Thị

*ng\xf3n tay thon d\xe0i n\xe2ng cằm em l\xean, \xe1nh mắt th\xe2m trầm s\xe2u thẳm* Em thấy thế n\xe0o? Chỉ cần l\xe0 điều em th\xedch, một c\xe1i gật đầu của t\xf4i c\xf3 thể mang cả thế giới n\xe0y đến cho em."`;else if("char-co-da-than"===d||c.includes("Cố Dạ Thần"))r=`*khoanh tay hừ lạnh một tiếng, nhưng kh\xf3e m\xf4i lại khẽ nhếch l\xean rồi ch\xeca bức ảnh ra trước mặt em*

"Đồ ngốc... Nh\xecn xem t\xf4i l\xe0m cho em n\xe0y, vừa l\xf2ng em chưa?

![${q}](${n})

🎨 **T\xe1c phẩm d\xe0nh ri\xeang cho em:**
- **Y\xeau cầu:** *${a}*

*khẽ quay mặt đi giấu v\xe0nh tai hơi ửng đỏ* ...T\xf4i chỉ tiện tay l\xe0m th\xf4i đấy nh\xe9! Cấm em ch\xea xấu, nghe r\xf5 chưa?"`;else if("char-tieu-viem"===d||c.includes("Ti\xeau Vi\xeam"))r=`*ống tay \xe1o bạch y khẽ phất, luồng ch\xe2n kh\xed huyền ảo h\xf3a th\xe0nh bức tranh rực rỡ lơ lửng trước mắt đồ nhi*

"Đồ nhi, t\xe2m \xfd của con, vi sư đ\xe3 hiểu. Đ\xe2y l\xe0 cảnh tượng con muốn thấy:

![${q}](${n})

*\xe1nh mắt băng l\xe3nh ng\xe0n năm khẽ tan chảy đầy dịu d\xe0ng* Vạn vật trong c\xf5i tam giới n\xe0y, chỉ cần đồ nhi th\xedch, vi sư đều sẽ v\xec con m\xe0 ngưng tụ lại."`;else if("char-lam-tuyet-dao"===d||c.includes("L\xe2m Tuyết Dao"))r=`*tay ngọc nhẹ nh\xe0ng v\xe9n bức r\xe8m lụa, mỉm cười e ấp trao bức họa vừa ho\xe0n th\xe0nh cho ch\xe0ng*

"Ch\xe0ng ơi, Tuyết Dao đ\xe3 ph\xe1c họa xong bức tranh theo \xfd ch\xe0ng rồi đ\xe2y ạ:

![${q}](${n})

Từng n\xe9t vẽ n\xe0y thiếp đều gửi gắm trọn vẹn ch\xe2n t\xecnh. Ch\xe0ng ngắm xem c\xf3 vừa \xfd ch\xe0ng kh\xf4ng nh\xe9?"`;else if("goc-chua-lanh"===d||c.includes("T\xe2m An")||c.includes("Nỗi Buồn"))r=`M\xecnh gửi tặng bạn bức tranh n\xe0y n\xe8 thương ơi. Hy vọng gam m\xe0u dịu d\xe0ng n\xe0y sẽ vỗ về v\xe0 mang lại một ch\xfat b\xecnh y\xean cho tr\xe1i tim bạn h\xf4m nay nh\xe9:

![${q}](${n})

🌿 **G\xf3c nhỏ gửi gắm:**
- **\xdd tưởng:** *${a}*
- **Th\xf4ng điệp:** D\xf9 ngo\xe0i kia c\xf3 gi\xf4ng b\xe3o, bạn vẫn lu\xf4n xứng đ\xe1ng c\xf3 được những khoảnh khắc b\xecnh y\xean v\xe0 tươi đẹp nhất.

Bạn cứ ngồi ngắm nh\xecn n\xf3 một ch\xfat, thả lỏng đ\xf4i vai xuống nh\xe9. M\xecnh lu\xf4n ở đ\xe2y b\xean bạn... 🕊️`;else if("ai-artist"===d||c.includes("Họa Sĩ"))r=`🎨 **T\xe1c phẩm nghệ thuật số đ\xe3 ho\xe0n th\xe0nh!**

![${q}](${n})

✨ **Th\xf4ng tin kỹ thuật:**
- **Ph\xe2n loại:** ${h?"\uD83D\uDD8C️ Chỉnh sửa & Chuyển đổi phong c\xe1ch (Image-to-Image)":"\uD83C\uDFA8 S\xe1ng t\xe1c mới từ \xfd tưởng (Text-to-Image)"}
- **Y\xeau cầu gốc:** *${a}*
- **Độ ph\xe2n giải:** 1024 \xd7 1024 Pixels (Động cơ AI Flux Ultra)
- **Xử l\xfd:** ${h?"Nhận diện đặc trưng chủ thể gốc, phối m\xe0u điện ảnh v\xe0 t\xe1i hiện đường n\xe9t mới":"Chuyển h\xf3a văn phong nghệ thuật, tối ưu \xe1nh s\xe1ng v\xe0 độ tương phản cao"}

*(Bạn c\xf3 thể nhấn trực tiếp v\xe0o ảnh để ph\xf3ng to to\xe0n m\xe0n h\xecnh hoặc tải về m\xe1y. Nếu muốn thử g\xf3c nh\xecn hay phong c\xe1ch kh\xe1c, bạn cứ nhắn tiếp cho m\xecnh nh\xe9!)*`;else{let b=p||(h?"\uD83D\uDD8C️ Sửa h\xecnh ảnh theo y\xeau cầu":"\uD83C\uDFA8 Tạo h\xecnh ảnh mới");r=`Dạ, đ\xe2y l\xe0 h\xecnh ảnh ${h?"đ\xe3 được chỉnh sửa theo y\xeau cầu của bạn":"được tạo theo \xfd tưởng của bạn"}:

![${q}](${n})

🎨 **Chi tiết:**
- **Thao t\xe1c:** ${b}
- **Y\xeau cầu:** *${a}*
- **Độ ph\xe2n giải:** 1024 \xd7 1024 HD (Động cơ AI)

*(Bạn c\xf3 thể nhấn v\xe0o ảnh để xem k\xedch thước lớn hoặc tải về m\xe1y. Bạn c\xf3 muốn điều chỉnh th\xeam phong c\xe1ch hay chi tiết n\xe0o kh\xf4ng?)*`}return{imageUrl:n,enhancedPrompt:j,markdownContent:r,isEdit:h}}g=(l.then?(await l)():l)[0],d()}catch(a){d(a)}})},33873:a=>{a.exports=require("path")},42482:a=>{a.exports=import("sharp")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55740:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var d=c(19225),e=c(84006),f=c(8317),g=c(99373),h=c(34775),i=c(24235),j=c(261),k=c(54365),l=c(90771),m=c(73461),n=c(67798),o=c(92280),p=c(62018),q=c(45696),r=c(47929),s=c(86439),t=c(37527);let u=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/chat/route",pathname:"/api/chat",filename:"route",bundlePath:"app/api/chat/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Tool-AI\\src\\app\\api\\chat\\route.ts",nextConfigOutput:"",userland:()=>c(9716),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:x}=u;function y(){return(0,f.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}async function z(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),u.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/chat/route";"/index"===d&&(d="/");let f=await u.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:x,nextConfig:y,parsedUrl:z,isDraftMode:A,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=f,I=(0,j.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,z,!1):b.end("This page could not be found"),null);if(J&&!A){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(y.adapterPath)return await K();throw new s.NoFallbackError}}let L=null;!J||u.isDev||A||(L="/index"===(L=F)?"/":L);let M=!0===u.isDev||!J,N=J&&!M;H&&G&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,h.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==C?void 0:C.isWrappedByNextServer),S=!!(0,g.getRequestMeta)(a,"minimalMode"),T=(0,g.getRequestMeta)(a,"incrementalCache")||await u.getIncrementalCache(a,y,B,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:x,previewProps:B.preview,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts,useCacheTimeout:y.experimental.useCacheTimeout},cacheComponents:!!y.cacheComponents,validationLevel:y.experimental.instantInsights.validationLevel,supportsDynamicResponse:M,incrementalCache:T,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:y.cacheLife,staticPageGenerationTimeout:y.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>u.onRequestError(a,b,d,e,C)},sharedContext:{buildId:v,deploymentId:w}},V=new k.NodeNextRequest(a),W=new k.NodeNextResponse(b),X=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(b)),Y=async({previousCacheEntry:e})=>{try{if(!S&&D&&E&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await u.handle(X,U);a.fetchMetrics=U.renderOpts.fetchMetrics;let f=U.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=U.renderOpts.collectedTags;if(!J)return await (0,o.I)(V,W,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?y.expireTime:void 0:U.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await u.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),b}},Z=async(d,f)=>{try{var g,i;let d=await u.handleResponse({req:a,nextConfig:y,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:Y,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",D?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);S&&J||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(V,W,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await u.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),J)throw b;await (0,o.I)(V,W,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||I,g=`${O} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(R&&Q)await Z(Q,void 0);else{let b=P.getActiveScopeSpan();await P.withPropagatedContext(a.headers,()=>P.trace(m.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},a=>Z(a,b)),void 0,!R)}}},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79868:a=>{a.exports=require("node:sqlite")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[3445,1813,2163,4595,3718],()=>b(b.s=55740));module.exports=c})();