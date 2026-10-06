export interface TarotCard {
  id: string;
  name: string;
  vietnameseName: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  keywords: string[];
  element: string;
  image: string;
  uprightMeaning: string;
  reversedMeaning: string;
  advice: string;
}

export interface SpreadOption {
  id: string;
  title: string;
  subtitle: string;
  cardCount: number;
  positions: string[];
  description: string;
  isDefault?: boolean;
}

export interface TarotTopic {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'love' | 'work' | 'health' | 'finance';
  description: string;
  spreads: SpreadOption[];
}

export const TAROT_TOPICS: TarotTopic[] = [
  {
    id: 'love',
    title: 'TÌNH CẢM',
    subtitle: 'Mối quan hệ & Cảm xúc sâu sắc',
    iconType: 'love',
    description: 'Giải mã chi tiết tâm tư đối phương, kết nối cảm xúc, điểm cọ xát và hướng đi.',
    spreads: [
      {
        id: 'love_3cards',
        title: 'Chuyện này đang đi về đâu',
        subtitle: 'Ba lá • Quá khứ – Hiện tại – Tương lai',
        cardCount: 3,
        positions: ['Quá khứ', 'Hiện tại', 'Tương lai'],
        description: 'Bức tranh ngắn gọn về lộ trình tình cảm của bạn.',
        isDefault: true
      },
      {
        id: 'love_branch',
        title: 'Ngã rẽ',
        subtitle: 'Năm lá • Đang phân vân giữa hai đường',
        cardCount: 5,
        positions: ['Hiện tại', 'Hướng đi A', 'Hướng đi B', 'Lời khuyên', 'Kết quả'],
        description: 'Bạn phải chọn giữa hai quyết định cụ thể và chưa quyết được.'
      },
      {
        id: 'love_mirror',
        title: 'Gương kết nối',
        subtitle: 'Bảy lá • Mình với người đó',
        cardCount: 7,
        positions: ['Bạn', 'Người ấy', 'Kết nối', 'Đang giữ', 'Cọ xát', 'Lời khuyên', 'Hướng đi'],
        description: 'Bạn muốn hiểu mình và một người cụ thể đang ở đâu với nhau.'
      },
      {
        id: 'love_celtic',
        title: 'Thập tự Celtic',
        subtitle: 'Mười lá • Đi sâu vào một chuyện',
        cardCount: 10,
        positions: ['Bản chất', 'Thách thức', 'Nguyên nhân ẩn', 'Quá khứ', 'Hiện tại', 'Tương lai', 'Tâm thế', 'Môi trường', 'Hy vọng/Nỗi sợ', 'Kết quả'],
        description: 'Một chuyện cứ lặp lại, hoặc quá rối để hỏi gọn trong một câu.'
      }
    ]
  },
  {
    id: 'work',
    title: 'CÔNG VIỆC',
    subtitle: 'Sự nghiệp & Lộ trình phát triển',
    iconType: 'work',
    description: 'Khám phá năng lực, thách thức, quý nhân phù trợ và định hướng sự nghiệp.',
    spreads: [
      {
        id: 'work_3cards',
        title: 'Định hướng công việc',
        subtitle: 'Ba lá • Thực trạng – Cơ hội – Hướng đi',
        cardCount: 3,
        positions: ['Thực trạng', 'Cơ hội', 'Hướng đi'],
        description: 'Tóm tắt tình hình công việc ngắn gọn.',
        isDefault: true
      },
      {
        id: 'work_branch',
        title: 'Chuyển việc hay Ở lại',
        subtitle: 'Năm lá • Lựa chọn sự nghiệp',
        cardCount: 5,
        positions: ['Hiện tại', 'Lợi ích ở lại', 'Cơ hội chuyển', 'Rủi ro', 'Lời khuyên'],
        description: 'Phân vân giữa các quyết định thay đổi công việc.'
      },
      {
        id: 'work_mirror',
        title: 'Bức tranh sự nghiệp',
        subtitle: 'Bảy lá • Đồng nghiệp & Mục tiêu',
        cardCount: 7,
        positions: ['Năng lực', 'Đồng nghiệp/Sếp', 'Môi trường', 'Điểm nghẽn', 'Thách thức', 'Lời khuyên', 'Thành tựu'],
        description: 'Đi sâu phân tích toàn bộ bức tranh sự nghiệp.'
      }
    ]
  },
  {
    id: 'health',
    title: 'SỨC KHỎE',
    subtitle: 'Năng lượng & Thân tâm trí',
    iconType: 'health',
    description: 'Tham vấn trạng thái tinh thần, sự cân bằng năng lượng và phương pháp chữa lành.',
    spreads: [
      {
        id: 'health_3cards',
        title: 'Cân bằng Thân – Tâm – Trí',
        subtitle: 'Ba lá • Thể chất – Tinh thần – Chữa lành',
        cardCount: 3,
        positions: ['Thể chất', 'Tinh thần', 'Lời khuyên'],
        description: 'Kiểm tra nhanh năng lượng sức khỏe.',
        isDefault: true
      },
      {
        id: 'health_mirror',
        title: 'Bản đồ năng lượng',
        subtitle: 'Năm lá • Giải tỏa căng thẳng',
        cardCount: 5,
        positions: ['Thể chất', 'Cảm xúc', 'Nguồn gây mệt mỏi', 'Phương pháp chữa lành', 'Trạng thái tối ưu'],
        description: 'Khám phá sâu các nguồn suy giảm năng lượng.'
      }
    ]
  },
  {
    id: 'finance',
    title: 'TÀI CHÍNH',
    subtitle: 'Tiền bạc & Cơ hội đầu tư',
    iconType: 'finance',
    description: 'Dự đoán dòng tiền, quản lý chi tiêu và các cơ hội phát triển tài chính.',
    spreads: [
      {
        id: 'finance_3cards',
        title: 'Dòng tiền ngắn hạn',
        subtitle: 'Ba lá • Dòng tiền – Cơ hội – Rủi ro',
        cardCount: 3,
        positions: ['Dòng tiền', 'Cơ hội', 'Rủi ro'],
        description: 'Dự đoán nhanh tình hình tài chính.',
        isDefault: true
      },
      {
        id: 'finance_mirror',
        title: 'Kế hoạch tài chính',
        subtitle: 'Năm lá • Tiền bạc & Đầu tư dài hạn',
        cardCount: 5,
        positions: ['Hiện trạng', 'Cơ hội', 'Bẫy tài chính', 'Hành động', 'Kết quả'],
        description: 'Định hướng chi tiêu và quản lý dòng tiền.'
      }
    ]
  }
];

export const TAROT_CARDS: TarotCard[] = [
  {
    id: 'fool',
    name: 'The Fool',
    vietnameseName: '0 - The Fool (Kẻ Khờ)',
    arcana: 'major',
    keywords: ['Khởi đầu mới', 'Tự do', 'Mạo hiểm', 'Tự nhiên'],
    element: 'Khí',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m00.jpg',
    uprightMeaning: 'Hành trình mới tràn đầy hy vọng và tinh thần dám nghĩ dám làm. Hãy tin tưởng vào bản thân và bước đi không sợ hãi.',
    reversedMeaning: 'Hành động liều lĩnh, thiếu cân nhắc hoặc nỗi sợ thất bại đang giữ chân bạn.',
    advice: 'Hãy cởi mở với những khởi đầu mới, nhưng giữ một chút tỉnh táo trước khi nhảy.'
  },
  {
    id: 'magician',
    name: 'The Magician',
    vietnameseName: 'I - The Magician (Pháp Sư)',
    arcana: 'major',
    keywords: ['Sức mạnh trí tuệ', 'Tập trung', 'Hiện thực hóa', 'Kỹ năng'],
    element: 'Khí',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m01.jpg',
    uprightMeaning: 'Bạn sở hữu đầy đủ tiềm năng và nguồn lực để biến mục tiêu thành hiện thực. Sự tập trung và quyết tâm sẽ tạo nên kỳ tích.',
    reversedMeaning: 'Lãng phí tài năng, thiếu định hướng hoặc có sự thaotúng, gian dối xung quanh.',
    advice: 'Hãy tin vào năng lực của bạn và tận dụng mọi công cụ mình đang có.'
  },
  {
    id: 'high_priestess',
    name: 'The High Priestess',
    vietnameseName: 'II - The High Priestess (Nữ Tư Tế)',
    arcana: 'major',
    keywords: ['Trực giác', 'Bí ẩn', 'Tri thức nội tâm', 'Sự tĩnh lặng'],
    element: 'Nước',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m02.jpg',
    uprightMeaning: 'Trực giác mách bảo những điều lý trí chưa kịp nhận ra. Hãy lắng nghe tiếng nói bên trong và kiên nhẫn quan sát.',
    reversedMeaning: 'Phớt lờ trực giác, cảm xúc bị kìm nén hoặc thiếu sự thấu hiểu bản thân.',
    advice: 'Hãy dành thời gian tĩnh lặng để quay vào bên trong kết nối với tâm hồn.'
  },
  {
    id: 'empress',
    name: 'The Empress',
    vietnameseName: 'III - The Empress (Hoàng Hậu)',
    arcana: 'major',
    keywords: ['Trù phú', 'Tình mẫu tử', 'Phát triển', 'Sự chăm sóc'],
    element: 'Đất',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m03.jpg',
    uprightMeaning: 'Thời kỳ gặt hái thành quả, sự trù phú và yêu thương tràn ngập. Các ý tưởng của bạn đang sinh sôi nảy nở.',
    reversedMeaning: 'Thiếu sự chăm sóc bản thân, bế tắc trong sáng tạo hoặc quá phụ thuộc vào người khác.',
    advice: 'Nuôi dưỡng tâm hồn và bao bọc những ý tưởng mới bằng tình yêu thương.'
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    vietnameseName: 'IV - The Emperor (Hoàng Đế)',
    arcana: 'major',
    keywords: ['Kỷ luật', 'Quyền lực', 'Cấu trúc', 'Bảo hộ'],
    element: 'Lửa',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m04.jpg',
    uprightMeaning: 'Lãnh đạo, thiết lập trật tự và xây dựng nền móng vững chắc. Sự kiên định giúp bạn làm chủ tình hình.',
    reversedMeaning: 'Sự kiểm soát quá đà, độc đoán hoặc thiếu kỷ luật cá nhân.',
    advice: 'Lập kế hoạch rõ ràng và hành động với thái độ có trách nhiệm.'
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    vietnameseName: 'V - The Hierophant (Giáo Hoàng)',
    arcana: 'major',
    keywords: ['Truyền thống', 'Học hỏi', 'Đạo đức', 'Tín ngưỡng'],
    element: 'Đất',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m05.jpg',
    uprightMeaning: 'Tìm kiếm lời khuyên từ người đi trước, tuân theo giá trị truyền thống và mở rộng tri thức.',
    reversedMeaning: 'Cố chấp, gạt bỏ lời khuyên chân thành hoặc mù quáng tuân theo quy tắc cũ.',
    advice: 'Hãy học hỏi kinh nghiệm nhưng vẫn giữ nhân sinh quan riêng của bản thân.'
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    vietnameseName: 'VI - The Lovers (Tình Nhân)',
    arcana: 'major',
    keywords: ['Tình yêu', 'Lựa chọn', 'Hòa hợp', 'Đồng điệu'],
    element: 'Khí',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m06.jpg',
    uprightMeaning: 'Sự thấu hiểu sâu sắc, kết nối tâm hồn và đưa ra lựa chọn quan trọng dựa trên trái tim.',
    reversedMeaning: 'Mất cân bằng trong mối quan hệ, xung đột giá trị hoặc ngần ngại trước quyết định lớn.',
    advice: 'Lựa chọn bằng trái tim và sống thành thật với cảm xúc của mình.'
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    vietnameseName: 'VII - The Chariot (Cỗ Xe Kéo)',
    arcana: 'major',
    keywords: ['Bản lĩnh', 'Chiến thắng', 'Tập trung', 'Vượt thử thách'],
    element: 'Nước',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m07.jpg',
    uprightMeaning: 'Bằng sự quyết tâm và chí hướng rõ ràng, bạn sẽ vượt qua mọi chướng ngại để tiến tới thành công.',
    reversedMeaning: 'Mất phương hướng, thiếu kiểm soát cảm xúc hoặc gặp cản trở từ ngoại cảnh.',
    advice: 'Giữ vững tay lái và tiến về phía trước với niềm tin bất diệt.'
  },
  {
    id: 'strength',
    name: 'Strength',
    vietnameseName: 'VIII - Strength (Sức Mạnh)',
    arcana: 'major',
    keywords: ['Nội lực', 'Sự kiên nhẫn', 'Lòng dịu dàng', 'Làm chủ'],
    element: 'Lửa',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m08.jpg',
    uprightMeaning: 'Sức mạnh thực sự đến từ sự dịu dàng và lòng dũng cảm nội tại. Bạn có thể thuần phục mọi sóng gió.',
    reversedMeaning: 'Nghi ngờ bản thân, tự nản lòng hoặc để sự tức giận lấn át lý trí.',
    advice: 'Hãy kiên nhẫn và dùng sự dịu dàng để giải quyết khó khăn.'
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    vietnameseName: 'IX - The Hermit (Ẩn Sĩ)',
    arcana: 'major',
    keywords: ['Chiêm nghiệm', 'Tự suy ngẫm', 'Tìm kiếm sự thật', 'Tĩnh tâm'],
    element: 'Đất',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m09.jpg',
    uprightMeaning: 'Thời điểm để rút lui khỏi sự ồn ào bên ngoài, suy ngẫm và tìm ra hướng đi đúng đắn cho bản thân.',
    reversedMeaning: 'Cô lập bản thân quá mức, cảm giác cô đơn hoặc lẩn tránh thực tại.',
    advice: 'Lắng nghe trí tuệ nội tâm nhưng đừng tách rời thế giới quá lâu.'
  },
  {
    id: 'wheel_of_fortune',
    name: 'Wheel of Fortune',
    vietnameseName: 'X - Wheel of Fortune (Bánh Xe Vận Mệnh)',
    arcana: 'major',
    keywords: ['Biến chuyển', 'Cơ hội', 'Vòng quay cuộc sống', 'Định mệnh'],
    element: 'Lửa',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m10.jpg',
    uprightMeaning: 'Một bước ngoặt tích cực đang đến. Hãy nắm bắt cơ hội và thích nghi với sự thay đổi của số phận.',
    reversedMeaning: 'Vận xui tạm thời, kháng cự lại sự thay đổi hoặc thiếu chuẩn bị trước biến cố.',
    advice: 'Học cách chấp nhận sự thay đổi và vững vàng bước qua thời khắc chuyển giao.'
  },
  {
    id: 'star',
    name: 'The Star',
    vietnameseName: 'XVII - The Star (Ngôi Sao)',
    arcana: 'major',
    keywords: ['Hy vọng', 'Chữa lành', 'Cảm hứng', 'Sự thanh thản'],
    element: 'Khí',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m17.jpg',
    uprightMeaning: 'Ánh sáng hy vọng và chữa lành sau những giông bão. Vũ trụ đang truyền cảm hứng và tiếp sức cho bạn.',
    reversedMeaning: 'Thất vọng, mất niềm tin hoặc nhìn nhận mọi thứ quá tiêu cực.',
    advice: 'Giữ vững niềm tin, tương lai tươi sáng đang chờ đợi bạn phía trước.'
  },
  {
    id: 'sun',
    name: 'The Sun',
    vietnameseName: 'XIX - The Sun (Mặt Trời)',
    arcana: 'major',
    keywords: ['Rạng rỡ', 'Thành công', 'Hạnh phúc', 'Năng lượng'],
    element: 'Lửa',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m19.jpg',
    uprightMeaning: 'Trạng thái ngập tràn niềm vui, sức sống và may mắn. Mọi nghi ngờ được xua tan dưới ánh nắng rực rỡ.',
    reversedMeaning: 'Thành công bị chậm trễ một chút, hoặc bạn đang quá lo lắng không cần thiết.',
    advice: 'Hãy đón nhận niềm vui và lan tỏa năng lượng tích cực đến mọi người.'
  },
  {
    id: 'world',
    name: 'The World',
    vietnameseName: 'XXI - The World (Thế Giới)',
    arcana: 'major',
    keywords: ['Hoàn thành', 'Trọn vẹn', 'Thành tựu', 'Hành trình mới'],
    element: 'Đất',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m21.jpg',
    uprightMeaning: 'Mục tiêu đã được hoàn thành trọn vẹn. Bạn đã sẵn sàng khép lại chương cũ để bước sang trang mới rực rỡ hơn.',
    reversedMeaning: 'Thiếu bước cuối cùng để về đích, hoặc lưu giam mình trong những tiếc nuối cũ.',
    advice: 'Tự hào về những gì đã trải qua và sẵn sàng cho những mục tiêu cao xa hơn.'
  },
  {
    id: 'queen_of_cups',
    name: 'Queen of Cups',
    vietnameseName: 'Queen of Cups (Nữ Hoàng Cốc)',
    arcana: 'minor',
    suit: 'cups',
    keywords: ['Cảm xúc sâu sắc', 'Trực giác', 'Lòng trắc ẩn', 'Nhạy cảm'],
    element: 'Nước',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/c13.jpg',
    uprightMeaning: 'Trái tim tràn ngập tình yêu thương và sự thấu hiểu sâu sắc.',
    reversedMeaning: 'Tâm thế bất ổn, thiếu an toàn hoặc phụ thuộc cảm xúc quá mức.',
    advice: 'Hãy yêu thương bản thân và làm chủ cảm xúc nội tại.'
  },
  {
    id: 'eight_of_pentacles',
    name: 'Eight of Pentacles',
    vietnameseName: 'Eight of Pentacles (8 Tiền)',
    arcana: 'minor',
    suit: 'pentacles',
    keywords: ['Nỗ lực', 'Đầu tư tâm sức', 'Chăm chỉ', 'Rèn luyện'],
    element: 'Đất',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/p08.jpg',
    uprightMeaning: 'Sự kiên trì rèn luyện và xây dựng nền móng vững chắc.',
    reversedMeaning: 'Thiếu cam kết, thiếu nỗ lực hoặc chưa thực sự đầu tư tâm sức.',
    advice: 'Hãy nghiêm túc và có trách nhiệm với lựa chọn của mình.'
  },
  {
    id: 'five_of_wands',
    name: 'Five of Wands',
    vietnameseName: 'Five of Wands (5 Gậy)',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['Cọ xát', 'Xung đột nhẹ', 'Cạnh tranh', 'Thử thách'],
    element: 'Lửa',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/w05.jpg',
    uprightMeaning: 'Sự cọ xát và quan điểm trái chiều tạo nên động lực phát triển.',
    reversedMeaning: 'Né tránh xung đột, kìm nén bất đồng khiến mâu thuẫn âm ỉ.',
    advice: 'Hãy thẳng thắn đối thoại để giải quyết triệt để nút thắt.'
  },
  {
    id: 'six_of_swords',
    name: 'Six of Swords',
    vietnameseName: 'Six of Swords (6 Kiếm)',
    arcana: 'minor',
    suit: 'swords',
    keywords: ['Chuyển giao', 'Rời xa giông bão', 'Chữa lành', 'Hướng đi mới'],
    element: 'Khí',
    image: 'https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/s06.jpg',
    uprightMeaning: 'Vượt qua sóng gió để tìm về bình yên.',
    reversedMeaning: 'Bắc kẹt trong quá khứ, chưa thể buông bỏ những tổn thương cũ.',
    advice: 'Hãy sẵn sàng bước đi để đón nhận hành trình êm đềm phía trước.'
  }
];
