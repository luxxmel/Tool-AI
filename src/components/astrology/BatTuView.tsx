'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Solar } from 'lunar-javascript';
import { translateGanZhi, MENH_NGU_HANH } from '@/data/astrologyData';
import { useAuth } from '@/context/AuthContext';
import RechargeModal from '@/components/payment/RechargeModal';

export default function BatTuView({ onOpenLoginModal }: { onOpenLoginModal?: () => void }) {
  const { user, updateUserCredits } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [birthYear, setBirthYear] = useState(1996);
  const [birthMonth, setBirthMonth] = useState(8);
  const [birthDay, setBirthDay] = useState(20);
  const [birthHour, setBirthHour] = useState(11);
  const [birthMinute, setBirthMinute] = useState(15);
  const [isUnknownHour, setIsUnknownHour] = useState(false);
  const [approximatePeriod, setApproximatePeriod] = useState<'sang' | 'chieu' | 'toi' | 'khong_ro'>('khong_ro');

  const [pillars, setPillars] = useState<any | null>(null);
  const [readingText, setReadingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculateBatTu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

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

      let effectiveHour = birthHour;
      let effectiveMinute = birthMinute;
      if (isUnknownHour) {
        if (approximatePeriod === 'sang') { effectiveHour = 8; effectiveMinute = 0; }
        else if (approximatePeriod === 'chieu') { effectiveHour = 14; effectiveMinute = 0; }
        else if (approximatePeriod === 'toi') { effectiveHour = 20; effectiveMinute = 0; }
        else { effectiveHour = 12; effectiveMinute = 0; }
      }

      const solar = Solar.fromYmdHms(birthYear, birthMonth, birthDay, effectiveHour, effectiveMinute, 0);
      const lunar = solar.getLunar();

      const yearPillar = translateGanZhi(lunar.getYearInGanZhi());
      const monthPillar = translateGanZhi(lunar.getMonthInGanZhi());
      const dayPillar = translateGanZhi(lunar.getDayInGanZhi());
      const hourPillar = isUnknownHour ? 'Khuyết Trụ Giờ (Tham chiếu giờ Ngọ)' : translateGanZhi(lunar.getTimeInGanZhi());
      const dayMaster = dayPillar.split(' ')[0]; // Nhật Chủ (Thiên Can Ngày)
      const napAm = MENH_NGU_HANH[yearPillar] || 'Sa Trung Kim';

      const data = {
        fullName,
        gender: gender === 'nam' ? 'Nam mạng' : 'Nữ mạng',
        solarDate: isUnknownHour 
          ? `${birthDay}/${birthMonth}/${birthYear} (Không rõ giờ sinh)`
          : `${birthDay}/${birthMonth}/${birthYear} ${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')}`,
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar,
        dayMaster,
        napAm,
        isUnknownHour
      };

      setPillars(data);

      const prompt = `Bạn là Đại Sư Bát Tự Tứ Trụ (Bazi Master) bậc thầy trường phái Tử Bình Cổ Học. Hãy lập và phân tích chuyên sâu lá số Bát Tự cho đương số:
- Họ tên: ${fullName} (${gender === 'nam' ? 'Nam' : 'Nữ'})
- Sinh dương lịch: ${data.solarDate}
- Tứ Trụ:
  + Trụ Năm: ${yearPillar} (Tổ tiên, gốc rễ phúc ấm thuở nhỏ)
  + Trụ Tháng: ${monthPillar} (Cha mẹ, môi trường lớn lên, Nguyệt Lệnh)
  + Trụ Ngày: ${dayPillar} [NHẬT CHỦ: ${dayMaster} - Bản thể cốt lõi, tâm tính và năng lực nội tại]
  + Trụ Giờ: ${hourPillar}
- Nạp Âm Bản Mệnh: ${napAm}

${isUnknownHour ? `
⚠️ LƯU Ý KHI ĐƯƠNG SỐ KHÔNG RÕ GIỜ SINH:
- Trong thuật Bát Tự Tử Bình, TRỤ NGÀY (Nhật Chủ ${dayMaster}) và TRỤ THÁNG (Nguyệt Lệnh ${monthPillar}) chiếm tới 75-80% quyết định độ Vượng/Suy, Tính Cách và Dụng Thần tổng thể của đời người. Trụ Giờ chủ yếu bổ sung chi tiết về con cái và những năm tháng cuối đời (sau 60 tuổi).
- Bạn hãy tập trung phân tích chuẩn xác theo "TAM TRỤ BÁT TỰ" (Năm, Tháng, Ngày):
  1. Phân tích cốt lõi Nhật Chủ ${dayMaster} sinh vào tháng ${monthPillar} (Đắc lệnh hay Thất lệnh, thể chất, tài năng).
  2. Xác định Dụng Thần & Hỷ Thần dựa trên tương quan Tam Trụ.
  3. Đưa ra dấu hiệu nhận biết để người dùng tự xác định giờ sinh khả dĩ nhất (ví dụ: nếu có con cái sớm/muộn, tính cách hướng nội hay hướng ngoại khi về già).
  4. Lời khuyên phát triển sự nghiệp, chọn đối tác và cải vận theo Dụng Thần.
` : `
Hãy luận giải chi tiết theo 5 trụ cột:
1. ☯️ PHÂN TÍCH NHẬT CHỦ & ĐỘ CƯỜNG NHƯỢC: Nhật Chủ ${dayMaster} sinh vào tháng nào, vượng hay suy, có đắc lệnh đắc địa hay không.
2. 🌊 XÁC ĐỊNH DỤNG THẦN & HỶ THẦN: Ngũ hành nào là chìa khóa then chốt giải cứu mệnh cục, ngũ hành nào là Kỵ Thần cần tránh.
3. 💼 THẬP THẦN (TÀI - QUAN - ẤN - THỰC - THƯƠNG): Tiềm năng tài chính, sự nghiệp quan trường, con đường kinh doanh hay làm chuyên môn.
4. 🏡 CUNG PHU THÊ & HÔN NHÂN: Đánh giá Địa Chi trụ ngày, tương hợp tương xung và thời điểm lập gia đình thuận lợi.
5. 🛡️ PHƯƠNG PHÁP CẢI VẬN THEO DỤNG THẦN: Lựa chọn ngành nghề hợp mệnh, màu sắc y phục, phương hướng phong thủy và đối tác làm ăn.
`}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deep',
          botId: 'tu-vi-master',
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
        throw new Error('Lỗi tính toán Bát Tự');
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
      setReadingText('⚠️ Đang kết nối lại thư viện cổ học Bát Tự...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-slate-100 min-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-950 via-yellow-900 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/50 border border-amber-400/30">
            📜
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Bát Tự Tứ Trụ (Bazi)
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tử Bình Chính Phái
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tính toán 4 trụ Năm - Tháng - Ngày - Giờ, xác định Nhật Chủ và Dụng Thần cải vận
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
      <form onSubmit={handleCalculateBatTu} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-8">
        <h2 className="text-base font-bold text-amber-300 mb-4 flex items-center gap-2">
          <span>🏛️</span> Nhập thông tin sinh thần bát tự
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Họ và Tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Hoàng Gia Bảo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Giới Tính</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('nam')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gender === 'nam'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                ♂️ Nam Mạng
              </button>
              <button
                type="button"
                onClick={() => setGender('nu')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  gender === 'nu'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                }`}
              >
                ♀️ Nữ Mạng
              </button>
            </div>
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
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-amber-500"
                placeholder="Ngày"
              />
              <input
                type="number"
                min="1"
                max="12"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-amber-500"
                placeholder="Tháng"
              />
              <input
                type="number"
                min="1940"
                max="2030"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-amber-500"
                placeholder="Năm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Giờ Sinh <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-amber-400 hover:text-amber-300 font-medium">
                <input
                  type="checkbox"
                  checked={isUnknownHour}
                  onChange={(e) => setIsUnknownHour(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                />
                <span>Quên / Không nhớ giờ?</span>
              </label>
            </div>

            {isUnknownHour ? (
              <div className="space-y-2">
                <select
                  value={approximatePeriod}
                  onChange={(e) => setApproximatePeriod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-200 text-xs outline-none focus:border-amber-400 font-medium"
                >
                  <option value="khong_ro">❓ Hoàn toàn không nhớ (Luận theo Tam Trụ)</option>
                  <option value="sang">🌅 Khoảng Buổi Sáng (06:00 - 11:00)</option>
                  <option value="chieu">☀️ Khoảng Buổi Chiều (13:00 - 17:00)</option>
                  <option value="toi">🌙 Khoảng Buổi Tối / Đêm (18:00 - 23:00)</option>
                </select>
                <p className="text-[10px] text-amber-400/90 leading-tight">
                  💡 Hệ thống sẽ luận giải chuyên sâu theo Tam Trụ (Năm-Tháng-Ngày) chiếm 80% định hướng vận mệnh.
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
                  className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-amber-500"
                  placeholder="Giờ"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={birthMinute}
                  onChange={(e) => setBirthMinute(Number(e.target.value))}
                  className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-amber-500"
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
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-sm shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Lập Bát Tự...</span>
              </>
            ) : (
              <>
                <span>📜</span> Lập Bảng Tứ Trụ & Dụng Thần
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {pillars && (
        <div className="space-y-8 animate-fadeIn">
          {/* Tứ Trụ Table */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-center font-black text-amber-300 text-lg uppercase tracking-wider mb-2">
              Bảng Tứ Trụ — {pillars.fullName.toUpperCase()} ({pillars.gender})
            </h3>
            <p className="text-center text-xs text-slate-400 mb-6">
              Nạp Âm: <span className="text-amber-400 font-bold">{pillars.napAm}</span> | Nhật Chủ: <span className="text-cyan-400 font-bold">{pillars.dayMaster}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Trụ Năm (Tổ Tiên)</span>
                <div className="text-xl font-black text-white mt-2">{pillars.yearPillar}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Gốc rễ gia đình</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Trụ Tháng (Cha Mẹ)</span>
                <div className="text-xl font-black text-white mt-2">{pillars.monthPillar}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Thời vận thanh xuân</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/60 text-center ring-1 ring-amber-500/50 shadow-lg">
                <span className="text-[11px] font-bold text-amber-300 uppercase">Trụ Ngày (Bản Thân)</span>
                <div className="text-xl font-black text-amber-400 mt-2">{pillars.dayPillar}</div>
                <span className="text-[10px] text-amber-300/80 mt-1 block">Nhật Chủ & Cung Thê/Phu</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Trụ Giờ (Hậu Vận)</span>
                <div className="text-xl font-black text-white mt-2">{pillars.hourPillar}</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Con cái & Tuổi già</span>
              </div>
            </div>
          </div>

          {/* Luận giải AI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <span className="text-2xl">🏛️</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Luận Giải Dụng Thần & Số Mệnh Từ Bậc Thầy Bát Tự
                </h3>
                <p className="text-xs text-slate-400">
                  Phân tích vượng suy nhật chủ, ngũ hành cứu ứng và chiến lược kích hoạt tài lộc
                </p>
              </div>
            </div>

            {readingText ? (
              <div className="prose prose-invert prose-amber max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{readingText}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm animate-pulse">
                Đang đối chiếu thập thần và xác định hỷ dụng thần...
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
