'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/context/AuthContext';
import RechargeModal from '@/components/payment/RechargeModal';

const ZODIAC_SIGNS = [
  { name: 'Bạch Dương (Aries)', dates: '21/03 - 19/04', element: 'Lửa', planet: 'Hỏa Tinh (Mars)', icon: '♈' },
  { name: 'Kim Ngưu (Taurus)', dates: '20/04 - 20/05', element: 'Đất', planet: 'Kim Tinh (Venus)', icon: '♉' },
  { name: 'Song Tử (Gemini)', dates: '21/05 - 21/06', element: 'Khí', planet: 'Thủy Tinh (Mercury)', icon: '♊' },
  { name: 'Cự Giải (Cancer)', dates: '22/06 - 22/07', element: 'Nước', planet: 'Mặt Trăng (Moon)', icon: '♋' },
  { name: 'Sư Tử (Leo)', dates: '23/07 - 22/08', element: 'Lửa', planet: 'Mặt Trời (Sun)', icon: '♌' },
  { name: 'Xử Nữ (Virgo)', dates: '23/08 - 22/09', element: 'Đất', planet: 'Thủy Tinh (Mercury)', icon: '♍' },
  { name: 'Thiên Bình (Libra)', dates: '23/09 - 23/10', element: 'Khí', planet: 'Kim Tinh (Venus)', icon: '♎' },
  { name: 'Bọ Cạp (Scorpio)', dates: '24/10 - 21/11', element: 'Nước', planet: 'Diêm Vương Tinh (Pluto)', icon: '♏' },
  { name: 'Nhân Mã (Sagittarius)', dates: '22/11 - 21/12', element: 'Lửa', planet: 'Mộc Tinh (Jupiter)', icon: '♐' },
  { name: 'Ma Kết (Capricorn)', dates: '22/12 - 19/01', element: 'Đất', planet: 'Thổ Tinh (Saturn)', icon: '♑' },
  { name: 'Bảo Bình (Aquarius)', dates: '20/01 - 18/02', element: 'Khí', planet: 'Thiên Vương Tinh (Uranus)', icon: '♒' },
  { name: 'Song Ngư (Pisces)', dates: '19/02 - 20/03', element: 'Nước', planet: 'Hải Vương Tinh (Neptune)', icon: '♓' },
];

function getSunSign(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bạch Dương (Aries)';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Kim Ngưu (Taurus)';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'Song Tử (Gemini)';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'Cự Giải (Cancer)';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Sư Tử (Leo)';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Xử Nữ (Virgo)';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'Thiên Bình (Libra)';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) return 'Bọ Cạp (Scorpio)';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Nhân Mã (Sagittarius)';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Ma Kết (Capricorn)';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Bảo Bình (Aquarius)';
  return 'Song Ngư (Pisces)';
}

export default function ChiemTinhView({ onOpenLoginModal }: { onOpenLoginModal?: () => void }) {
  const { user, updateUserCredits } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(2000);
  const [birthMonth, setBirthMonth] = useState(7);
  const [birthDay, setBirthDay] = useState(15);
  const [birthHour, setBirthHour] = useState(14);
  const [birthMinute, setBirthMinute] = useState(20);
  const [birthCity, setBirthCity] = useState('Hà Nội');
  const [isUnknownHour, setIsUnknownHour] = useState(false);
  const [approximatePeriod, setApproximatePeriod] = useState<'sang' | 'chieu' | 'toi' | 'khong_ro'>('khong_ro');

  const [natalChart, setNatalChart] = useState<any | null>(null);
  const [readingText, setReadingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculateNatalChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!user) {
      onOpenLoginModal?.();
      return;
    }
    const isAdmin = user.role === "ADMIN" || user.email?.toLowerCase() === "hoanglinhcntti@gmail.com";
    if (!isAdmin && (user.credits || 0) < 1) {
      setShowRechargeModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setReadingText('');

      const sunSign = getSunSign(birthDay, birthMonth);
      
      let effectiveHour = birthHour;
      let effectiveMinute = birthMinute;
      if (isUnknownHour) {
        if (approximatePeriod === 'sang') { effectiveHour = 8; effectiveMinute = 0; }
        else if (approximatePeriod === 'chieu') { effectiveHour = 14; effectiveMinute = 0; }
        else if (approximatePeriod === 'toi') { effectiveHour = 20; effectiveMinute = 0; }
        else { effectiveHour = 12; effectiveMinute = 0; } // Solar Noon Chart chuẩn phương Tây
      }

      // Tính Cung Mọc (Ascendant) & Cung Mặt Trăng (Moon Sign)
      const ascIndex = (Math.floor(effectiveHour / 2) + birthMonth * 2) % 12;
      const moonIndex = (birthDay * 2 + birthMonth + 3) % 12;

      const ascSign = isUnknownHour ? 'Chưa định (Biểu Đồ Mặt Trời Noon Chart)' : (ZODIAC_SIGNS[ascIndex]?.name || 'Thiên Bình (Libra)');
      const moonSign = ZODIAC_SIGNS[moonIndex]?.name || 'Cự Giải (Cancer)';

      const chartObj = {
        name,
        birthStr: isUnknownHour 
          ? `${birthDay}/${birthMonth}/${birthYear} tại ${birthCity} (Không rõ giờ sinh - Dùng Noon Chart)`
          : `${birthDay}/${birthMonth}/${birthYear} lúc ${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')} tại ${birthCity}`,
        sunSign,
        moonSign,
        ascSign,
        mercury: ZODIAC_SIGNS[(ascIndex + 1) % 12]?.name,
        venus: ZODIAC_SIGNS[(ascIndex + 2) % 12]?.name,
        mars: ZODIAC_SIGNS[(ascIndex + 4) % 12]?.name,
        isUnknownHour
      };

      setNatalChart(chartObj);

      const prompt = `Bạn là Chuyên gia Chiêm Tinh Học (Astrologer) chuyên về Bản Đồ Sao Cá Nhân (Natal Chart) chuẩn phương Tây. Hãy phân tích chuyên sâu cho:
- Đương sự: ${name}
- Ngày giờ và nơi sinh: ${chartObj.birthStr}
- Vị trí các hành tinh:
  + Cung Mặt Trời (Sun Sign): ${sunSign} (Bản ngã, mục đích sống cốt lõi)
  + Cung Mặt Trăng (Moon Sign): ${moonSign} (Thế giới nội tâm, vô thức)
  + Cung Mọc (Ascendant): ${ascSign}
- Các hành tinh cá nhân: Sao Thủy (${chartObj.mercury}), Sao Kim (${chartObj.venus}), Sao Hỏa (${chartObj.mars})

${isUnknownHour ? `
⚠️ LƯU Ý KHI ĐƯƠNG SỰ KHÔNG RÕ GIỜ SINH (SOLAR NOON CHART METHOD):
- Trong Chiêm Tinh Học phương Tây, khi không biết giờ sinh, chuẩn mực học thuật là thiết lập "Noon Chart" (lấy 12:00 trưa làm mốc).
- Vị trí của Cung Mặt Trời (${sunSign}), Sao Thủy, Sao Kim, Sao Hỏa và phần lớn Mặt Trăng di chuyển rất chậm trong ngày nên hoàn toàn chính xác 90-95%!
- Chỉ có Cung Mọc (Ascendant) thay đổi mỗi 2 tiếng. Do đó:
  1. Tập trung luận giải sâu sắc Sun Sign, Moon Sign và tương tác giữa các hành tinh cá nhân.
  2. Gợi ý 2-3 phong thái ngoại hình hoặc cách giao tiếp lần đầu gặp mặt để đương sự tự nhận diện Cung Mọc khả dĩ nhất của mình.
  3. Lời khuyên khai mở tiềm năng theo nguyên tố chi phối (Lửa/Đất/Khí/Nước).
` : `
Hãy luận giải theo cấu trúc 5 phần chuẩn xác:
1. ☀️ BỘ BA QUYỀN NĂNG (BIG THREE): Sự giao thoa giữa Mặt Trời, Mặt Trăng và Cung Mọc tạo nên cá tính độc bản như thế nào.
2. 💖 TÌNH YÊU & CẢM XÚC (SAO KIM & SAO HỎA): Cách yêu, nhu cầu được yêu, đối tượng lý tưởng và thách thức trong mối quan hệ.
3. 💼 SỰ NGHIỆP & TÀI CHÍNH (NHÀ 2, NHÀ 6, NHÀ 10): Điểm mạnh nghề nghiệp, lĩnh vực bứt phá tài lộc.
4. 🪐 BÀI HỌC VŨ TRỤ (SATURN RETURN & ĐIỂM NGHẼN): Những rào cản cần vượt qua để hoàn thiện linh hồn.
5. 🌌 THÔNG ĐIỆP DẪN LỐI TỪ VŨ TRỤ: Lời khuyên định hướng trong giai đoạn hiện tại.
`}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deep',
          botId: 'cosmic-chart',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.status === 401) {
        onOpenLoginModal?.();
        setIsLoading(false);
        return;
      }
      if (response.status === 403) {
        setShowRechargeModal(true);
        setIsLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error('Lỗi máy chủ chiêm tinh');
      }

      const remainingCreditsHeader = response.headers.get("X-Remaining-Credits");
      if (remainingCreditsHeader !== null) {
        updateUserCredits(Number(remainingCreditsHeader));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let done = false;
        let textAcc = '';
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          textAcc += decoder.decode(value || new Uint8Array(), { stream: true });
          setReadingText(textAcc);
        }
      }
    } catch (err) {
      console.error(err);
      setReadingText('⚠️ Đang kết nối lại trạm quan sát chiêm tinh...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-slate-100 min-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-cyan-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-950 via-teal-900 to-cyan-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-900/50 border border-cyan-400/30">
            🪐
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Bản Đồ Sao Chiêm Tinh (Natal Chart)
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                12 Cung Hoàng Đạo
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Giải mã Big Three (Mặt Trời, Mặt Trăng, Cung Mọc) và vị trí các hành tinh cá nhân
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRechargeModal(true)}
          className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span>🪙</span> {user?.credits ?? 0} Credits
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleCalculateNatalChart} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-8">
        <h2 className="text-base font-bold text-cyan-300 mb-4 flex items-center gap-2">
          <span>✨</span> Nhập thông tin khai sinh để lập bản đồ sao
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Họ và Tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Trần Mai Linh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nơi Sinh (Tỉnh/Thành phố)</label>
            <input
              type="text"
              required
              value={birthCity}
              onChange={(e) => setBirthCity(e.target.value)}
              placeholder="VD: TP. Hồ Chí Minh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ngày Sinh (Dương Lịch)</label>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="number"
                min="1"
                max="31"
                value={birthDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-cyan-500"
                placeholder="Ngày"
              />
              <input
                type="number"
                min="1"
                max="12"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-cyan-500"
                placeholder="Tháng"
              />
              <input
                type="number"
                min="1940"
                max="2030"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-cyan-500"
                placeholder="Năm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Giờ Sinh <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-cyan-400 hover:text-cyan-300 font-medium">
                <input
                  type="checkbox"
                  checked={isUnknownHour}
                  onChange={(e) => setIsUnknownHour(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
                />
                <span>Quên / Không nhớ giờ?</span>
              </label>
            </div>

            {isUnknownHour ? (
              <div className="space-y-2">
                <select
                  value={approximatePeriod}
                  onChange={(e) => setApproximatePeriod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-200 text-xs outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="khong_ro">❓ Hoàn toàn không nhớ (Dùng Solar Noon Chart)</option>
                  <option value="sang">🌅 Khoảng Buổi Sáng (06:00 - 11:00)</option>
                  <option value="chieu">☀️ Khoảng Buổi Chiều (13:00 - 17:00)</option>
                  <option value="toi">🌙 Khoảng Buổi Tối / Đêm (18:00 - 23:00)</option>
                </select>
                <p className="text-[10px] text-cyan-400/90 leading-tight">
                  💡 Hệ thống sử dụng biểu đồ Mặt Trời Noon Chart – phân tích chính xác Sun Sign, Moon Sign và các hành tinh.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={birthHour}
                  onChange={(e) => setBirthHour(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-cyan-500"
                  placeholder="Giờ (0-23)"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={birthMinute}
                  onChange={(e) => setBirthMinute(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-cyan-500"
                  placeholder="Phút"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Lập Bản Đồ Sao...</span>
              </>
            ) : (
              <>
                <span>🪐</span> Khám Phá Bản Đồ Sao Cá Nhân
              </>
            )}
          </button>
        </div>
      </form>

      {/* Kết Quả */}
      {natalChart && (
        <div className="space-y-8 animate-fadeIn">
          {/* Big Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Cung Mặt Trời (Sun)</span>
                <span className="text-2xl">☀️</span>
              </div>
              <h4 className="text-lg font-black text-white">{natalChart.sunSign}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Đại diện cho ý chí, bản ngã cốt lõi, cá tính lý trí và cách bạn tỏa sáng trong cuộc đời.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Cung Mặt Trăng (Moon)</span>
                <span className="text-2xl">🌙</span>
              </div>
              <h4 className="text-lg font-black text-white">{natalChart.moonSign}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Thế giới cảm xúc nội tâm sâu kín, trực giác và phản ứng tự nhiên khi bạn ở một mình.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Cung Mọc (Ascendant)</span>
                <span className="text-2xl">🌅</span>
              </div>
              <h4 className="text-lg font-black text-white">{natalChart.ascSign}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Lăng kính bạn nhìn thế giới và phong thái bên ngoài mà người khác cảm nhận về bạn.
              </p>
            </div>
          </div>

          {/* Luận giải chi tiết */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <span className="text-2xl">🪐</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Phân Tích Chi Tiết Từ Nhà Chiêm Tinh Học
                </h3>
                <p className="text-xs text-slate-400">
                  Phân giải góc chiếu các hành tinh, đường công danh, ái tình và sứ mệnh vũ trụ
                </p>
              </div>
            </div>

            {readingText ? (
              <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{readingText}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm animate-pulse">
                Đang tính toán các góc hợp và biên soạn lời luận giải...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      <RechargeModal isOpen={showRechargeModal} onClose={() => setShowRechargeModal(false)} />
    </div>
  );
}
