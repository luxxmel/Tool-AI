export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "fill_blank" | "translate" | "listen";
  prompt: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LessonUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  points: number;
  grammarFocus: string;
  vocabulary: { word: string; phonetic: string; meaning: string; example: string }[];
  questions: QuizQuestion[];
}

export interface LearningStage {
  id: string;
  level: string; // "A1 - Căn bản", "A2 - Giao tiếp", "B1 - Trung cấp", "B2/IELTS - Nâng cao"
  title: string;
  subtitle: string;
  color: string;
  bgGradient: string;
  lessons: LessonUnit[];
}

export const ENGLISH_ROADMAP: LearningStage[] = [
  /* ========================================================
     STAGE 1: A1 - CĂN BẢN & PHẢN XẠ ĐẦU TIÊN (6 BÀI HỌC)
     ======================================================== */
  {
    id: "stage-1",
    level: "A1 - Khởi Động & Căn Bản",
    title: "Chinh Phục Giao Tiếp Hàng Ngày",
    subtitle: "Xây dựng phản xạ tự nhiên từ số 0, chào hỏi, số đếm, thời gian, gia đình và sở thích.",
    color: "from-emerald-500 to-teal-600",
    bgGradient: "bg-emerald-500/10 border-emerald-500/20",
    lessons: [
      {
        id: "unit-1-1",
        title: "Bài 1: Chào hỏi & Tự giới thiệu",
        description: "Làm quen với các câu chào lịch sự, giới thiệu tên tuổi, quê quán và nghề nghiệp.",
        icon: "👋",
        duration: "5 phút",
        points: 20,
        grammarFocus: "Động từ To Be (am / is / are) & Đại từ nhân xưng (I, You, He, She, We, They)",
        vocabulary: [
          { word: "Nice to meet you", phonetic: "/naɪs tuː miːt juː/", meaning: "Rất vui được gặp bạn", example: "Hello, I am Linh. Nice to meet you!" },
          { word: "Occupation", phonetic: "/ˌɒkjuˈpeɪʃn/", meaning: "Nghề nghiệp", example: "What is your occupation? I am a software engineer." },
          { word: "Hometown", phonetic: "/ˈhəʊmtaʊn/", meaning: "Quê hương, quê quán", example: "My hometown is Da Nang, Vietnam." },
          { word: "Pleasure", phonetic: "/ˈpleʒə(r)/", meaning: "Niềm vinh hạnh", example: "It is a pleasure to make your acquaintance." }
        ],
        questions: [
          {
            id: "q-1-1-1",
            type: "multiple_choice",
            prompt: "Chọn câu đúng để giới thiệu bản thân một cách tự nhiên:",
            options: [
              "I am very glad to meeting you.",
              "Nice to meet you, I'm Nam from Hanoi.",
              "Me is Nam from Hanoi.",
              "I have Nam from Hanoi."
            ],
            correctAnswer: "Nice to meet you, I'm Nam from Hanoi.",
            explanation: "Cấu trúc chuẩn giới thiệu tên và xuất xứ: 'I'm [Tên] from [Địa điểm]' và câu chào lịch sự 'Nice to meet you'."
          },
          {
            id: "q-1-1-2",
            type: "fill_blank",
            prompt: "Điền dạng đúng của động từ To Be: 'She ___ a talented designer.'",
            options: ["am", "is", "are", "be"],
            correctAnswer: "is",
            explanation: "Chủ ngữ ngôi thứ ba số ít 'She' luôn đi với động từ to be 'is' ở thì hiện tại đơn."
          },
          {
            id: "q-1-1-3",
            type: "translate",
            prompt: "Dịch sang tiếng Anh: 'Rất vui được gặp bạn.'",
            options: [
              "Nice to meet you.",
              "Good to see you again.",
              "How are you doing?",
              "Welcome to my house."
            ],
            correctAnswer: "Nice to meet you.",
            explanation: "'Nice to meet you' là mẫu câu kinh điển khi gặp ai đó lần đầu tiên."
          }
        ]
      },
      {
        id: "unit-1-2",
        title: "Bài 2: Gia đình & Người thân",
        description: "Học từ vựng về các thành viên gia đình và cách diễn tả mối quan hệ yêu thương.",
        icon: "👨‍👩‍👧‍👦",
        duration: "7 phút",
        points: 25,
        grammarFocus: "Tính từ sở hữu (My, Your, His, Her, Their, Our)",
        vocabulary: [
          { word: "Sibling", phonetic: "/ˈsɪblɪŋ/", meaning: "Anh/chị/em ruột", example: "Do you have any brothers or siblings?" },
          { word: "Relative", phonetic: "/ˈrelətɪv/", meaning: "Họ hàng, người thân", example: "We usually visit our relatives during Tet holiday." },
          { word: "Extended family", phonetic: "/ɪkˌstendɪd ˈfæməli/", meaning: "Đại gia đình (nhiều thế hệ)", example: "I live with my extended family in Saigon." },
          { word: "Supportive", phonetic: "/səˈpɔːtɪv/", meaning: "Ủng hộ, tương trợ", example: "My parents are always supportive of my dreams." }
        ],
        questions: [
          {
            id: "q-1-2-1",
            type: "multiple_choice",
            prompt: "Từ nào đồng nghĩa với 'anh/chị/em ruột' trong gia đình?",
            options: ["Cousin", "Sibling", "Parent", "Colleague"],
            correctAnswer: "Sibling",
            explanation: "'Sibling' là danh từ chỉ chung anh chị em ruột, còn 'Cousin' là anh chị em họ."
          },
          {
            id: "q-1-2-2",
            type: "fill_blank",
            prompt: "Chọn tính từ sở hữu đúng: 'This is Tom and ___ sister is a doctor.'",
            options: ["his", "her", "their", "its"],
            correctAnswer: "his",
            explanation: "Tom là nam giới (He), do đó tính từ sở hữu tương ứng là 'his'."
          }
        ]
      },
      {
        id: "unit-1-3",
        title: "Bài 3: Đồ ăn, Nước uống & Gọi món Cafe",
        description: "Thực hành phản xạ order cà phê, gọi món tại nhà hàng và hỏi giá tiền.",
        icon: "☕",
        duration: "8 phút",
        points: 30,
        grammarFocus: "Cấu trúc gọi món lịch sự 'I would like to have...' & 'Could I get...'",
        vocabulary: [
          { word: "Could I have...", phonetic: "/kəd aɪ hæv/", meaning: "Tôi có thể lấy... được không?", example: "Could I have an iced latte with less sugar, please?" },
          { word: "Bill / Check", phonetic: "/bɪl / tʃek/", meaning: "Hóa đơn thanh toán", example: "Excuse me, can we have the bill, please?" },
          { word: "Delicious", phonetic: "/dɪˈlɪʃəs/", meaning: "Ngon tuyệt", example: "Vietnamese Pho is world-famous and delicious." },
          { word: "Takeaway / To-go", phonetic: "/ˈteɪkəweɪ/", meaning: "Mang đi", example: "Is this for here or takeaway?" }
        ],
        questions: [
          {
            id: "q-1-3-1",
            type: "multiple_choice",
            prompt: "Khi muốn gọi 1 ly cafe sữa đá mang đi, bạn sẽ nói lịch sự như thế nào?",
            options: [
              "Give me coffee now to go.",
              "Could I get an iced milk coffee to go, please?",
              "I want coffee takeaway quickly.",
              "Coffee please here."
            ],
            correctAnswer: "Could I get an iced milk coffee to go, please?",
            explanation: "Dùng 'Could I get... please' hoặc 'I'd like to have...' thể hiện phép lịch sự chuẩn văn hóa bản xứ."
          }
        ]
      },
      {
        id: "unit-1-4",
        title: "Bài 4: Thời gian, Ngày tháng & Lịch trình",
        description: "Hỏi và trả lời giờ giấc, các ngày trong tuần và cách sắp xếp cuộc hẹn.",
        icon: "⏰",
        duration: "7 phút",
        points: 25,
        grammarFocus: "Giới từ chỉ thời gian: In (tháng/năm), On (ngày/thứ), At (giờ cụ thể)",
        vocabulary: [
          { word: "Quarter past", phonetic: "/ˈkwɔːtə pɑːst/", meaning: "Hơn 15 phút", example: "It is a quarter past eight right now." },
          { word: "Appointment", phonetic: "/əˈpɔɪntmənt/", meaning: "Cuộc hẹn trước", example: "I have a dentist appointment at 3 PM." },
          { word: "Available", phonetic: "/əˈveɪləbl/", meaning: "Rảnh rỗi, có mặt", example: "Are you available this Friday afternoon?" }
        ],
        questions: [
          {
            id: "q-1-4-1",
            type: "multiple_choice",
            prompt: "Chọn giới từ chính xác: 'The concert will start ___ 7:30 PM ___ Sunday.'",
            options: ["at / on", "in / at", "on / in", "at / in"],
            correctAnswer: "at / on",
            explanation: "Đi với giờ chính xác dùng 'at', đi với các thứ trong tuần dùng 'on'."
          }
        ]
      },
      {
        id: "unit-1-5",
        title: "Bài 5: Sở thích, Thể thao & Giải trí",
        description: "Bày tỏ những điều bạn yêu thích, các môn thể thao và hoạt động cuối tuần.",
        icon: "⚽",
        duration: "8 phút",
        points: 30,
        grammarFocus: "Động từ chỉ sở thích: Like / Love / Enjoy + V-ing",
        vocabulary: [
          { word: "Keen on", phonetic: "/kiːn ɒn/", meaning: "Đam mê, rất thích", example: "I am really keen on playing acoustic guitar." },
          { word: "Workout", phonetic: "/ˈwɜːkaʊt/", meaning: "Tập luyện thể thao", example: "I hit the gym for a daily workout every morning." },
          { word: "Outdoor activity", phonetic: "/ˈaʊtdɔː(r) ækˈtɪvəti/", meaning: "Hoạt động ngoài trời", example: "Camping is my favorite outdoor activity." }
        ],
        questions: [
          {
            id: "q-1-5-1",
            type: "fill_blank",
            prompt: "Chọn dạng đúng của từ: 'She enjoys ___ novels in her spare time.'",
            options: ["reading", "to read", "read", "reads"],
            correctAnswer: "reading",
            explanation: "Sau động từ 'enjoy' luôn luôn là một danh động từ dạng V-ing (enjoy reading)."
          }
        ]
      },
      {
        id: "unit-1-6",
        title: "Bài 6: Thói quen hàng ngày (Daily Routine)",
        description: "Miêu tả lịch trình một ngày từ lúc thức dậy, đi làm đến khi đi ngủ.",
        icon: "🌅",
        duration: "8 phút",
        points: 30,
        grammarFocus: "Thì Hiện tại đơn & Trạng từ tần suất (Always, Usually, Sometimes, Never)",
        vocabulary: [
          { word: "Wake up vs Get up", phonetic: "/weɪk ʌp / ɡet ʌp/", meaning: "Tỉnh giấc vs Bước ra khỏi giường", example: "I wake up at 6 AM but get up at 6:30 AM." },
          { word: "Commute", phonetic: "/kəˈmjuːt/", meaning: "Quãng đường đi lại làm việc", example: "It takes 30 minutes to commute to my office." },
          { word: "Unwind", phonetic: "/ʌnˈwaɪnd/", meaning: "Thư giãn, xả hơi", example: "Listening to music helps me unwind after work." }
        ],
        questions: [
          {
            id: "q-1-6-1",
            type: "multiple_choice",
            prompt: "Vị trí của trạng từ tần suất 'always' trong câu nào là đúng?",
            options: [
              "He always drinks coffee in the morning.",
              "He drinks always coffee in the morning.",
              "He drinks coffee always in the morning.",
              "Always he drinks coffee in the morning."
            ],
            correctAnswer: "He always drinks coffee in the morning.",
            explanation: "Trạng từ tần suất đứng trước động từ thường và đứng sau động từ to be."
          }
        ]
      }
    ]
  },

  /* ========================================================
     STAGE 2: A2 - GIAO TIẾP ĐỜI SỐNG & DU LỊCH (6 BÀI HỌC)
     ======================================================== */
  {
    id: "stage-2",
    level: "A2 - Giao Tiếp Đời Sống & Du Lịch",
    title: "Tự Tin Đi Du Lịch & Mua Sắm Toàn Cầu",
    subtitle: "Mở rộng vốn từ khi đi máy bay, đặt phòng khách sạn, mua sắm, hỏi đường và khám bệnh.",
    color: "from-cyan-500 to-blue-600",
    bgGradient: "bg-cyan-500/10 border-cyan-500/20",
    lessons: [
      {
        id: "unit-2-1",
        title: "Bài 7: Sân bay & Thủ tục Check-in",
        description: "Học cách trả lời nhân viên hải quan, lấy vé máy bay và tìm cửa ra tàu bay (Boarding Gate).",
        icon: "✈️",
        duration: "8 phút",
        points: 30,
        grammarFocus: "Thì Hiện tại hoàn thành với Ever / Never ('Have you ever been to...')",
        vocabulary: [
          { word: "Boarding pass", phonetic: "/ˈbɔːdɪŋ pɑːs/", meaning: "Thẻ lên máy bay", example: "Please show your passport and boarding pass." },
          { word: "Carry-on luggage", phonetic: "/ˈkæri ɒn ˈlʌɡɪdʒ/", meaning: "Hành lý xách tay", example: "Only one carry-on bag is permitted per passenger." },
          { word: "Departure", phonetic: "/dɪˈpɑːtʃə(r)/", meaning: "Giờ khởi hành", example: "The departure gate has been moved to Gate 14." },
          { word: "Customs declaration", phonetic: "/ˈkʌstəmz ˌdekləˈreɪʃn/", meaning: "Tờ khai hải quan", example: "Please fill out this customs declaration form." }
        ],
        questions: [
          {
            id: "q-2-1-1",
            type: "multiple_choice",
            prompt: "Từ nào chỉ chiếc 'Thẻ lên máy bay' bắt buộc phải xuất trình?",
            options: ["Boarding pass", "Flight ticket", "Receipt", "Identity card"],
            correctAnswer: "Boarding pass",
            explanation: "'Boarding pass' là thẻ lên tàu bay nhận được sau khi làm thủ tục check-in."
          }
        ]
      },
      {
        id: "unit-2-2",
        title: "Bài 8: Khách sạn & Đặt phòng (Accommodation)",
        description: "Check-in khách sạn, yêu cầu dọn phòng, hỏi mật khẩu Wi-Fi và giải quyết sự cố.",
        icon: "🏨",
        duration: "8 phút",
        points: 35,
        grammarFocus: "Câu điều kiện loại 1 (If + Present Simple, will + V)",
        vocabulary: [
          { word: "Reservation", phonetic: "/ˌrezəˈveɪʃn/", meaning: "Sự đặt chỗ trước", example: "I have a reservation under the name of Nguyen." },
          { word: "Complimentary", phonetic: "/ˌkɒmplɪˈmentri/", meaning: "Miễn phí đính kèm dịch vụ", example: "Breakfast is complimentary for all hotel guests." },
          { word: "Housekeeping", phonetic: "/ˈhaʊskiːpɪŋ/", meaning: "Bộ phận dọn phòng", example: "Could you send housekeeping to room 302, please?" }
        ],
        questions: [
          {
            id: "q-2-2-1",
            type: "multiple_choice",
            prompt: "Từ 'Complimentary breakfast' tại khách sạn có nghĩa là gì?",
            options: [
              "Bữa sáng tính thêm phí đắt đỏ",
              "Bữa sáng được phục vụ miễn phí đi kèm tiền phòng",
              "Bữa sáng tự nấu trong phòng",
              "Bữa sáng chỉ dành cho nhân viên"
            ],
            correctAnswer: "Bữa sáng được phục vụ miễn phí đi kèm tiền phòng",
            explanation: "'Complimentary' là thuật ngữ khách sạn - dịch vụ cao cấp chỉ món đồ/dịch vụ hoàn toàn miễn phí."
          }
        ]
      },
      {
        id: "unit-2-3",
        title: "Bài 9: Hỏi đường & Định hướng trong Thành phố",
        description: "Các câu hỏi đường thông dụng, cách rẽ trái/phải, đi thẳng và các mốc địa danh.",
        icon: "🗺️",
        duration: "7 phút",
        points: 30,
        grammarFocus: "Câu mệnh lệnh chỉ đường (Turn left at..., Go straight ahead, Opposite)",
        vocabulary: [
          { word: "Intersection", phonetic: "/ˌɪntəˈsekʃn/", meaning: "Ngã tư, giao lộ", example: "Turn right at the next busy intersection." },
          { word: "Roundabout", phonetic: "/ˈraʊndəbaʊt/", meaning: "Bùng binh, vòng xoay", example: "Take the second exit at the roundabout." },
          { word: "Within walking distance", phonetic: "/wɪˈðɪn ˈwɔːkɪŋ/", meaning: "Rất gần, đi bộ được", example: "The museum is within walking distance from here." }
        ],
        questions: [
          {
            id: "q-2-3-1",
            type: "translate",
            prompt: "Dịch: 'Bảo tàng nằm ở đối diện ngân hàng.'",
            options: [
              "The museum is opposite the bank.",
              "The museum is behind the bank.",
              "The museum next to the bank.",
              "The museum inside the bank."
            ],
            correctAnswer: "The museum is opposite the bank.",
            explanation: "'Opposite' có nghĩa là đối diện (ở bờ bên kia đường)."
          }
        ]
      },
      {
        id: "unit-2-4",
        title: "Bài 10: Mua sắm, Thử đồ & Trả giá (Shopping)",
        description: "Hỏi kích cỡ quần áo, thử đồ tại phòng thay đồ và hỏi các chương trình giảm giá.",
        icon: "🛍️",
        duration: "8 phút",
        points: 30,
        grammarFocus: "Cấu trúc so sánh hơn & so sánh nhất (Cheaper, More expensive, Best value)",
        vocabulary: [
          { word: "Fitting room", phonetic: "/ˈfɪtɪŋ ruːm/", meaning: "Phòng thay đồ", example: "Where is the fitting room? I want to try this jacket." },
          { word: "Discount / On sale", phonetic: "/ˈdɪskaʊnt/", meaning: "Giảm giá / Đang khuyến mãi", example: "Is this item on sale with a 20% discount?" },
          { word: "Refund / Exchange", phonetic: "/ˈriːfʌnd/", meaning: "Hoàn tiền / Đổi hàng", example: "Can I get a refund if it doesn't fit?" }
        ],
        questions: [
          {
            id: "q-2-4-1",
            type: "multiple_choice",
            prompt: "Khi muốn hỏi phòng thử đồ ở đâu, bạn hỏi như thế nào?",
            options: [
              "Where is the fitting room?",
              "Where is the bedroom?",
              "Where is the kitchen?",
              "Where is the restroom?"
            ],
            correctAnswer: "Where is the fitting room?",
            explanation: "'Fitting room' là phòng thử đồ tại các cửa hàng thời trang."
          }
        ]
      },
      {
        id: "unit-2-5",
        title: "Bài 11: Đi khám bác sĩ & Mua thuốc (Pharmacy)",
        description: "Diễn tả các triệu chứng đau đầu, cảm sốt, đau bụng và hiểu hướng dẫn uống thuốc.",
        icon: "💊",
        duration: "9 phút",
        points: 35,
        grammarFocus: "Động từ khiếm khuyết khuyên nhủ (Should / Shouldn't + V)",
        vocabulary: [
          { word: "Prescription", phonetic: "/prɪˈskrɪpʃn/", meaning: "Đơn thuốc của bác sĩ", example: "You need a doctor's prescription for this antibiotic." },
          { word: "Symptom", phonetic: "/ˈsɪmptəm/", meaning: "Triệu chứng bệnh", example: "Fever and sore throat are common flu symptoms." },
          { word: "Drowsy", phonetic: "/ˈdraʊzi/", meaning: "Gây buồn ngủ", example: "This allergy medicine might make you feel drowsy." }
        ],
        questions: [
          {
            id: "q-2-5-1",
            type: "multiple_choice",
            prompt: "Từ 'Prescription' tại hiệu thuốc có nghĩa là gì?",
            options: ["Đơn thuốc", "Bệnh án", "Hóa đơn tiền điện", "Bảo hiểm y tế"],
            correctAnswer: "Đơn thuốc",
            explanation: "'Prescription' là toa thuốc/đơn thuốc do bác sĩ kê."
          }
        ]
      },
      {
        id: "unit-2-6",
        title: "Bài 12: Đặt xe Taxi & Giao thông công cộng",
        description: "Bắt taxi, xe bus, tàu điện ngầm và thanh toán tiền cước thuận tiện.",
        icon: "🚕",
        duration: "7 phút",
        points: 30,
        grammarFocus: "Cấu trúc 'How much does it cost to...' & 'Could you drop me off at...'",
        vocabulary: [
          { word: "Fare", phonetic: "/feə(r)/", meaning: "Tiền vé tàu xe / cước taxi", example: "How much is the taxi fare to the central station?" },
          { word: "Drop off", phonetic: "/drɒp ɒf/", meaning: "Cho xuống xe", example: "Could you drop me off at the next corner, please?" },
          { word: "Subway / Metro", phonetic: "/ˈsʌbweɪ/", meaning: "Tàu điện ngầm", example: "Taking the subway is much faster during rush hour." }
        ],
        questions: [
          {
            id: "q-2-6-1",
            type: "multiple_choice",
            prompt: "Khi muốn nhờ tài xế taxi cho bạn xuống ở góc phố, bạn nói thế nào?",
            options: [
              "Could you drop me off at the corner, please?",
              "Stop car now I get out.",
              "Fall me down here.",
              "Put me away please."
            ],
            correctAnswer: "Could you drop me off at the corner, please?",
            explanation: "'Drop someone off' là cụm động từ chuẩn xác mang nghĩa trả khách / cho ai đó xuống xe."
          }
        ]
      }
    ]
  },

  /* ========================================================
     STAGE 3: B1 - TIẾNG ANH CÔNG SỞ & CÔNG VIỆC (6 BÀI HỌC)
     ======================================================== */
  {
    id: "stage-3",
    level: "B1 - Tiếng Anh Công Sở & Công Việc",
    title: "Giao Tiếp Nơi Làm Việc & Đàm Phán",
    subtitle: "Viết email chuyên nghiệp, họp báo cáo tiến độ, đàm phán hợp đồng và phỏng vấn xin việc.",
    color: "from-indigo-500 to-violet-600",
    bgGradient: "bg-indigo-500/10 border-indigo-500/20",
    lessons: [
      {
        id: "unit-3-1",
        title: "Bài 13: Soạn thảo Email Chuyên Nghiệp",
        description: "Các mẫu câu mở đầu trang trọng, gửi file đính kèm và cách kết thư chuẩn doanh nghiệp.",
        icon: "✉️",
        duration: "10 phút",
        points: 40,
        grammarFocus: "Câu bị động trang trọng (Passive Voice: 'It was decided that...')",
        vocabulary: [
          { word: "Please find attached", phonetic: "/pliːz faɪnd əˈtætʃt/", meaning: "Xin vui lòng xem tệp đính kèm", example: "Please find attached the financial report for Q3." },
          { word: "Looking forward to", phonetic: "/ˈlʊkɪŋ ˈfɔːwəd tuː/", meaning: "Rất mong đợi được...", example: "I am looking forward to hearing from you soon." },
          { word: "Regarding / Concerning", phonetic: "/rɪˈɡɑːdɪŋ/", meaning: "Về vấn đề, liên quan tới", example: "I am writing regarding the upcoming software release." },
          { word: "At your earliest convenience", phonetic: "/kənˈviːniəns/", meaning: "Vào thời gian sớm nhất thuận tiện cho bạn", example: "Please review the contract at your earliest convenience." }
        ],
        questions: [
          {
            id: "q-3-1-1",
            type: "multiple_choice",
            prompt: "Mẫu câu nào chuẩn mực nhất để thông báo có file gửi kèm trong email?",
            options: [
              "Look at my file below.",
              "Please find attached the requested document.",
              "I send you document see it.",
              "Here is document you wanted."
            ],
            correctAnswer: "Please find attached the requested document.",
            explanation: "'Please find attached...' là cấu trúc chuyên nghiệp vàng trong thư từ công việc quốc tế."
          }
        ]
      },
      {
        id: "unit-3-2",
        title: "Bài 14: Thuyết trình Dự án & Trình bày Ý tưởng",
        description: "Nắm vững kỹ năng mở đầu bài thuyết trình lôi cuốn và dẫn dắt các slide thuyết phục.",
        icon: "📊",
        duration: "10 phút",
        points: 45,
        grammarFocus: "Liên từ chuyển ý (Moreover, Furthermore, On the contrary, To sum up)",
        vocabulary: [
          { word: "To sum up", phonetic: "/tuː sʌm ʌp/", meaning: "Tóm lại, tổng kết lại", example: "To sum up, our new AI tool increases productivity by 40%." },
          { word: "In terms of", phonetic: "/ɪn tɜːmz əv/", meaning: "Xét về phương diện", example: "In terms of user experience, this design is far superior." },
          { word: "Key takeaway", phonetic: "/kiː ˈteɪkəweɪ/", meaning: "Bài học / điểm mấu chốt quan trọng", example: "The key takeaway is that user retention has doubled." }
        ],
        questions: [
          {
            id: "q-3-2-1",
            type: "multiple_choice",
            prompt: "Để kết luận tóm gọn bài thuyết trình, bạn dùng cụm từ nào?",
            options: ["First of all", "To sum up", "For example", "Meanwhile"],
            correctAnswer: "To sum up",
            explanation: "'To sum up' hoặc 'In conclusion' dùng để tóm tắt các ý chính trước khi kết thúc bài nói."
          }
        ]
      },
      {
        id: "unit-3-3",
        title: "Bài 15: Phỏng vấn Xin việc (Job Interview)",
        description: "Trả lời câu hỏi về điểm mạnh, điểm yếu, kinh nghiệm làm việc và định hướng tương lai.",
        icon: "💼",
        duration: "11 phút",
        points: 45,
        grammarFocus: "Thì Quá khứ đơn & Hiện tại hoàn thành để diễn tả thành tựu công việc",
        vocabulary: [
          { word: "Strength and weakness", phonetic: "/streŋθ ænd ˈwiːknəs/", meaning: "Điểm mạnh và điểm yếu", example: "My greatest strength is problem-solving under high pressure." },
          { word: "Career objective", phonetic: "/kəˈrɪə(r) əbˈdʒektɪv/", meaning: "Mục tiêu nghề nghiệp", example: "My career objective is to become a Lead AI Engineer." },
          { word: "Accomplishment", phonetic: "/əˈkʌmplɪʃmənt/", meaning: "Thành tựu xuất sắc đạt được", example: "Leading this team to success was my biggest accomplishment." }
        ],
        questions: [
          {
            id: "q-3-3-1",
            type: "multiple_choice",
            prompt: "Cách trả lời hay nhất cho câu hỏi 'What is your greatest strength?'",
            options: [
              "I have no weaknesses at all.",
              "I am very adaptable and thrive under tight deadlines.",
              "I just want a high salary.",
              "I do not know, ask my boss."
            ],
            correctAnswer: "I am very adaptable and thrive under tight deadlines.",
            explanation: "Nêu rõ phẩm chất có giá trị thực tế như khả năng thích ứng linh hoạt và làm việc dưới áp lực thời gian."
          }
        ]
      },
      {
        id: "unit-3-4",
        title: "Bài 16: Điều hành & Tham gia Cuộc họp (Meetings)",
        description: "Ngắt lời lịch sự, xin phát biểu ý kiến và thống nhất biên bản cuộc họp.",
        icon: "👥",
        duration: "10 phút",
        points: 40,
        grammarFocus: "Cấu trúc ngắt lời lịch sự ('May I chime in here?', 'If I could just add...')",
        vocabulary: [
          { word: "Agenda", phonetic: "/əˈdʒendə/", meaning: "Chương trình nghị sự cuộc họp", example: "Let us review today's meeting agenda first." },
          { word: "Chime in", phonetic: "/tʃaɪm ɪn/", meaning: "Góp thêm ý kiến vào cuộc đối thoại", example: "May I chime in with a quick observation?" },
          { word: "Action items", phonetic: "/ˈækʃn ˈaɪtəmz/", meaning: "Các đầu việc cụ thể cần thực hiện", example: "Who is responsible for these action items by Friday?" }
        ],
        questions: [
          {
            id: "q-3-4-1",
            type: "multiple_choice",
            prompt: "'Agenda' trong cuộc họp công ty có nghĩa là gì?",
            options: ["Danh sách các nội dung cần họp", "Báo cáo tài chính", "Thư mời họp", "Biên bản xử phạt"],
            correctAnswer: "Danh sách các nội dung cần họp",
            explanation: "'Agenda' là lịch trình / danh sách các chủ đề thảo luận được chuẩn bị trước cho cuộc họp."
          }
        ]
      },
      {
        id: "unit-3-5",
        title: "Bài 17: Đàm phán Hợp đồng & Giá cả (Negotiation)",
        description: "Cách thỏa thuận điều khoản, nhượng bộ khéo léo và ký kết thỏa thuận đôi bên cùng có lợi.",
        icon: "🤝",
        duration: "12 phút",
        points: 45,
        grammarFocus: "Câu điều kiện loại 2 giả định ('If you could offer a 10% discount, we would sign today')",
        vocabulary: [
          { word: "Win-win solution", phonetic: "/wɪn wɪn/", meaning: "Giải pháp cả hai bên cùng có lợi", example: "We aim for a win-win solution that satisfies both companies." },
          { word: "Compromise", phonetic: "/ˈkɒmprəmaɪz/", meaning: "Thỏa hiệp, nhượng bộ đôi bên", example: "After hours of discussion, we reached a reasonable compromise." },
          { word: "Binding agreement", phonetic: "/ˈbaɪndɪŋ/", meaning: "Thỏa thuận có tính ràng buộc pháp lý", example: "Both parties signed a legally binding agreement." }
        ],
        questions: [
          {
            id: "q-3-5-1",
            type: "multiple_choice",
            prompt: "Từ nào chỉ một thỏa thuận mà cả hai bên đối tác đều vui vẻ hưởng lợi?",
            options: ["Win-win", "Lose-lose", "One-way", "Zero-sum"],
            correctAnswer: "Win-win",
            explanation: "'Win-win' là thuật ngữ kinh doanh kinh điển chỉ kết quả đôi bên cùng có lợi."
          }
        ]
      },
      {
        id: "unit-3-6",
        title: "Bài 18: Quản lý Xung đột & Giải quyết Khủng hoảng",
        description: "Xử lý khiếu nại của khách hàng, hòa giải mâu thuẫn nội bộ văn minh và chuyên nghiệp.",
        icon: "🛡️",
        duration: "10 phút",
        points: 45,
        grammarFocus: "Cấu trúc xin lỗi và cam kết khắc phục ('We sincerely apologize for... and assure you that...')",
        vocabulary: [
          { word: "Sincere apology", phonetic: "/sɪnˈsɪə(r) əˈpɒlədʒi/", meaning: "Lời xin lỗi chân thành", example: "Please accept our sincere apologies for this delay." },
          { word: "Rectify", phonetic: "/ˈrektɪfaɪ/", meaning: "Khắc phục, sửa chữa sai sót", example: "We are taking immediate steps to rectify the issue." },
          { word: "Customer satisfaction", phonetic: "/ˈsætɪsfækʃn/", meaning: "Sự hài lòng của khách hàng", example: "Customer satisfaction is our top priority." }
        ],
        questions: [
          {
            id: "q-3-6-1",
            type: "fill_blank",
            prompt: "Chọn từ đúng: 'We are committed to ___ the mistake immediately.'",
            options: ["rectifying", "rectify", "rectified", "rectifies"],
            correctAnswer: "rectifying",
            explanation: "Cấu trúc 'be committed to + V-ing' (cam kết làm điều gì đó)."
          }
        ]
      }
    ]
  },

  /* ========================================================
     STAGE 4: B2 / IELTS - HỌC THUẬT & NÂNG CAO (6 BÀI HỌC)
     ======================================================== */
  {
    id: "stage-4",
    level: "B2 / IELTS - Học Thuật & Nâng Cao",
    title: "Tranh Luận, Tư Duy Phản Biện & IELTS",
    subtitle: "Diễn đạt quan điểm học thuật, phân tích biểu đồ, công nghệ AI và nâng cấp từ vựng Band 7.5+.",
    color: "from-amber-500 to-orange-600",
    bgGradient: "bg-amber-500/10 border-amber-500/20",
    lessons: [
      {
        id: "unit-4-1",
        title: "Bài 19: Tranh biện & Bày tỏ Quan điểm (Argumentation)",
        description: "Cách phản biện lịch sự, đưa ra dẫn chứng logic và sử dụng từ nối cao cấp.",
        icon: "🧠",
        duration: "12 phút",
        points: 50,
        grammarFocus: "Mệnh đề nhượng bộ (Although, Despite the fact that, Nevertheless)",
        vocabulary: [
          { word: "Notwithstanding", phonetic: "/ˌnɒtwɪθˈstændɪŋ/", meaning: "Mặc dù, bất kể", example: "Notwithstanding the economic challenges, the startup flourished." },
          { word: "Substantial evidence", phonetic: "/səbˈstænʃl ˈevɪdəns/", meaning: "Bằng chứng thuyết phục, rõ ràng", example: "There is substantial evidence supporting the adoption of AI." },
          { word: "Detrimental", phonetic: "/ˌdetrɪˈmentl/", meaning: "Có hại, gây tổn hại nghiêm trọng", example: "Lack of sleep has a detrimental effect on brain health." }
        ],
        questions: [
          {
            id: "q-4-1-1",
            type: "multiple_choice",
            prompt: "Từ nào mang nghĩa nâng cao (Band 7.5+) thay thế cho từ 'Harmful / Bad'?",
            options: ["Helpful", "Detrimental", "Fundamental", "Beneficial"],
            correctAnswer: "Detrimental",
            explanation: "'Detrimental' có nghĩa là gây hại, tiêu cực, rất thường gặp trong IELTS Writing Task 2."
          }
        ]
      },
      {
        id: "unit-4-2",
        title: "Bài 20: Phân tích Biểu đồ & Xu hướng (IELTS Task 1)",
        description: "Miêu tả biểu đồ đường, cột, tròn với các cụm từ tăng vọt, sụt giảm và chạm đỉnh.",
        icon: "📈",
        duration: "12 phút",
        points: 50,
        grammarFocus: "Tính từ & trạng từ miêu tả xu hướng biến động (Dramatic increase, Drop sharply, Reach a peak)",
        vocabulary: [
          { word: "Skyrocket / Surge", phonetic: "/ˈskaɪrɒkɪt/", meaning: "Tăng vọt chóng mặt", example: "AI adoption rates skyrocketed in 2024." },
          { word: "Plummet", phonetic: "/ˈplʌmɪt/", meaning: "Lao dốc thê thảm", example: "Carbon emissions plummeted following the new green policy." },
          { word: "Fluctuate", phonetic: "/ˈflʌktʃueɪt/", meaning: "Biến động lên xuống thất thường", example: "Oil prices fluctuated wildly throughout the decade." }
        ],
        questions: [
          {
            id: "q-4-2-1",
            type: "multiple_choice",
            prompt: "Từ nào mang nghĩa 'Lao dốc mạnh, giảm rất sâu' trong phân tích biểu đồ IELTS?",
            options: ["Skyrocket", "Plummet", "Stabilize", "Ascend"],
            correctAnswer: "Plummet",
            explanation: "'Plummet' mang nghĩa giảm sốc, sụt giảm cực mạnh."
          }
        ]
      },
      {
        id: "unit-4-3",
        title: "Bài 21: Công nghệ, Trí tuệ Nhân tạo & Tương lai",
        description: "Bàn luận về ảnh hưởng của AI, tự động hóa và đạo đức công nghệ thời đại 4.0.",
        icon: "🤖",
        duration: "12 phút",
        points: 50,
        grammarFocus: "Cấu trúc giả định tương lai & Câu bị động nâng cao ('It is widely believed that...')",
        vocabulary: [
          { word: "Paradigm shift", phonetic: "/ˈpærədaɪm ʃɪft/", meaning: "Sự thay đổi mang tính thời đại / bước ngoặt", example: "Generative AI represents a paradigm shift in human creativity." },
          { word: "Ubiquitous", phonetic: "/juːˈbɪkwɪtəs/", meaning: "Hiện diện ở khắp mọi nơi", example: "Smartphones have become ubiquitous across all age groups." },
          { word: "Ethical dilemma", phonetic: "/ˈeθɪkl daɪˈlemə/", meaning: "Thế tiến thoái lưỡng nan về mặt đạo đức", example: "Autonomous driving poses profound ethical dilemmas." }
        ],
        questions: [
          {
            id: "q-4-3-1",
            type: "multiple_choice",
            prompt: "Từ 'Ubiquitous' mang nghĩa là gì?",
            options: ["Hiếm gặp", "Có mặt ở khắp mọi nơi", "Cổ xưa", "Nguy hiểm"],
            correctAnswer: "Có mặt ở khắp mọi nơi",
            explanation: "'Ubiquitous' (tính từ C2) có nghĩa là phổ biến, hiện diện khắp nơi (omnipresent)."
          }
        ]
      },
      {
        id: "unit-4-4",
        title: "Bài 22: Môi trường & Phát triển Bền vững (Sustainability)",
        description: "Từ vựng về biến đổi khí hậu, năng lượng tái tạo và giảm thiểu dấu chân carbon.",
        icon: "🌱",
        duration: "11 phút",
        points: 45,
        grammarFocus: "Cấu trúc nguyên nhân - kết quả (Attribute to, Stem from, Lead to)",
        vocabulary: [
          { word: "Carbon footprint", phonetic: "/ˈkɑːbən ˈfʊtprɪnt/", meaning: "Dấu chân carbon (lượng phát thải)", example: "Using solar power drastically reduces your carbon footprint." },
          { word: "Biodiversity loss", phonetic: "/ˌbaɪəʊdaɪˈvɜːsəti/", meaning: "Sự suy giảm đa dạng sinh học", example: "Deforestation is the primary driver of biodiversity loss." },
          { word: "Renewable energy", phonetic: "/rɪˈnjuːəbl/", meaning: "Năng lượng tái tạo", example: "Wind and solar are the cleanest sources of renewable energy." }
        ],
        questions: [
          {
            id: "q-4-4-1",
            type: "multiple_choice",
            prompt: "Cụm từ chỉ nguồn năng lượng sạch không bao giờ cạn kiệt?",
            options: ["Fossil fuels", "Renewable energy", "Nuclear waste", "Carbon emission"],
            correctAnswer: "Renewable energy",
            explanation: "'Renewable energy' là năng lượng tái tạo (mặt trời, gió, thủy triều...)."
          }
        ]
      },
      {
        id: "unit-4-5",
        title: "Bài 23: Tâm lý học & Sức khỏe Tinh thần (Mental Well-being)",
        description: "Thấu hiểu cảm xúc, quản lý stress, hội chứng kiệt sức (burnout) và lối sống tỉnh thức.",
        icon: "🧘",
        duration: "10 phút",
        points: 45,
        grammarFocus: "Đảo ngữ nhấn mạnh ('Not only does mindfulness reduce stress, but it also...')",
        vocabulary: [
          { word: "Burnout", phonetic: "/ˈbɜːnaʊt/", meaning: "Hội chứng kiệt sức do làm việc quá độ", example: "Taking regular breaks is crucial to avoid severe burnout." },
          { word: "Resilience", phonetic: "/rɪˈzɪliəns/", meaning: "Khả năng kiên cường phục hồi sau nghịch cảnh", example: "Emotional resilience allows people to thrive despite setbacks." },
          { word: "Mindfulness", phonetic: "/ˈmaɪndflnəs/", meaning: "Sự tỉnh thức, chánh niệm", example: "Daily mindfulness meditation promotes inner calm and focus." }
        ],
        questions: [
          {
            id: "q-4-5-1",
            type: "multiple_choice",
            prompt: "'Resilience' miêu tả phẩm chất tâm lý nào?",
            options: [
              "Sự yếu đuối dễ nản lòng",
              "Sức bật tinh thần kiên cường vượt qua khó khăn",
              "Sự thờ ơ vô cảm",
              "Tính cách bốc đồng"
            ],
            correctAnswer: "Sức bật tinh thần kiên cường vượt qua khó khăn",
            explanation: "'Resilience' là khả năng kiên trì, mạnh mẽ hồi phục sau các biến cố thử thách."
          }
        ]
      },
      {
        id: "unit-4-6",
        title: "Bài 24: Toàn cầu hóa & Giao thoa Văn hóa (Cross-Culture)",
        description: "Vượt qua rào cản ngôn ngữ, phong tục tập quán và tư duy công dân toàn cầu.",
        icon: "🌐",
        duration: "12 phút",
        points: 50,
        grammarFocus: "Cấu trúc so sánh kép ('The more diverse a team is, the more innovative it becomes')",
        vocabulary: [
          { word: "Cultural nuance", phonetic: "/ˈkʌltʃərəl ˈnjuːɑːns/", meaning: "Sắc thái tinh tế trong văn hóa", example: "Understanding cultural nuances avoids awkward misunderstandings." },
          { word: "Stereotype", phonetic: "/ˈsteriətaɪp/", meaning: "Định kiến rập khuôn", example: "We must challenge harmful cultural stereotypes with empathy." },
          { word: "Global citizen", phonetic: "/ˈɡləʊbl ˈsɪtɪzn/", meaning: "Công dân toàn cầu", example: "Fluency in English empowers youth to become proactive global citizens." }
        ],
        questions: [
          {
            id: "q-4-6-1",
            type: "multiple_choice",
            prompt: "Từ 'Cultural nuance' mang ý nghĩa gì?",
            options: [
              "Sự khác biệt sắc thái tinh tế trong văn hóa",
              "Rào cản thuế quan kinh tế",
              "Chiến tranh xung đột",
              "Trang phục truyền thống"
            ],
            correctAnswer: "Sự khác biệt sắc thái tinh tế trong văn hóa",
            explanation: "'Nuance' là nét tinh tế, khác biệt nhỏ nhưng quan trọng trong văn hóa và giao tiếp."
          }
        ]
      }
    ]
  }
];
