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
  {
    id: "stage-1",
    level: "A1 - Khởi Động & Căn Bản",
    title: "Chinh Phục Giao Tiếp Hàng Ngày",
    subtitle: "Xây dựng phản xạ tự nhiên từ số 0, chào hỏi, giới thiệu bản thân và sở thích.",
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
      }
    ]
  },
  {
    id: "stage-2",
    level: "A2 - Giao Tiếp Đời Sống & Du Lịch",
    title: "Tự Tin Đi Du Lịch & Hỏi Đường",
    subtitle: "Mở rộng vốn từ khi đi máy bay, đặt phòng khách sạn, mua sắm và hỏi đường sá.",
    color: "from-cyan-500 to-blue-600",
    bgGradient: "bg-cyan-500/10 border-cyan-500/20",
    lessons: [
      {
        id: "unit-2-1",
        title: "Bài 4: Sân bay & Thủ tục Check-in",
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
        title: "Bài 5: Khách sạn & Đặt phòng (Accommodation)",
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
      }
    ]
  },
  {
    id: "stage-3",
    level: "B1 - Tiếng Anh Công Sở & Công Việc",
    title: "Giao Tiếp Nơi Làm Việc & Viết Email",
    subtitle: "Viết email chuyên nghiệp, họp báo cáo tiến độ và đàm phán hợp đồng văn minh.",
    color: "from-indigo-500 to-violet-600",
    bgGradient: "bg-indigo-500/10 border-indigo-500/20",
    lessons: [
      {
        id: "unit-3-1",
        title: "Bài 6: Soạn thảo Email Chuyên Nghiệp",
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
        title: "Bài 7: Thuyết trình Dự án & Trình bày Ý tưởng",
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
      }
    ]
  },
  {
    id: "stage-4",
    level: "B2 / IELTS - Học Thuật & Nâng Cao",
    title: "Tranh Luận, Tư Duy Phản Biện & IELTS",
    subtitle: "Diễn đạt quan điểm học thuật, phân tích biểu đồ và nâng cấp từ vựng Band 7.0+.",
    color: "from-amber-500 to-orange-600",
    bgGradient: "bg-amber-500/10 border-amber-500/20",
    lessons: [
      {
        id: "unit-4-1",
        title: "Bài 8: Tranh biện & Bày tỏ Quan điểm (Argumentation)",
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
      }
    ]
  }
];
