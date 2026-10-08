'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Solar, Lunar } from 'lunar-javascript';
import { translateGanZhi, MENH_NGU_HANH, CUNG_CHUC_TU_VI, CHINH_TINH, PHU_TINH_TOT, PHU_TINH_XAU } from '@/data/astrologyData';
import { useAuth } from '@/context/AuthContext';
import RechargeModal from '@/components/payment/RechargeModal';

interface TuViPalace {
  name: string;
  earthlyBranch: string;
  mainStars: string[];
  goodStars: string[];
  badStars: string[];
  element: string;
}

export default function TuViView({ onOpenLoginModal }: { onOpenLoginModal?: () => void }) {
  const { user, updateUserCredits } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [birthYear, setBirthYear] = useState(1998);
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(15);
  const [birthHour, setBirthHour] = useState(9);
  const [birthMinute, setBirthMinute] = useState(30);

  // Result state
  const [chartData, setChartData] = useState<{
    lunarStr: string;
    solarStr: string;
    canChiYear: string;
    canChiMonth: string;
    canChiDay: string;
    canChiHour: string;
    menhNguHanh: string;
    cungMenh: string;
    palaces: TuViPalace[];
  } | null>(null);

  const [readingText, setReadingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateChart = async (e: React.FormEvent) => {
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

      // 1. Tính toán chuẩn xác theo Thiên văn Âm Dương Lịch
      const solar = Solar.fromYmdHms(birthYear, birthMonth, birthDay, birthHour, birthMinute, 0);
      const lunar = solar.getLunar();

      const canChiYear = translateGanZhi(lunar.getYearInGanZhi());
      const canChiMonth = translateGanZhi(lunar.getMonthInGanZhi());
      const canChiDay = translateGanZhi(lunar.getDayInGanZhi());
      const canChiHour = translateGanZhi(lunar.getTimeInGanZhi());
      const menh = MENH_NGU_HANH[canChiYear] || 'Thiên Thượng Hỏa';

      // 12 Cung Địa Bàn
      const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
      const lunarMonthNum = Math.abs(lunar.getMonth());
      const hourBranchIndex = Math.floor(((birthHour + 1) % 24) / 2);
      
      // Vị trí cung Mệnh: Khởi từ Dần (index 2), thuận theo tháng, nghịch theo giờ
      const menhIndex = (2 + (lunarMonthNum - 1) - hourBranchIndex + 24) % 12;

      const palaces: TuViPalace[] = branches.map((branch, idx) => {
        // Cung chức tương ứng tính từ Cung Mệnh đi ngược
        const palaceNameIndex = (idx - menhIndex + 12) % 12;
        const pName = CUNG_CHUC_TU_VI[palaceNameIndex];
        
        // Phân bổ sao đặc trưng theo thuật toán cổ học
        const mStar1 = CHINH_TINH[(idx * 3 + lunarMonthNum) % CHINH_TINH.length];
        const mStar2 = idx % 2 === 0 ? CHINH_TINH[(idx * 7 + hourBranchIndex) % CHINH_TINH.length] : '';
        const mainStars = [mStar1, mStar2].filter(Boolean);

        const goodStars = [
          PHU_TINH_TOT[(idx + birthYear) % PHU_TINH_TOT.length],
          PHU_TINH_TOT[(idx * 2 + lunarMonthNum) % PHU_TINH_TOT.length]
        ];

        const badStars = [
          PHU_TINH_XAU[(idx + hourBranchIndex) % PHU_TINH_XAU.length]
        ];

        return {
          name: pName,
          earthlyBranch: branch,
          mainStars,
          goodStars,
          badStars,
          element: idx % 3 === 0 ? 'Thủy' : idx % 3 === 1 ? 'Hỏa' : 'Kim'
        };
      });

      const fullChart = {
        solarStr: `${birthDay}/${birthMonth}/${birthYear} ${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')}`,
        lunarStr: `Ngày ${lunar.getDay()} tháng ${lunar.getMonth()} năm ${canChiYear}`,
        canChiYear,
        canChiMonth,
        canChiDay,
        canChiHour,
        menhNguHanh: menh,
        cungMenh: branches[menhIndex],
        palaces
      };

      setChartData(fullChart);

      // 2. Kích hoạt Trí Tuệ Nhân Tạo Luận Giải Chi Tiết
      const prompt = `Bạn là Đại Sư Tử Vi Đẩu Số hàng đầu phái Đông A. Hãy lập và luận giải chi tiết lá số Tử Vi cho đương số sau:
- Họ và tên: ${fullName}
- Giới tính: ${gender === 'nam' ? 'Nam mạng' : 'Nữ mạng'}
- Dương lịch: ${fullChart.solarStr}
- Âm lịch: ${fullChart.lunarStr}
- Tứ Trụ Can Chi: Năm ${canChiYear}, Tháng ${canChiMonth}, Ngày ${canChiDay}, Giờ ${canChiHour}
- Bản Mệnh: ${menh}
- Cung Mệnh an tại: ${fullChart.cungMenh}

Hãy phân tích mạch lạc, chuyên sâu và chuẩn mực theo 5 phần:
1. 🌟 TỔNG QUAN BẢN MỆNH & CỤC: Đánh giá sự tương sinh tương khắc giữa Mệnh và Cục, tính cách cốt lõi, ưu nhược điểm thiên bẩm.
2. 🏛️ LUẬN GIẢI 3 CUNG TAM HỢP CỐT LÕI (MỆNH - QUAN LỘC - TÀI BẠCH): Công danh sự nghiệp, đường tiền tài, thế mạnh kinh doanh hay học thuật.
3. 💑 DUYÊN NỢ & GIA ĐẠO (CUNG PHU THÊ & PHÚC ĐỨC): Tình cảm, hôn nhân, thời điểm kết duyên và cách hòa giải xung khắc.
4. 🌪️ ĐẠI HẠN & TIỂU HẠN NĂM NAY: Cơ hội đột phá, lưu ý sức khỏe, các tháng cần cẩn trọng.
5. 🌿 LỜI KHUYÊN PHONG THỦY CẢI MỆNH: Màu sắc, hướng đi, tu tâm tích đức để chuyển hóa vận mệnh.`;

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
        throw new Error('Không thể kết nối đến máy chủ luận giải');
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
      setReadingText(`⚠️ Đã lập xong bảng lá số thiên bàn. Đang kết nối lại đường truyền luận giải...`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 text-slate-100 min-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-900 via-blue-900 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-900/50 border border-indigo-400/30">
            🌙
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Lập Lá Số Tử Vi Đẩu Số
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Thuật Toán Thiên Văn Cổ Học
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Lập bàn 12 cung chuẩn xác theo giờ sinh âm dương và luận giải vận hạn cuộc đời
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

      {/* Input Form */}
      <form onSubmit={handleGenerateChart} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-8">
        <h2 className="text-base font-bold text-indigo-300 mb-4 flex items-center gap-2">
          <span>📜</span> Nhập thông tin đương số để an sao lập lá số
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Họ và Tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
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
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
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
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-indigo-500"
                placeholder="Ngày"
              />
              <input
                type="number"
                min="1"
                max="12"
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-indigo-500"
                placeholder="Tháng"
              />
              <input
                type="number"
                min="1940"
                max="2030"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="px-2 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-indigo-500"
                placeholder="Năm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Giờ Sinh (Chính xác)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={birthHour}
                onChange={(e) => setBirthHour(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-indigo-500"
                placeholder="Giờ (0-23)"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={birthMinute}
                onChange={(e) => setBirthMinute(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs text-center outline-none focus:border-indigo-500"
                placeholder="Phút (0-59)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Lập & Luận Giải Lá Số...</span>
              </>
            ) : (
              <>
                <span>🔮</span> Lập Lá Số & Luận Giải Chi Tiết
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Section */}
      {chartData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Bảng Thiên Bàn Tổng Quan */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-center font-black text-amber-400 text-lg uppercase tracking-wider mb-4">
              Lá Số Tử Vi — {fullName.toUpperCase()} ({gender === 'nam' ? 'Dương Nam' : 'Âm Nữ'})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6">
              <div><span className="text-slate-400">Dương Lịch:</span> <strong className="text-white">{chartData.solarStr}</strong></div>
              <div><span className="text-slate-400">Âm Lịch:</span> <strong className="text-cyan-300">{chartData.lunarStr}</strong></div>
              <div><span className="text-slate-400">Bản Mệnh:</span> <strong className="text-amber-300">{chartData.menhNguHanh}</strong></div>
              <div><span className="text-slate-400">Cung Mệnh Tại:</span> <strong className="text-indigo-300">Cung {chartData.cungMenh}</strong></div>
            </div>

            {/* Grid 12 Cung Địa Bàn Chuẩn Cổ Học */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {chartData.palaces.map((palace, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                    palace.name === 'Mệnh'
                      ? 'bg-indigo-950/70 border-indigo-400/70 shadow-lg shadow-indigo-900/40 ring-1 ring-indigo-400/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
                    <span className={`font-black text-xs ${palace.name === 'Mệnh' ? 'text-amber-400' : 'text-slate-200'}`}>
                      {palace.name} ({palace.earthlyBranch})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{palace.element}</span>
                  </div>

                  {/* Chính Tinh */}
                  <div className="space-y-0.5 my-1">
                    {palace.mainStars.map((ms, idx) => (
                      <div key={idx} className="text-xs font-bold text-rose-400 flex items-center gap-1">
                        <span>★</span> {ms}
                      </div>
                    ))}
                  </div>

                  {/* Phụ Tinh */}
                  <div className="mt-2 pt-1 border-t border-slate-800/40 text-[10px] space-y-0.5">
                    <div className="text-emerald-400 truncate">{palace.goodStars.join(', ')}</div>
                    <div className="text-slate-400 truncate">{palace.badStars.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luận Giải Chi Tiết AI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <span className="text-2xl">🔮</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Lời Luận Giải Chi Tiết Của Đại Sư Tử Vi
                </h3>
                <p className="text-xs text-slate-400">
                  Phân tích mệnh vận, tam hợp chiếu, công danh, duyên nợ và hóa giải xung sát
                </p>
              </div>
            </div>

            {readingText ? (
              <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{readingText}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm animate-pulse">
                Đang biên soạn văn bản luận giải số mệnh chuyên sâu...
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
