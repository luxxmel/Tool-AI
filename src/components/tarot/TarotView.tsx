'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TAROT_CARDS, TAROT_TOPICS, TarotCard, TarotTopic, SpreadOption } from '@/data/tarotData';
import { useAuth } from '@/context/AuthContext';
import RechargeModal from '@/components/payment/RechargeModal';

interface SelectedCardItem {
  card: TarotCard;
  isReversed: boolean;
  positionLabel: string;
}

interface TarotHistoryItem {
  id: string;
  topicTitle: string;
  dateStr: string;
  cards: SelectedCardItem[];
  readingText: string;
}

export default function TarotView() {
  const { user } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Flow steps matching tatca.ai: 'home' -> 'select_spread' -> 'target_info' -> 'shuffle' -> 'draw' -> 'reading'
  const [step, setStep] = useState<'home' | 'select_spread' | 'target_info' | 'shuffle' | 'draw' | 'reading'>('home');
  
  const [selectedTopic, setSelectedTopic] = useState<TarotTopic>(TAROT_TOPICS[0]); // Default: TÌNH CẢM
  const [selectedSpread, setSelectedSpread] = useState<SpreadOption>(TAROT_TOPICS[0].spreads[0]);

  // Target Info form for "Gương kết nối" / Specific Partner
  const [partnerName, setPartnerName] = useState('');
  const [relationshipType, setRelationshipType] = useState('Người yêu');
  const [storyContext, setStoryContext] = useState('');

  const [deck, setDeck] = useState<TarotCard[]>(TAROT_CARDS);
  const [pickedCards, setPickedCards] = useState<SelectedCardItem[]>([]);
  const [lastPickedId, setLastPickedId] = useState<string | null>(null);

  const [dailyCard, setDailyCard] = useState<{ card: TarotCard; isReversed: boolean } | null>(null);
  const [isDailyFlipped, setIsDailyFlipped] = useState(false);
  const [isDailyCardOpen, setIsDailyCardOpen] = useState(false);

  const [readingText, setReadingText] = useState('');
  const [isReadingLoading, setIsReadingLoading] = useState(false);

  const relationshipOptions = ['Người yêu', 'Crush', 'Bạn bè', 'Gia đình', 'Đồng nghiệp', 'Người cũ'];

  // History state matching tatca.ai layout
  const [historyList, setHistoryList] = useState<TarotHistoryItem[]>([
    {
      id: 'h1',
      topicTitle: 'Tình cảm',
      dateStr: '3 ngày trước',
      cards: [
        { card: TAROT_CARDS.find(c => c.id === 'queen_of_cups') || TAROT_CARDS[0], isReversed: true, positionLabel: 'Bạn' },
        { card: TAROT_CARDS.find(c => c.id === 'eight_of_pentacles') || TAROT_CARDS[1], isReversed: true, positionLabel: 'Người ấy' },
        { card: TAROT_CARDS.find(c => c.id === 'chariot') || TAROT_CARDS[2], isReversed: true, positionLabel: 'Kết nối' },
        { card: TAROT_CARDS.find(c => c.id === 'five_of_wands') || TAROT_CARDS[3], isReversed: true, positionLabel: 'Đang giữ' },
        { card: TAROT_CARDS.find(c => c.id === 'six_of_swords') || TAROT_CARDS[4], isReversed: true, positionLabel: 'Cọ xát' },
        { card: TAROT_CARDS.find(c => c.id === 'star') || TAROT_CARDS[5], isReversed: false, positionLabel: 'Lời khuyên' },
        { card: TAROT_CARDS.find(c => c.id === 'sun') || TAROT_CARDS[6], isReversed: false, positionLabel: 'Hướng đi' },
      ],
      readingText: 'Dường như bạn đang mang theo rất nhiều cảm xúc chông chênh vào mối quan hệ này...'
    }
  ]);

  // Sound Effects Generator for Tarot Interactions
  const playMagicSound = (type: 'shuffle' | 'pick' | 'reveal') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'shuffle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'pick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === 'reveal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Ignore audio context autoplay policy warnings
    }
  };

  // Step 1 -> Step 2: Pick Topic -> Open Spreads Menu
  const handleSelectTopic = (topic: TarotTopic) => {
    setSelectedTopic(topic);
    setSelectedSpread(topic.spreads[0]);
    setStep('select_spread');
  };

  // Step 2 -> Step 3 or Shuffle: Select Spread Option
  const handleChooseSpread = (spread: SpreadOption) => {
    setSelectedSpread(spread);
    if (selectedTopic.id === 'love' && (spread.id === 'love_mirror' || spread.id === 'love_branch')) {
      setStep('target_info');
    } else {
      startShuffle();
    }
  };

  // Start shuffle and move to draw
  const startShuffle = () => {
    setStep('shuffle');
    playMagicSound('shuffle');
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setPickedCards([]);
      setLastPickedId(null);
      setStep('draw');
    }, 1200);
  };

  const handleFlipDailyCard = () => {
    playMagicSound('reveal');
    if (!dailyCard) {
      const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
      setDailyCard({ card: randomCard, isReversed: Math.random() < 0.2 });
    }
    setIsDailyFlipped(true);
  };

  const handlePickCard = (card: TarotCard) => {
    const targetCount = selectedSpread.cardCount;
    if (pickedCards.length >= targetCount) return;
    if (pickedCards.some((p) => p.card.id === card.id)) return;

    playMagicSound('pick');
    setLastPickedId(card.id);
    const isReversed = Math.random() < 0.3;
    const nextSlotLabel = selectedSpread.positions[pickedCards.length] || `Lá ${pickedCards.length + 1}`;

    const newPicked = [
      ...pickedCards,
      {
        card,
        isReversed,
        positionLabel: nextSlotLabel
      }
    ];

    setPickedCards(newPicked);
  };

  // Bốc tất cả ngẫu nhiên
  const handlePickAllAuto = () => {
    const targetCount = selectedSpread.cardCount;
    const currentUnpicked = deck.filter(c => !pickedCards.some(p => p.card.id === c.id));
    const needed = targetCount - pickedCards.length;
    const newAdditions: SelectedCardItem[] = [];

    for (let i = 0; i < needed; i++) {
      if (currentUnpicked[i]) {
        const isReversed = Math.random() < 0.3;
        const posLabel = selectedSpread.positions[pickedCards.length + i] || `Lá ${pickedCards.length + i + 1}`;
        newAdditions.push({
          card: currentUnpicked[i],
          isReversed,
          positionLabel: posLabel
        });
      }
    }

    const fullPicked = [...pickedCards, ...newAdditions];
    setPickedCards(fullPicked);
    setStep('reading');
    generateAiReading(fullPicked);
  };

  const handleAddExtraCard = () => {
    const unpicked = deck.filter(c => !pickedCards.some(p => p.card.id === c.id));
    if (unpicked.length === 0) return;
    const randomCard = unpicked[Math.floor(Math.random() * unpicked.length)];
    const isReversed = Math.random() < 0.3;
    const extraLabel = `Lá bổ trợ ${pickedCards.length + 1}`;

    const updated = [
      ...pickedCards,
      { card: randomCard, isReversed, positionLabel: extraLabel }
    ];
    setPickedCards(updated);
    if (step === 'reading') {
      generateAiReading(updated);
    }
  };

  const handleStartReading = () => {
    if (pickedCards.length < selectedSpread.cardCount) return;
    setStep('reading');
    generateAiReading(pickedCards);
  };

  const generateAiReading = async (currentPicked: SelectedCardItem[]) => {
    setIsReadingLoading(true);
    setReadingText('');

    try {
      const cardDetails = currentPicked
        .map(
          (p) =>
            `- Khía cạnh [${p.positionLabel}]: Lá [${p.card.vietnameseName}] (${p.isReversed ? 'Lá Ngược / Reversed' : 'Lá Xuôi / Upright'}). Từ khóa: ${p.card.keywords.join(', ')}. Năng lượng: ${
              p.isReversed ? p.card.reversedMeaning : p.card.uprightMeaning
            }`
        )
        .join('\n');

      const partnerContextStr = partnerName || storyContext
        ? `\nThông tin đối phương / Bối cảnh: Tên: "${partnerName || 'Đối phương'}", Mối quan hệ: "${relationshipType}", Diễn biến: "${storyContext || 'Chưa rõ'}"`
        : '';

      const prompt = `Bạn là Luna - Master Tarot Reader & Chuyên Gia Phân Tích Tâm Lý Thấu Cảm Đỉnh Cao (chuẩn phong cách bói toán chính xác Tatca.AI).

Chủ đề trải bài: "${selectedTopic.title}"
Kiểu trải: "${selectedSpread.title}" (${selectedSpread.subtitle})${partnerContextStr}

Danh sách ${currentPicked.length} lá bài vừa linh ứng rút được:
${cardDetails}

QUY TẮC LUẬN GIẢI CHUẨN XÁC VÀ TÂM LÝ CHUYÊN SÂU (Viết dài, ít nhất 1000 từ):

1. **MỞ ĐẦU CHỮA LÀNH & KẾT NỐI NĂNG LƯỢNG**:
   - Nhìn thẳng vào năng lượng chủ đạo hiện tại của người hỏi.
   - Nếu có thông tin đối phương (${partnerName || 'đối phương'}), phân tích tần số kết nối giữa 2 người (đang nồng thắm, giữ khoảng cách, tổn thương ẩn ngầm hay áp lực từ bên ngoài).

2. **LUẬN GIẢI CHI TIẾT THEO TỪNG VỊ TRÍ KHÍA CẠNH (${currentPicked.length} LÁ BÀI)**:
   Với mỗi lá bài, giải mã theo 3 tầng nghĩa:
   - **Tầng 1 (Hình ảnh & Biểu tượng lá bài)**: Ý nghĩa lá xuôi/ngược, sự tương tác nguyên tố (Thủy/Hỏa/Khí/Thổ).
   - **Tầng 2 (Diễn biến Tâm lý thực tế)**: Nỗi sợ hãi giấu kín, rào cản hành vi, mong muốn chưa nói ra.
   - **Tầng 3 (Tác động thực tế)**: Chuyện gì sẽ diễn ra trong thời gian tới.

3. **BỨC TRANH TỔNG THỂ & THÁO GỠ NÚT THẮT**:
   - Phân tích sợi dây liên kết giữa các lá bài (Lá bài nào là chìa khóa chính để tháo gỡ vấn đề).
   - Đưa ra góc nhìn sự thật không tô hồng nhưng cực kỳ đồng cảm và khai sáng.

4. **ĐỊNH HƯỚNG THỰC CHUYÊN & CHÂM NGÔN VŨ TRỤ**:
   - 3 Hành động cụ thể người hỏi cần làm ngay hôm nay.
   - Lời nhắn nhủ chữa lành sâu sắc nhất từ Vũ Trụ.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: 'tarot-reader',
          userId: user?.id || 'tarot_user_anonymous',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'API Error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        let textAcc = '';
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value || new Uint8Array(), { stream: true });
          textAcc += chunkValue;
          setReadingText(textAcc);
        }

        setHistoryList(prev => [
          {
            id: `h-${Date.now()}`,
            topicTitle: selectedTopic.title,
            dateStr: 'Vừa xong',
            cards: currentPicked,
            readingText: textAcc
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Tarot error:', err);
      
      // Bản luận giải dự phòng chuyên sâu, đầy đủ 4 tầng phân tích chuẩn Tatca.AI
      const partnerStr = partnerName ? `dành riêng cho kết nối giữa bạn và **${partnerName}**` : '';
      const richFallbackText = `🔮 **BẢN LUẬN GIẢI CHUYÊN SÂU TỪ READER LUNA** ${partnerStr}

---

### 🌿 1. TẤN SỐ NĂNG LƯỢNG & MỞ ĐẦU CHỮA LÀNH
Chào bạn, khi trải bài "${selectedTopic.title}" - kiệt tác "${selectedSpread.title}" hiện ra, Vũ Trụ phản ánh một dòng năng lượng đang cuộn chảy rất đặc biệt trong tâm trí bạn. Đôi khi những băn khoăn hay sự chông chênh hiện tại không phải là tín hiệu bế tắc, mà là thời điểm trực giác của bạn thức tỉnh để tháo gỡ những khúc mắc bấy lâu.

---

### 🎴 2. LUẬN GIẢI CHI TIẾT THEO TỪNG VỊ TRÍ KHÍA CẠNH

${currentPicked
  .map(
    (p, idx) => `#### **Khía Cạnh ${idx + 1}: ${p.positionLabel.toUpperCase()} — ${p.card.vietnameseName} (${p.isReversed ? 'Lá Ngược 🔄' : 'Lá Xuôi ✨'})**
- **Ý Nghĩa Biểu Tượng & Nguyên Tố**: Lá bài mang thông điệp cốt lõi về *${p.card.keywords.join(', ')}*. ${p.isReversed ? 'Khi ở trạng thái ngược, năng lượng bị nghẽn hoặc báo hiệu sự kháng cự lại diễn biến tự nhiên.' : 'Lá bài xuôi mang năng lượng khởi sắc, biểu hiện cho sự phát triển đúng hướng.'}
- **Phân Tích Diễn Biến Tâm Lý**: ${p.isReversed ? p.card.reversedMeaning : p.card.uprightMeaning}
- **Tác Động Thực Tế**: Đừng quá lo lắng trước những áp lực vô hình. Hãy dành cho bản thân một khoảng lặng để định hình lại mong muốn thực sự.`
  )
  .join('\n\n')}

---

### 🧩 3. BỨC TRANH TỔNG HỢP & NÚT THẮT CẦN THÁO GỠ
Sợi dây liên kết giữa các lá bài cho thấy bạn đang tiến gần đến mốc thời gian chuyển dịch quan trọng. Nút thắt lớn nhất lúc này chính là việc buông bỏ những kỳ vọng quá mức hoặc nỗi lo sợ mơ hồ về tương lai. Khi bạn nhìn nhận sự việc bằng tâm thế lý trí và bao dung, bức tranh toàn cảnh sẽ tự khắc trở nên minh bạch và gãy gọn.

---

### 🌟 4. HƯỚNG ĐI THỰC CHUYÊN & LỜI NHẮN NHỦ TỪ VŨ TRỤ
- **Hành động 1**: Dành thời gian lắng nghe cảm xúc nội tâm, ngừng so sánh hành trình của mình với người khác.
- **Hành động 2**: Chủ động giao tiếp chân thành và rõ ràng để giải tỏa mọi hiểu lầm nếu có.
- **Hành động 3**: Tin tưởng vào tiềm năng và sự lựa chọn của chính bạn ở khoảnh khắc hiện tại.

✨ *"Khi bạn vững tâm bước đi trên con đường của chính mình, cả vũ trụ sẽ hợp lực để soi sáng từng bước tiến của bạn."*`;

      setReadingText(richFallbackText);
    } finally {
      setIsReadingLoading(false);
    }
  };

  const handleResetToHome = () => {
    setStep('home');
    setPickedCards([]);
    setReadingText('');
    setPartnerName('');
    setStoryContext('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 text-slate-100 min-h-[85vh] flex flex-col justify-start">
      {/* Custom Styles for Golden Glow & Tarot Magic */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        @keyframes tarotGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.7), 0 0 45px rgba(245, 158, 11, 0.5); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cardFlip3D {
          0% { transform: rotateY(90deg) scale(0.8); opacity: 0; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        .animate-card-flip {
          animation: cardFlip3D 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .tarot-glow-border {
          animation: tarotGlow 3s infinite ease-in-out;
        }
        .tarot-float {
          animation: floatCard 4s infinite ease-in-out;
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/60 flex items-center justify-center text-xl shadow-lg shadow-purple-900/30">
            🔮
          </div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
            Xem Tarot <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 font-semibold">✓</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRechargeModal(true)}
            className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition-all cursor-pointer"
            title="Nạp thêm Credits"
          >
            <span>🪙</span> {user?.credits ?? 0} Credits
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/30">+</span>
          </button>
        </div>
      </div>

      {/* STEP 1: HOME (SELECT TOPIC) */}
      {step === 'home' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Lá bài hôm nay Collapsible Accordion */}
          <div className="bg-[#12131c] border border-amber-500/30 rounded-2xl p-4 shadow-xl hover:border-amber-500/50 transition-all">
            <button
              onClick={() => setIsDailyCardOpen(!isDailyCardOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg border border-amber-400/50 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 flex items-center justify-center text-amber-300 shadow-md">
                  ✦
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Lá bài hôm nay</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chạm để lật lá bài vận mệnh của bạn</p>
                </div>
              </div>
              <span className={`text-slate-400 transition-transform duration-300 text-sm ${isDailyCardOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isDailyCardOpen && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-center space-y-4 animate-fadeIn">
                {!isDailyFlipped ? (
                  <button
                    onClick={handleFlipDailyCard}
                    className="w-28 h-44 mx-auto rounded-xl border-2 border-amber-400/80 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 shadow-2xl flex flex-col justify-between items-center p-3 cursor-pointer hover:scale-105 transition-all tarot-glow-border"
                  >
                    <span className="text-xs text-amber-300">✦</span>
                    <span className="text-sm font-serif text-purple-200 font-bold">Lật bài</span>
                    <span className="text-xs text-amber-300">✦</span>
                  </button>
                ) : dailyCard && (
                  <div className="max-w-xs mx-auto space-y-3 animate-card-flip">
                    <div className={`w-28 h-44 mx-auto rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl ${dailyCard.isReversed ? 'rotate-180' : ''}`}>
                      <img src={dailyCard.card.image} alt={dailyCard.card.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-amber-300 text-base">{dailyCard.card.vietnameseName}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      {dailyCard.isReversed ? dailyCard.card.reversedMeaning : dailyCard.card.uprightMeaning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-100">Hôm nay bạn muốn hỏi gì?</h2>
          </div>

          {/* 4 Topic Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {TAROT_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className="bg-[#12131c] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[190px] transition-all duration-300 hover:scale-[1.04] group shadow-lg cursor-pointer relative overflow-hidden"
              >
                <div className="w-16 h-22 rounded-xl border border-amber-400/50 bg-slate-900/80 flex items-center justify-center relative my-2 group-hover:border-amber-300 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all">
                  {topic.iconType === 'love' && (
                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-amber-300/80 -mr-3 animate-pulse" />
                      <div className="w-8 h-8 rounded-full border border-amber-300/80 animate-pulse" />
                      <span className="absolute text-xs text-amber-300">✦</span>
                    </div>
                  )}
                  {topic.iconType === 'work' && (
                    <div className="flex flex-col items-center">
                      <span className="text-amber-300 text-sm">☼</span>
                      <div className="w-8 h-6 border-t border-x border-amber-300/80 rounded-t-lg mt-1" />
                    </div>
                  )}
                  {topic.iconType === 'health' && (
                    <div className="flex flex-col items-center">
                      <span className="text-amber-300 text-lg">🪷</span>
                    </div>
                  )}
                  {topic.iconType === 'finance' && (
                    <div className="w-8 h-8 rounded-full border border-amber-300 flex items-center justify-center">
                      <span className="text-amber-300 text-xs font-serif">★</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-extrabold text-xs md:text-sm text-amber-200 tracking-wider uppercase group-hover:text-amber-300 block">
                    {topic.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">
                    {topic.subtitle}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* LƯỢT TRẢI CỦA BẠN (History Section) */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lượt trải của bạn
            </h3>
            <div className="space-y-3">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedTopic(TAROT_TOPICS.find(t => t.title.toLowerCase().includes(item.topicTitle.toLowerCase())) || TAROT_TOPICS[0]);
                    setPickedCards(item.cards);
                    setReadingText(item.readingText);
                    setStep('reading');
                  }}
                  className="bg-[#12131c] border border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <div className="flex -space-x-2 shrink-0">
                      {item.cards.slice(0, 7).map((c, i) => (
                        <div key={i} className={`w-7 h-11 rounded border border-amber-400/60 overflow-hidden shadow ${c.isReversed ? 'rotate-180' : ''}`}>
                          <img src={c.card.image} alt={c.card.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{item.topicTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.dateStr}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-lg ml-2">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT SPREAD TYPE (MATCHING EXACTLY SCREENSHOT 2) */}
      {step === 'select_spread' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn py-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
              {selectedTopic.title}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Bạn muốn xem kiểu nào?
            </h2>
          </div>

          {/* Featured Default 3 Cards Spread Showcase */}
          <div className="bg-[#12131c] border border-amber-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden tarot-glow-border">
            <div className="flex justify-center items-center -space-x-4 py-2">
              <div className="w-20 h-32 rounded-xl border border-amber-400/60 bg-gradient-to-br from-purple-950 to-indigo-950 transform -rotate-12 shadow-lg flex items-center justify-center text-amber-300">
                ✦
              </div>
              <div className="w-22 h-34 rounded-xl border-2 border-amber-400 bg-gradient-to-br from-purple-900 to-slate-900 z-10 shadow-2xl flex items-center justify-center text-amber-300 scale-105">
                ✦
              </div>
              <div className="w-20 h-32 rounded-xl border border-amber-400/60 bg-gradient-to-br from-purple-950 to-indigo-950 transform rotate-12 shadow-lg flex items-center justify-center text-amber-300">
                ✦
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-amber-300 text-lg">{selectedTopic.spreads[0]?.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedTopic.spreads[0]?.subtitle}</p>
            </div>

            <button
              onClick={() => handleChooseSpread(selectedTopic.spreads[0])}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl cursor-pointer transition-all hover:scale-105"
            >
              Bốc ba lá
            </button>
          </div>

          {/* TRẢI KHÁC List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">TRẢI KHÁC</h4>
            <div className="space-y-3">
              {selectedTopic.spreads.slice(1).map((spread) => (
                <div
                  key={spread.id}
                  onClick={() => handleChooseSpread(spread)}
                  className="bg-[#12131c] border border-slate-800/90 hover:border-amber-500/60 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-900/80 group shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-14 rounded-xl border border-amber-400/30 bg-slate-950 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                      {spread.cardCount} lá
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">{spread.title}</h5>
                        <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">{spread.cardCount} lá</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">{spread.subtitle.split('•')[1] || spread.subtitle}</p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{spread.description}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xl group-hover:text-amber-300 group-hover:translate-x-1 transition-all">›</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleResetToHome}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Đổi chủ đề
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TARGET INFO FORM (MATCHING SCREENSHOT 1 FOR "GƯƠNG KẾT NỐI") */}
      {step === 'target_info' && (
        <div className="max-w-xl mx-auto space-y-6 animate-fadeIn py-6 bg-[#12131c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
              {selectedTopic.title} • {selectedSpread.title}
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Bạn muốn xem cùng ai?
            </h2>
          </div>

          <div className="space-y-5 text-left pt-2">
            {/* Input Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                GỌI NGƯỜI ẤY LÀ GÌ
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Tên hoặc biệt danh (VD: Thắm, Anh Ấy, Crush...)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>

            {/* Relationship Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
                QUAN HỆ
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {relationshipOptions.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationshipType(rel)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      relationshipType === rel
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Context */}
            <div className="space-y-1.5">
              <textarea
                value={storyContext}
                onChange={(e) => setStoryContext(e.target.value)}
                placeholder="Dạo này giữa hai người có chuyện gì? (Không bắt buộc)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              onClick={startShuffle}
              className="px-10 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl cursor-pointer transition-all hover:scale-105"
            >
              Bốc bài
            </button>
            <button
              onClick={() => setStep('select_spread')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Đổi kiểu trải
            </button>
          </div>
        </div>
      )}

      {/* SHUFFLE STEP */}
      {step === 'shuffle' && (
        <div className="text-center py-20 space-y-6 animate-fadeIn">
          <div className="relative w-32 h-48 mx-auto flex items-center justify-center">
            {[...Array(7)].map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 border-2 border-purple-400/60 rounded-xl shadow-2xl animate-pulse tarot-glow-border"
                style={{
                  transform: `rotate(${(idx - 3) * 14}deg) translate(${(idx - 3) * 10}px, ${(idx - 3) * 4}px)`
                }}
              >
                <div className="w-full h-full border border-purple-500/30 rounded-lg m-1 flex items-center justify-center">
                  <span className="text-2xl text-amber-300">✨</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-purple-200">Đang Tráo Bộ Bài Tarot...</h3>
            <p className="text-sm text-slate-400">Hãy tĩnh tâm và hướng về <span className="text-amber-300 font-bold">{selectedSpread.title}</span>.</p>
          </div>
        </div>
      )}

      {/* STEP 4: DRAW STEP (MATCHING SCREENSHOT 3 EXACTLY) */}
      {step === 'draw' && (
        <div className="space-y-8 text-center animate-fadeIn bg-[#0d0e15] border border-purple-950/60 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Mystic Guidance */}
          <div className="text-center space-y-1">
            <p className="text-xs md:text-sm font-semibold text-amber-300 flex items-center justify-center gap-2">
              <span>🌙</span> Hít thở sâu, tập trung vào chủ đề đã chọn rồi chạm để bốc lá đầu tiên.
            </p>
          </div>

          {/* SLOTS DISPLAY AT TOP MATCHING SCREENSHOT 3 */}
          <div className="pt-2">
            <div className="flex justify-center items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar py-2">
              {selectedSpread.positions.map((posLabel, slotIdx) => {
                const item = pickedCards[slotIdx];
                const isCurrentNextSlot = pickedCards.length === slotIdx;

                return (
                  <div
                    key={slotIdx}
                    className={`flex flex-col items-center space-y-1.5 shrink-0 transition-all duration-300`}
                  >
                    <div
                      className={`w-16 h-26 sm:w-20 sm:h-32 rounded-xl border-2 transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden ${
                        item
                          ? 'border-amber-400/90 bg-gradient-to-b from-purple-950 to-slate-900 shadow-xl shadow-purple-950/80 animate-card-flip'
                          : isCurrentNextSlot
                          ? 'border-amber-400/90 border-dashed bg-purple-950/40 shadow-lg shadow-amber-500/20 scale-105 tarot-glow-border'
                          : 'border-slate-800/90 border-dashed bg-slate-950/60'
                      }`}
                    >
                      {item ? (
                        <img
                          src={item.card.image}
                          alt={item.card.name}
                          className={`w-full h-full object-cover ${item.isReversed ? 'rotate-180' : ''}`}
                        />
                      ) : (
                        <span className="text-sm font-bold text-amber-400/80 font-mono">
                          {slotIdx + 1}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider truncate max-w-[70px]">
                      {posLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SÂN BÀI XOÈ QUẠT NGHỆ THUẬT (FAN DECK FIT 100% NO SCROLLBAR) */}
          <div className="relative pt-4 pb-2 w-full overflow-hidden">
            <div className="flex justify-center items-center py-6 px-1 w-full no-scrollbar">
              <div className="flex -space-x-14 sm:-space-x-12 md:-space-x-9 hover:-space-x-4 transition-all duration-500 py-4 items-center max-w-full justify-center">
                {deck.slice(0, 22).map((card, idx) => {
                  const isPicked = pickedCards.some((p) => p.card.id === card.id);
                  const total = 22;
                  const angle = (idx - (total - 1) / 2) * 1.8;
                  const translateY = Math.abs(idx - (total - 1) / 2) * 1.2;

                  return (
                    <button
                      key={card.id}
                      disabled={isPicked || pickedCards.length >= selectedSpread.cardCount}
                      onClick={() => handlePickCard(card)}
                      className={`relative w-16 h-28 sm:w-20 sm:h-36 rounded-xl border-2 transition-all duration-300 transform cursor-pointer shrink-0 ${
                        isPicked
                          ? 'opacity-10 border-slate-800 bg-slate-950 pointer-events-none scale-90 translate-y-8'
                          : 'border-purple-500/70 hover:border-amber-400 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 hover:-translate-y-8 hover:z-40 shadow-xl hover:shadow-purple-500/60 hover:scale-110'
                      }`}
                      style={{
                        transform: !isPicked
                          ? `rotate(${angle}deg) translateY(${translateY}px)`
                          : undefined
                      }}
                    >
                      <div className="w-full h-full p-1.5 flex flex-col justify-between items-center border border-purple-500/30 rounded-lg">
                        <span className="text-[10px] text-amber-300/70">✦</span>
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-amber-400/40 flex items-center justify-center text-[10px] text-amber-300 font-serif bg-purple-950/40">
                          ☾
                        </div>
                        <span className="text-[10px] text-amber-300/70">✦</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nút Bốc Tất Cả & Đổi Câu Hỏi */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={handlePickAllAuto}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                <span>✨</span> Bốc tất cả
              </button>

              <button
                onClick={() => setStep('select_spread')}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                ← Đổi câu hỏi
              </button>
            </div>
          </div>

          {/* Action Start Button (If full picked manually) */}
          {pickedCards.length === selectedSpread.cardCount && (
            <div className="pt-2 flex justify-center animate-scaleUp">
              <button
                onClick={handleStartReading}
                className="px-10 py-4 rounded-full font-extrabold text-base bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-900/80 hover:scale-105 transition-all cursor-pointer animate-bounce ring-4 ring-amber-400/30 flex items-center gap-3"
              >
                <span>🔮</span> Bắt Đầu Giải Bài Tarot Với {selectedSpread.cardCount} Lá Đã Chọn <span>✨</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* READING RESULT STEP */}
      {step === 'reading' && (
        <div className="space-y-6 animate-fadeIn bg-[#12131c] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Kết Quả Trải Bài Tarot</h3>
              <p className="text-xs text-slate-400">
                Chủ đề: <span className="text-amber-300 font-bold">{selectedTopic.title}</span> • Kiểu trải: <span className="text-purple-300">{selectedSpread.title}</span> ({pickedCards.length} lá bài)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddExtraCard}
                className="text-xs text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 px-3.5 py-2 rounded-xl border border-amber-500/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-semibold"
              >
                <span>✨ Soi thêm 1 lá</span>
              </button>
              <button
                onClick={handleResetToHome}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                🔄 Xem chủ đề khác
              </button>
            </div>
          </div>

          {/* Multi-Card Horizontal Display */}
          <div className="py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-start sm:justify-center gap-3 min-w-max px-2 py-2">
              {pickedCards.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-1.5 w-24 sm:w-28 shrink-0 animate-scaleUp">
                  <div className={`relative w-20 h-32 sm:w-24 sm:h-38 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-xl ${item.isReversed ? 'rotate-180' : ''}`}>
                    <img src={item.card.image} alt={item.card.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 truncate w-full">{item.positionLabel}</span>
                  <span className="text-[9px] text-amber-400/90 truncate w-full">{item.card.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reading Text Output */}
          <div className="mt-4 bg-slate-950/90 border border-purple-900/50 rounded-2xl p-5 sm:p-7 space-y-4 shadow-inner">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 p-0.5 shadow-md shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
                  alt="Reader Luna"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-base">Reader Luna - Lời Giải Bài Tarot</h4>
                <p className="text-xs text-purple-300">Thông điệp trực giác chuyên sâu dành cho bạn</p>
              </div>
            </div>

            {isReadingLoading && !readingText ? (
              <div className="py-12 text-center space-y-3">
                <span className="text-3xl inline-block animate-spin">✨</span>
                <p className="text-sm text-slate-300 font-medium">
                  Luna đang luận giải từng khía cạnh trong quẻ trải bài {pickedCards.length} lá của bạn...
                </p>
              </div>
            ) : (
              <div className="text-slate-200 text-sm md:text-base leading-relaxed space-y-4 font-sans prose prose-invert max-w-none prose-p:my-2 prose-headings:text-amber-300 prose-headings:font-bold prose-strong:text-amber-200 prose-strong:font-bold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readingText}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nạp Credits */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
        />
      )}
    </div>
  );
}
