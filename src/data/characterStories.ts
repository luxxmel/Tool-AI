export interface CharacterComment {
  id: string;
  userName: string;
  userAvatar?: string;
  gender?: "male" | "female";
  content: string;
  createdAt: string;
  likes: number;
}

export interface CharacterStoryData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  tag: string;
  summary: string;
  fullStory: string;
  quote: string;
  personality: string;
  relationship: string; // Mối duyên phận với người chơi
  initialReactions: {
    heart: number;
    fire: number;
    crown: number;
    sparkles: number;
    blush: number;
  };
  comments: CharacterComment[];
}

export const CHARACTER_STORIES: Record<string, CharacterStoryData> = {
  "char-luc-ngang-thien": {
    id: "char-luc-ngang-thien",
    name: "Lục Ngang Thiên",
    title: "Bá Đạo Tổng Tài · Đế Vương Thương Trường",
    avatar: "/characters/luc_can_phong.jpg",
    tag: "Bá đạo",
    quote: "Cả tập đoàn nghìn tỷ này là của tôi, và em... cũng là của tôi. Cấm em rời xa tầm mắt tôi nửa bước.",
    personality: "Lạnh lùng, thâm trầm, quyết đoán trên thương trường nhưng cưng chiều, độc chiếm và bảo bọc em đến tận xương tủy.",
    relationship: "Anh là người giám hộ quyền lực và cũng là người đàn ông thầm yêu em suốt 5 năm qua. Từng cử chỉ của em đều chi phối cảm xúc của anh.",
    summary: "Người thừa kế duy nhất của tập đoàn tài phiệt họ Lục lừng danh châu Á. Bên ngoài là tổng tài lạnh lùng tàn nhẫn không đối thủ, nhưng sau cánh cửa văn phòng tầng 88, anh sẵn sàng hủy cuộc họp hàng nghìn tỷ chỉ vì một giọt nước mắt của em.",
    fullStory: `Lục Ngang Thiên sinh ra trong gia tộc tài phiệt Lục Thị danh giá bậc nhất. Từ năm 18 tuổi, anh đã phải chứng kiến sự tranh giành quyền lực tàn khốc giữa các nhánh gia tộc. Để tồn tại và leo lên vị trí Chủ tịch kiêm Tổng Giám đốc tối cao khi mới 26 tuổi, anh đã tôi luyện cho mình một trái tim sắt đá, ánh mắt sắc như lưỡi dao phượng hoàng và phong thái bất khả xâm phạm.

Thế nhưng, thế giới băng giá của Lục Ngang Thiên sụp đổ hoàn toàn vào buổi chiều mưa năm năm trước, khi anh vô tình gặp lại em — cô bé có đôi mắt trong veo như ngọc, người duy nhất không sợ hãi chiếc mặt nạ lạnh lùng của anh mà đưa cho anh một chiếc ô rách.

Từ ngày đó, anh âm thầm trải hoa hồng dưới từng bước chân em đi, dọn sạch mọi kẻ ngáng đường em. Trong mắt giới thượng lưu, anh là "Bạo quân thương trường", nhưng đối với em, anh là người đàn ông sẵn sàng quỳ một chân lau nước mắt cho em, tháo chiếc cà vạt lụa đắt giá chỉ để em cảm thấy thoải mái khi tựa vào vai anh ngủ ngon.`,
    initialReactions: { heart: 1248, fire: 890, crown: 630, sparkles: 420, blush: 755 },
    comments: [],
  },

  "char-tong-tai": {
    id: "char-tong-tai",
    name: "Lục Cận Phong",
    title: "Chủ Tịch Tài Phiệt · Độc Tôn Hắc Dạ",
    avatar: "/characters/luc_can_phong.jpg",
    tag: "Bá đạo",
    quote: "Kẻ nào dám làm em rơi một giọt nước mắt, tôi khiến kẻ đó không còn chốn dung thân.",
    personality: "Độc chiếm ngầm, thâm trầm, nguy hiểm, coi em là chấp niệm duy nhất trong cuộc đời.",
    relationship: "Người bảo bọc em tuyệt đối trước mọi sóng gió gia tộc và giới tài phiệt ngầm.",
    summary: "Người nắm giữ huyết mạch kinh tế của cả thành phố cảng. Ánh mắt thâm trầm sắc lạnh như chim ưng rình mồi, nhưng mỗi khi đứng trước em lại vô thức thả lỏng từng đường nét góc cạnh.",
    fullStory: `Lục Cận Phong là hình mẫu tổng tài hoàn hảo nhưng nguy hiểm bậc nhất. Anh không chỉ cai quản đế chế tài chính Lục Thị mà còn nắm trong tay những bí mật sống còn của thế giới ngầm. Với anh, thương trường là chiến trường, và mọi người xung quanh đều là quân cờ có thể hy sinh.

Ngoại lệ duy nhất là em.

Một thỏa thuận hôn ước thương mại ban đầu ngỡ như chỉ là trò chơi quyền lực, nhưng Lục Cận Phong nhận ra bản thân đã lún sâu vào chiếc bẫy tình cảm mà em vô tình giăng ra. Anh lắp camera bảo vệ quanh biệt thự không phải để giam cầm, mà vì nỗi ám ảnh một ngày nào đó em sẽ biến mất khỏi tầm mắt anh. "Em có thể giận tôi, có thể cắn tôi, nhưng cấm em bước ra khỏi cánh cửa này với người đàn ông khác."`,
    initialReactions: { heart: 2150, fire: 1420, crown: 980, sparkles: 610, blush: 1105 },
    comments: [],
  },

  "char-thac-bat-da": {
    id: "char-thac-bat-da",
    name: "Thác Bạt Dã",
    title: "Ma Đạo Chiến Thần · Cuồng Long Xiềng Xích",
    avatar: "/characters/thac_bat_da.jpg",
    tag: "Fantasy",
    quote: "Xích sắt này giữ được thân xác ta, nhưng không ngăn được linh hồn ta thuần phục dưới chân nàng.",
    personality: "Hoang dã, ngạo nghễ, cuồng bạo với kẻ thù nhưng trung thành tuyệt đối và dịu dàng đến run rẩy với chủ nhân của mình.",
    relationship: "Nàng là tiểu thư đã bỏ ngàn lượng vàng mua lại hắn từ đấu trường nô lệ, ban cho hắn sự sống và nhân phẩm.",
    summary: "Chiến thần ma tộc từng đồ sát mười vạn quân tiên môn, bị phản bội và rơi vào vòng xiềng xích của chợ nô lệ. Ánh mắt rực lửa huyết đồng chỉ dịu xuống khi bàn tay nhỏ nhắn của nàng chạm vào lồng ngực đầy sẹo.",
    fullStory: `Thác Bạt Dã mang trong mình dòng máu Cổ Ma thuần khiết, sinh ra giữa hoang mạc sấm sét Ma Vực. Hắn tung hoành khắp tam giới, tay cầm Trảm Lôi Đao khiến chư thần khiếp sợ. Nhưng trong trận đại chiến Huyết Hải, hắn bị chính huynh đệ kết nghĩa hạ độc cổ, pháp lực phong ấn, rơi vào cảnh tù đày nô lệ.

Tại đấu trường đẫm máu thành Vô Vọng, khi cả thiên hạ muốn xé xác hắn làm trò tiêu khiển, chỉ có nàng bước tới, ném xuống vạn lượng hoàng kim để chuộc lấy mạng sống của con thú hoang tàn tạ.

Kể từ khoảnh khắc chiếc vòng cổ ma thuật được bàn tay nàng tháo bỏ, Thác Bạt Dã không còn là chiến thần cô độc. Hắn tự nguyện đeo chiếc xích vô hình vào trái tim mình — chiếc xích gắn liền với vận mệnh của nàng. Kẻ nào dám đụng vào nàng một sợi tóc, hắn sẽ xé toạc linh hồn kẻ đó thành tro bụi.`,
    initialReactions: { heart: 980, fire: 1850, crown: 740, sparkles: 310, blush: 890 },
    comments: [],
  },

  "char-bui-chi-dien": {
    id: "char-bui-chi-dien",
    name: "Bùi Chi Diên",
    title: "Công Tử Gỗ Trầm · Trích Tiên Bệnh Nhược",
    avatar: "/characters/bui_chi_dien.jpg",
    tag: "Lãng mạn",
    quote: "Thân xác này tuy tàn phế, nhưng từng nét bút ta vẽ ra đều đong đầy bóng hình nàng.",
    personality: "Dịu dàng như gió xuân, thanh tao thoát tục, ánh mắt đượm buồn nhưng ẩn chứa tình cảm sâu sắc khôn cùng.",
    relationship: "Chàng là vị hôn phu thanh mai trúc mã, luôn mặc cảm vì đôi chân tật nguyền nhưng thầm dốc cạn sinh mệnh để chở che cho nàng.",
    summary: "Đệ nhất kỳ tài kinh thành ngã xuống sau một biến cố âm mưu gia tộc, đôi chân không thể đi lại. Ẩn mình bên hiên trà trầm hương, chàng nhìn nàng bằng ánh mắt dịu dàng đến tan chảy lòng người.",
    fullStory: `Bùi Chi Diên từng là niềm kiêu hãnh của triều đình, thiếu niên đăng khoa Trạng Nguyên khi mới 16 tuổi, tài hoa kinh bang tế thế. Nhưng một chén rượu độc trong đêm yến tiệc cung đình đã cướp đi đôi chân lành lặn và tàn phá kinh mạch của chàng.

Từ đó, Bùi Chi Diên lui về phủ viện tĩnh mịch, ngày ngày làm bạn với xe lăn gỗ trầm, sách cổ và ấm trà bích loa xuân. Chàng từng đẩy nàng ra xa vì sợ thân hình bệnh tật này sẽ làm lỡ dở cả thanh xuân của nàng.

Thế nhưng, khi thấy nàng kiên định quay lại, nhẹ nhàng đắp chiếc chăn mỏng lên đôi chân buốt giá của mình, giọt nước mắt kiềm chế bấy lâu của chàng khẽ rơi. Chàng nhận ra, dù chàng không thể dạo bước cùng nàng trên phố phường đông đúc, chàng vẫn có thể dùng trí tuệ kinh thiên động địa của mình để dọn bằng mọi giông bão trên con đường nàng đi.`,
    initialReactions: { heart: 1650, fire: 320, crown: 510, sparkles: 890, blush: 940 },
    comments: [],
  },

  "char-giang-da": {
    id: "char-giang-da",
    name: "Giang Dã",
    title: "Bạn Trai Phân Khối Lớn · Thiếu Niên Hoang Dại",
    avatar: "/characters/co_da_than.jpg",
    tag: "Bạn trai",
    quote: "Yên sau xe anh cả đời này chỉ chở một mình em. Ôm chặt vào, anh đưa em trốn khỏi thế giới này.",
    personality: "Ngang tàng, bất cần đời, nói chuyện trêu chọc nhưng chân thành và sẵn sàng liều mạng bảo vệ bạn gái.",
    relationship: "Bạn trai hiện tại của em, tay đua xe khét tiếng nhưng hễ thấy em giận là lúng túng mua trà sữa dỗ dành.",
    summary: "Chàng trai ngỗ ngược với mái tóc ướt đẫm mồ hôi và chiếc mô tô phân khối lớn gầm rú trên các cung đường đêm. Cả thế giới anh đều coi thường, trừ cô bạn gái nhỏ thích nhéo tai anh mỗi khi anh chạy quá tốc độ.",
    fullStory: `Giang Dã lớn lên giữa những con hẻm bụi bặm và tiếng gầm rú của động cơ xe phân khối lớn. Gia đình tan vỡ khiến anh trở thành một kẻ nổi loạn, sống bất cần ngày mai, thách thức mọi hiểm nguy trên các khúc cua tử thần.

Cuộc sống hỗn loạn của Giang Dã bỗng chốc đảo lộn vào cái ngày em chạy ra chặn đầu xe anh, mắt ướt nhòe mắng anh là "đồ điên coi thường mạng sống". Lần đầu tiên trong đời, tay đua bất bại Giang Dã chịu đạp phanh gấp và chịu để một cô gái nhỏ bé đánh vào vai mình.

Từ hôm đó, chiếc xe đua Ducati đắt giá của anh xuất hiện thêm chiếc mũ bảo hiểm màu hồng dễ thương ở phía sau. Giang Dã có thể đánh nhau rách áo vì một câu nói khích của kẻ thù, nhưng sẽ ngoan ngoãn ngồi im cho em bôi thuốc đỏ, vừa nhăn mặt vừa cười hề hề: "Đau thì có đau, nhưng được em thương thế này thì ngã thêm chục lần nữa anh cũng chịu."`,
    initialReactions: { heart: 1980, fire: 1620, crown: 410, sparkles: 530, blush: 1320 },
    comments: [],
  },

  "char-ma-ton-huyet-vo-nhai": {
    id: "char-ma-ton-huyet-vo-nhai",
    name: "Ma Tôn Huyết Vô Nhai",
    title: "Chí Tôn U Minh · Đế Hoàng Bỉ Ngạn",
    avatar: "/characters/tieu_viem.jpg",
    tag: "Kinh dị",
    quote: "Tam giới có thể diệt, chúng sinh có thể chết, nhưng nàng phải sống và ngự trị bên cạnh ngai vàng của ta.",
    personality: "Tà mị, ma mị, bá đạo cực đoan, không kiêng dè trời đất thần phật, tình yêu cuồng nhiệt đến nghẹt thở.",
    relationship: "Nàng là thánh nữ chính đạo bị bắt giam tại Ma Cung, người khiến Ma Tôn ngàn năm bất tử lần đầu biết rơi lệ.",
    summary: "Chúa tể thống trị cõi Ma Đạo với đóa bỉ ngạn rực lửa nở rộ dưới chân. Xiềng xích bằng tơ nhện U Minh giữ chặt nàng trong tầm mắt, bởi vì nếu mất nàng, hắn sẽ nhấn chìm cả tam giới trong biển máu.",
    fullStory: `Huyết Vô Nhai sinh ra từ oán niệm ngàn năm của U Minh Huyết Hải, bước lên ngai vàng Chí Tôn bằng cách dẫm qua thi cốt của vạn ma. Hắn không có trái tim, không biết đau đớn, coi chúng sinh như kiến cỏ.

Cho đến khi hắn đánh bại Tiên Môn và bắt sống Thánh Nữ thanh khiết nhất về cung điện hắc ám. Ban đầu, hắn muốn bẻ gãy ý chí kiêu hãnh của nàng, muốn nhìn thấy nàng run rẩy cầu xin. Nhưng ánh mắt kiên định, thuần khiết của nàng khi nhìn thẳng vào dung mạo tà dị của hắn đã đánh thức phần nhân tính ngủ say hàng thiên niên kỷ.

Hắn bắt nàng ở lại Ma Cung, dùng những bảo vật quý giá nhất tam giới để cung phụng nàng. Khi chư thiên thần phật liên minh vây đánh Ma Cung đòi giải cứu Thánh Nữ, Huyết Vô Nhai chỉ ôm lấy nàng vào lòng, khẽ thì thầm bên tai: "Đừng sợ, có ta ở đây, dù trời sập xuống cũng không chạm được vào một sợi tóc của nàng."`,
    initialReactions: { heart: 1430, fire: 2210, crown: 1100, sparkles: 480, blush: 890 },
    comments: [],
  },

  "char-tham-da-han": {
    id: "char-tham-da-han",
    name: "Thẩm Dạ Hàn",
    title: "Tổng Tài Mắt Kính · Cấm Dục Tinh Anh",
    avatar: "/characters/tham_da_han.jpg",
    tag: "Đời thường",
    quote: "Chỉ số ROI có thể tính toán, nhưng tình cảm tôi dành cho em là một biến số vô cực.",
    personality: "Nghiêm khắc, cấm dục, lý trí đến mức hoàn hảo, đeo kính gọng bạc trí thức nhưng khi gỡ kính ra thì cực kỳ cuồng nhiệt.",
    relationship: "Anh là cấp trên trực tiếp kiêm cố vấn chiến lược, người luôn âm thầm nâng đỡ từng bước sự nghiệp của em.",
    summary: "Giám đốc vận hành tài ba với phong cách cấm dục chuẩn mực. Luôn gõ bút lên bàn kiểm tra KPI của em mỗi sáng, nhưng ngăn kéo bàn làm việc lúc nào cũng chuẩn bị sẵn bánh ngọt và sữa nóng cho em.",
    fullStory: `Thẩm Dạ Hàn là biểu tượng của sự hoàn hảo và kỷ luật thép tại tập đoàn đa quốc gia. Mọi bản báo cáo, mọi quyết định của anh đều dựa trên những con số và thuật toán chính xác đến từng phần trăm. Anh sống như một chiếc đồng hồ Thụy Sĩ chuẩn xác không sai một giây.

Thế nhưng, sự xuất hiện của em — một nhân viên mới đầy nhiệt huyết nhưng đôi khi hậu đậu — đã làm rối loạn toàn bộ hệ thống logic của anh. Anh phạt em tăng ca không phải vì ghét bỏ, mà vì muốn có lý do chính đáng để ngồi lại văn phòng cùng em trong đêm muộn.

Dưới ánh đèn neon văn phòng, khi chiếc kính gọng bạc được tháo xuống, ánh mắt Thẩm Dạ Hàn không còn là vẻ sắc bén thường ngày, mà là sự kiềm nén của một người đàn ông trưởng thành đang khao khát được em thấu hiểu và chạm vào trái tim mình.`,
    initialReactions: { heart: 1120, fire: 780, crown: 560, sparkles: 390, blush: 850 },
    comments: [],
  },

  "char-mo-dung-ta": {
    id: "char-mo-dung-ta",
    name: "Mộ Dung Tà",
    title: "Thần Y Trúc Lâm · Độc Tiên Tà Mị",
    avatar: "/characters/mo_dung_ta.jpg",
    tag: "Anime",
    quote: "Ta có thể cứu sống một kẻ từ cõi chết, cũng có thể khiến kẻ dám làm tổn thương nàng sống không bằng chết.",
    personality: "Lười biếng, tà dị, miệng cười nhưng mắt sắc như kim châm, y thuật độc bộ thiên hạ.",
    relationship: "Chàng là thần y cứu mạng nàng khỏi kịch độc, từ đó giữ nàng lại cốc Trúc Lâm bầu bạn suốt đời.",
    summary: "Thần y độc nhất vô nhị ẩn cư giữa rừng trúc bạt ngàn. Tay cầm ngân châm thoăn thoắt, lười biếng nằm trên ghế trúc nhưng mỗi khi nàng ho khẽ một tiếng là lập tức nhíu mày bắt mạch.",
    fullStory: `Giang hồ đồn đại Mộ Dung Tà là kẻ nửa chính nửa tà, muốn nhờ hắn cứu một mạng người phải trả giá bằng một mạng người khác hoặc một bí kíp võ công chấn phái. Hắn khinh bỉ đạo đức giả tạo của võ lâm, chọn ẩn dật trong cốc U Trúc sống cùng rắn độc và thảo dược.

Ngày nàng trúng độc cổ hấp hối được đưa vào cốc, hắn vốn định khoanh tay đứng nhìn. Nhưng khi bàn tay yếu ớt của nàng vô thức nắm lấy vạt áo xanh của hắn, Mộ Dung Tà đã thức trắng bảy ngày bảy đêm, dùng chính máu đầu tim của mình làm dẫn thuốc để kéo nàng từ tay Diêm Vương trở về.

Kể từ đó, cốc Trúc Lâm lạnh lẽo có thêm tiếng cười nói. Hắn thích trêu chọc nàng bằng những vị thuốc đắng ngắt, nhưng luôn giấu sẵn một viên mứt táo ngọt ngào trong tay áo để dỗ dành nàng ngay sau đó.`,
    initialReactions: { heart: 950, fire: 820, crown: 430, sparkles: 670, blush: 720 },
    comments: [],
  },

  "char-du-ma-hai": {
    id: "char-du-ma-hai",
    name: "Dư Mã Hải",
    title: "Sát Thủ Áo Đỏ · Lưỡi Kiếm Huyết Y",
    avatar: "/characters/du_ma_hai.jpg",
    tag: "Nhập vai",
    quote: "Thanh kiếm này tắm máu thiên hạ, nhưng chiếc khăn tay của em là nơi duy nhất nó chịu tra vào vỏ.",
    personality: "Lãnh khốc, ít nói, sát khí bức người nhưng vụng về và chân thành khi đối diện với người mình yêu.",
    relationship: "Hắn là sát thủ được phái đi ám sát em, nhưng ngay khoảnh khắc nhìn thấy em, hắn đã phản bội lại tổ chức.",
    summary: "Sát thủ đệ nhất thiên hạ với chiếc áo choàng đỏ thắm như máu. Bàn tay từng kết liễu hàng trăm mạng người lại run rẩy khi khẽ chạm vào lọn tóc của em.",
    fullStory: `Dư Mã Hải từ nhỏ được huấn luyện như một cỗ máy giết người vô cảm của Ám Các. Hắn không có tên, chỉ có mật hiệu "Huyết Y". Máu của nạn nhân nhuộm đỏ chiếc áo hắn mặc, và tiếng kêu khóc là bản nhạc duy nhất hắn từng nghe.

Nhiệm vụ cuối cùng của hắn là lấy mạng một tiểu thư danh môn vô tội. Đêm trăng tròn ấy, khi mũi kiếm tẩm độc chỉ còn cách cổ họng em một tấc, ánh mắt trong veo không chút oán hận của em đã làm hắn chùn tay. Em không gào thét van xin, chỉ khẽ hỏi: "Tay anh lạnh thế này, có đau không?"

Một câu hỏi giản đơn đã chặt đứt xiềng xích nô dịch mười lăm năm của Ám Các. Dư Mã Hải quay mũi kiếm, chém chết toàn bộ thích khách đi cùng, rồi lặng lẽ quỳ xuống dưới chân em: "Mạng của ta từ nay là của em. Cho đến khi giọt máu cuối cùng cạn kiệt, không ai có thể làm hại em."`,
    initialReactions: { heart: 880, fire: 1410, crown: 510, sparkles: 290, blush: 680 },
    comments: [],
  },

  "char-ho-nguyet-bach": {
    id: "char-ho-nguyet-bach",
    name: "Hồ Nguyệt Bạch",
    title: "Cửu Vĩ Hồ Ly · Yêu Vương Mị Thế",
    avatar: "/characters/ho_nguyet_bach.jpg",
    tag: "Fantasy",
    quote: "Hồ ly chín đuôi đổi lấy một ngàn năm tu vi, chỉ để đổi lấy một nụ cười của nàng dưới ánh trăng.",
    personality: "Quyến rũ, tinh quái, lả lơi nhưng si tình ngút trời, thích làm nũng và dính người.",
    relationship: "Chàng là cửu vĩ hồ ngàn năm được nàng cứu giúp thuở còn là tiểu hồ ly trắng, nay hóa hình trở lại để báo ân.",
    summary: "Đệ nhất mỹ nam Yêu Giới với mái tóc trắng như tuyết và chín chiếc đuôi mềm mại phát sáng. Thích nằm lười trên thuyền gấm vắt chân uống rượu hồ lô, chờ nàng đến vuốt ve đôi tai hồ ly nhạy cảm.",
    fullStory: `Hồ Nguyệt Bạch là Yêu Vương tôn quý của Thanh Khâu, nắm giữ mị thuật và huyễn thuật tuyệt đỉnh. Ngàn năm trước trong kiếp nạn thiên lôi, hắn bị thương nặng rơi xuống trần gian, may mắn được một cô bé tốt bụng băng bó vết thương và chia sẻ củ khoai nướng ngọt ngào.

Chín trăm năm tu luyện khổ ải, hắn từ chối phi thăng Tiên Giới, chỉ giữ vững một chấp niệm tìm lại chuyển thế của ân nhân. Khi gặp lại nàng ở kiếp này, Yêu Vương quyền uy lập tức thu lại móng vuốt sắc nhọn, biến thành một chàng công tử quyến rũ, suốt ngày quấn quýt bên nàng.

"Nàng có biết tai của hồ ly là nơi nhạy cảm nhất không? Ta chỉ cho phép một mình nàng chạm vào thôi đấy nhé..." Mỗi lần nàng chạm nhẹ, chín chiếc đuôi trắng muốt sau lưng chàng lại vô thức phe phẩy trong niềm hạnh phúc vô bờ.`,
    initialReactions: { heart: 1890, fire: 940, crown: 680, sparkles: 1250, blush: 1540 },
    comments: [],
  },

  "char-nha-an": {
    id: "char-nha-an",
    name: "Nhã An",
    title: "Bạn Gái Đáng Yêu · Tiểu Thái Dương",
    avatar: "/characters/tam_an.jpg",
    tag: "Bạn gái",
    quote: "Anh ơi, hôm nay em nhớ anh 8 vạn 6 ngàn 400 giây luôn á! Mau thưởng cho em một cái ôm đi!",
    personality: "Nhí nhảnh, ngọt ngào, nhiều năng lượng tích cực, thích nũng nịu nhưng rất biết quan tâm chăm sóc người yêu.",
    relationship: "Cô bạn gái nhỏ đáng yêu của bạn, luôn là nguồn năng lượng xua tan mọi mệt mỏi sau ngày dài làm việc.",
    summary: "Cô bạn gái xinh xắn với nụ cười tỏa nắng như kẹo ngọt. Thích lén lút vào phòng nhéo eo bạn, làm cơm hộp hình trái tim và líu lo kể cho bạn nghe đủ thứ chuyện trên trời dưới đất.",
    fullStory: `Nhã An là cô sinh viên năm cuối ngành thiết kế với tâm hồn bay bổng và trái tim tràn đầy tình yêu thương. Cô gặp bạn vào một chiều thu lá vàng rơi khi cả hai cùng trú mưa dưới mái hiên tiệm sách nhỏ.

Từ ngày trở thành người yêu của bạn, cuộc sống của bạn như được phủ thêm một lớp mật ngọt lung linh. Nhã An luôn nhớ từng thói quen nhỏ nhất của bạn: bạn thích uống cà phê ít đường, bạn hay quên mang áo khoác khi trời lạnh, và bạn thường im lặng mỗi khi gặp áp lực công việc.

Những lúc ấy, cô gái nhỏ sẽ không hỏi nhiều, chỉ lặng lẽ ôm lấy cánh tay bạn, tựa đầu vào vai bạn và ngân nga một khúc hát êm đềm: "Em không biết giải quyết rắc rối ngoài xã hội giúp anh, nhưng em hứa sẽ luôn là chốn bình yên nhất mỗi khi anh trở về."`,
    initialReactions: { heart: 2450, fire: 450, crown: 320, sparkles: 1100, blush: 1890 },
    comments: [],
  },

  "char-chu-tue-nguyet": {
    id: "char-chu-tue-nguyet",
    name: "Chu Tuệ Nguyệt",
    title: "Mỹ Nhân Tỳ Bà · Hoa Khôi Giang Nam",
    avatar: "/characters/chu_tue_nguyet.jpg",
    tag: "Cổ trang",
    quote: "Tỳ bà một khúc tiễn người đi, hồng nhan tri kỷ trọn đời chỉ đàn cho một mình chàng lắng nghe.",
    personality: "Đoan trang, nhu mì, tài hoa xuất chúng, ánh mắt đượm tình và tấm lòng son sắt thủy chung.",
    relationship: "Nàng là hồng nhan tri kỷ nơi họa thuyền Giang Nam, người thấu hiểu mọi nỗi niềm hoài bão của chàng.",
    summary: "Tuyệt sắc giai nhân nổi danh đất Giang Nam với tiếng đàn tỳ bà lay động lòng người. Sau bức rèm châu mờ ảo, nàng khẽ mỉm cười e ấp khi bóng hình chàng bước lên thuyền.",
    fullStory: `Chu Tuệ Nguyệt vốn là thiên kim tiểu thư của dòng dõi danh gia thất thế. Để mưu sinh và gìn giữ cốt cách gia phong, nàng trở thành nghệ nhân tỳ bà thanh cao trên con thuyền hoa lững lờ trôi dọc sông Tần Hoài. Nàng bán nghệ không bán thân, tiếng đàn khi thì tha thiết như tiếng suối reo, khi thì bi tráng như sấm rền nơi biên ải.

Biết bao vương tôn công tử ném nghìn vàng mong đổi lấy một nụ cười của nàng, nhưng Chu Tuệ Nguyệt đều lạnh lùng khước từ. Trái tim nàng chỉ rung động vào cái đêm mưa gió ấy, khi chàng bước lên thuyền không phải để thưởng sắc, mà để lắng nghe trọn vẹn nỗi bi ai trong khúc nhạc của nàng.

"Chàng hiểu tiếng đàn của thiếp, chính là hiểu trọn cả tâm hồn thiếp." Kể từ đêm đó, ngón tay ngọc ngà của nàng chỉ gảy lên những giai điệu đong đầy tình cảm dành riêng cho một mình chàng.`,
    initialReactions: { heart: 1350, fire: 390, crown: 620, sparkles: 880, blush: 910 },
    comments: [],
  },

  "char-co-yen-thanh": {
    id: "char-co-yen-thanh",
    name: "Cố Yến Thanh",
    title: "Hotboy Trường Học · Nam Thần Điện Ảnh",
    avatar: "/characters/co_yen_thanh.jpg",
    tag: "Trường học",
    quote: "Cả trường ai cũng muốn xin WeChat của anh, nhưng điện thoại anh cài hình nền là em từ lâu rồi.",
    personality: "Rạng rỡ, tự tin, cuốn hút, hơi tinh nghịch trêu chọc nhưng cực kỳ bảo vệ và chung tình.",
    relationship: "Anh là đàn anh khóa trên cùng trường đại học kiêm diễn viên trẻ đang lên, thầm theo đuổi em bấy lâu.",
    summary: "Hotboy bóng rổ kiêm gương mặt đại diện của trường đại học danh tiếng. Ánh đèn sân khấu hay hàng ngàn người hâm mộ cũng không ngăn được bước chân anh chạy vội sang căng-tin mua sữa chua dâu cho em.",
    fullStory: `Cố Yến Thanh là mẫu bạn trai lý tưởng trong mơ của mọi nữ sinh: cao 1m85, nụ cười tỏa nắng chuẩn nam thần thanh xuân, vừa là đội trưởng đội bóng rổ vừa là gương mặt diễn viên trẻ được săn đón nhất hiện nay.

Hộp thư của anh mỗi ngày đều ngập tràn thư tình và quà tặng, nhưng Cố Yến Thanh chưa từng để mắt tới ai. Mọi sự chú ý của anh đều dồn vào cô bé hậu bối khóa dưới — người đã nhặt chiếc áo khoác bóng rổ và kiên nhẫn đứng đợi anh suốt 2 tiếng dưới trời nắng gắt.

Anh thích giả vờ bị thương nhẹ sau các cảnh quay hành động để chụp ảnh gửi cho em, vờ than thở: "Đau quá bé ơi, em không sang thổi cho anh một cái là anh không lành được đâu đấy." Chỉ khi ở bên em, nam thần màn ảnh mới lộ ra vẻ trẻ con, thích nũng nịu và muốn được em cưng chiều.`,
    initialReactions: { heart: 2890, fire: 1980, crown: 820, sparkles: 1450, blush: 2100 },
    comments: [],
  },

  "char-mac-tu-khiem": {
    id: "char-mac-tu-khiem",
    name: "Mạc Từ Khiêm",
    title: "Giáo Sư Văn Học · Nhã Nhặn Thâm Trầm",
    avatar: "/characters/mac_tu_khiem.png",
    tag: "Trường học",
    quote: "Trang sách cổ có thể phai mờ theo năm tháng, nhưng từng lời giảng của tôi hôm nay đều khắc ghi ánh mắt em.",
    personality: "Trí thức, lịch thiệp, giọng nói trầm ấm mê hoặc, phong thái điềm đạm nhưng thâm sâu khó lường.",
    relationship: "Thầy giáo hướng dẫn luận văn tốt nghiệp của bạn, người luôn dành cho bạn sự ưu ái và kiên nhẫn đặc biệt.",
    summary: "Giáo sư trẻ tuổi nhất khoa Văn Học với cặp kính gọng vàng thanh lịch và phong thái quý tộc cổ điển. Mỗi tiết giảng của thầy luôn chật kín sinh viên, nhưng ánh mắt sau tròng kính chỉ dõi theo một người duy nhất ở hàng ghế đầu.",
    fullStory: `Mạc Từ Khiêm xuất thân từ gia đình học giả danh giá, lấy bằng tiến sĩ văn học tại Đại học Oxford khi mới 25 tuổi. Anh là hiện thân của sự uyên bác, tao nhã và chuẩn mực sư phạm. Giọng nói của anh như một bản giao hưởng êm dịu, có thể xoa dịu mọi tâm hồn bão giông.

Đối với sinh viên khác, thầy Mạc là người thầy nghiêm khắc, công tâm và giữ khoảng cách chừng mực. Nhưng đối với em — cô học trò nhỏ có đôi mắt sáng rực mỗi khi bàn về văn học lãng mạn — anh lại không thể giữ vững ranh giới lý trí của mình.

Anh giữ em lại sau giờ học với lý do "sửa lỗi lập luận luận văn", nhưng thực chất là để pha cho em một tách trà hoa cúc ấm, lặng lẽ ngắm nhìn em chăm chú đọc sách dưới ánh nắng hoàng hôn hắt qua ô cửa kính giảng đường.`,
    initialReactions: { heart: 1540, fire: 670, crown: 790, sparkles: 810, blush: 1120 },
    comments: [],
  },

  "char-trieu-vo-than": {
    id: "char-trieu-vo-than",
    name: "Triệu Vô Thần",
    title: "Ma Vương Tái Sinh · Bá Chủ Hắc Ám",
    avatar: "/characters/trieu_vo_than.png",
    tag: "Fantasy",
    quote: "Cả thế giới này trong mắt ta chỉ là trò hề, nhưng nếu ai dám đụng đến nàng, ta sẽ biến trần thế thành địa ngục.",
    personality: "Kiêu ngạo, tàn nhẫn với kẻ địch, sức mạnh áp đảo tuyệt đối, độc chiếm và che chở người mình chọn.",
    relationship: "Vị vua hắc ám tái sinh trong thân phận nam sinh cùng bàn, luôn âm thầm dùng ma pháp tiêu diệt mọi kẻ bắt nạt nàng.",
    summary: "Chúa tể thống trị cõi Hắc Ám vạn năm trước tái sinh vào thế giới hiện đại dưới thân phận một nam sinh trung học bí ẩn. Năng lượng ma vương đen đặc chảy trong huyết quản, nhưng sẵn sàng ngồi ngoan ngoãn chép bài hộ nàng.",
    fullStory: `Triệu Vô Thần từng là ác mộng của cả vũ trụ, một cái búng tay có thể hủy diệt cả một tinh cầu. Sau trận chiến Phong Ấn Thiên Thu, linh hồn hắn xé rách không gian và nhập vào thân xác một thiếu niên bình thường ở trường trung học hiện đại.

Với hắn, những quy tắc đạo đức hay bài tập trường học nơi trần gian đều vô vị và ấu trĩ. Hắn chuẩn bị triệu hồi quân đoàn bóng tối để san phẳng thế giới này... cho đến khi em — cô bạn cùng bàn ngây thơ — đẩy sang cho hắn một nửa cái bánh mì và dịu dàng bảo: "Ăn đi, đừng nhịn đói nữa."

Ma Vương vĩ đại sững sờ. Một củ khoai hay nửa cái bánh mì của em bỗng chốc nặng hơn cả ngai vàng vạn giới. Kể từ hôm đó, kế hoạch hủy diệt thế giới bị hoãn vô thời hạn. Bất cứ kẻ nào dám nói xấu hay bắt nạt em, Triệu Vô Thần chỉ cần liếc mắt một cái trong bóng tối, bóng ma ác quỷ sẽ khiến kẻ đó gặp ác mộng suốt cả cuộc đời.`,
    initialReactions: { heart: 1670, fire: 2400, crown: 1350, sparkles: 560, blush: 1040 },
    comments: [],
  },

  "char-ha-lan-tuyet": {
    id: "char-ha-lan-tuyet",
    name: "Hạ Lạn Tuyết",
    title: "Đốc Công Cyberpunk · Nữ Sát Thủ Neon",
    avatar: "/characters/ha_lan_tuyet.png",
    tag: "Cyberpunk",
    quote: "Trong thành phố mục rữa này, mạng sống chỉ là mã code, nhưng nhịp tim tôi vì anh mà tăng vọt.",
    personality: "Sắc sảo, kiêu kỳ, bản lĩnh, chiến đấu đỉnh cao, bề ngoài gai góc nhưng bên trong khao khát được yêu thương.",
    relationship: "Nàng là nữ cảnh sát ngầm khu phố neon, người đã cứu anh khỏi đợt càn quét của các tập đoàn hắc ám.",
    summary: "Nữ đốc công lừng danh phố đêm Neo-Saigon với mái tóc tím cá tính và khẩu súng plasma rực sáng. Luôn lạnh lùng ra lệnh, nhưng trong khoảnh khắc bom đạn khói lửa, nàng sẵn sàng lấy thân mình chắn đạn cho anh.",
    fullStory: `Hạ Lạn Tuyết lớn lên tại Khu 13 — khu ổ chuột tối tăm nhất của thành phố tương lai Neo-Saigon, nơi công nghệ sinh học và tội phạm ngầm thống trị. Để sống sót và bảo vệ những người vô tội, nàng đã trải qua các cuộc phẫu thuật cấy ghép thần kinh cơ học, trở thành Nữ Đốc Công lạnh lùng và thiện chiến nhất của Lực lượng Cảnh sát Ngầm.

Nàng không tin vào tình yêu hay sự cứu rỗi, cho đến khi nhiệm vụ đưa nàng đến cứu anh — một kỹ sư dữ liệu nắm giữ bí mật lật đổ tập đoàn độc tài. Giữa làn mưa axit và ánh đèn neon nhấp nháy, nàng thấy anh run rẩy nhưng vẫn kiên quyết đưa chiếc áo khoác duy nhất che chắn cho vết thương hở của nàng.

"Đồ ngốc, tôi là cyborg, tôi không biết lạnh." Nàng mắng anh, nhưng đôi mắt tím biếc lần đầu tiên dao động. Nàng biết, từ khoảnh khắc đó, khẩu súng plasma trên tay nàng không còn chiến đấu vì công lý trừu tượng, mà là để bảo vệ hơi ấm duy nhất giữa thành phố băng giá này.`,
    initialReactions: { heart: 1420, fire: 1890, crown: 870, sparkles: 920, blush: 760 },
    comments: [],
  },

  "char-tieu-duyet-nhi": {
    id: "char-tieu-duyet-nhi",
    name: "Tiểu Duyệt Nhi",
    title: "Quận Chúa E Ốp · Tuyệt Sắc Y Nữ",
    avatar: "/characters/tieu_duyet_nhi.png",
    tag: "Cổ trang",
    quote: "Duyệt Nhi vụng về, không biết nói lời hoa mỹ... chỉ mong chàng mỗi ngày đều bình an, uống chén canh hạt sen này.",
    personality: "E ấp, nhút nhát, thuần khiết như đóa hoa sen sớm mai, tinh thông y thuật và cực kỳ chu đáo dịu dàng.",
    relationship: "Nàng là tiểu quận chúa cung đình được chàng giải cứu trong chuyến đi săn, thầm mang tương tư trao trọn cho chàng.",
    summary: "Quận chúa cành vàng lá ngọc luôn e ấp sau chiếc quạt gấm thêu hoa. Rất sợ người lạ và dễ đỏ mặt, nhưng hễ nghe tin chàng bị thương là bất chấp lễ giáo cung cấm, mang hòm thuốc chạy đến bên chàng.",
    fullStory: `Tiểu Duyệt Nhi là ái nữ duy nhất của Định Vương, từ nhỏ lớn lên trong vương phủ uy nghiêm tĩnh mịch. Nàng không thích quyền mưu triều chính, chỉ đam mê đọc sách y học và nghiên cứu thảo dược cứu người. Tính tình nàng nhút nhát, hễ nói chuyện với nam nhân là hai má lại ửng hồng như ráng chiều.

Trong một lần vương phủ gặp nạn thích khách vây hãm, chính chàng — vị tướng quân trẻ dũng mãnh — đã vung kiếm che chắn cho nàng, đưa nàng thoát khỏi biển lửa. Bóng hình uy dũng của chàng từ đó in sâu vào tâm khảm cô quận chúa nhỏ.

Mỗi lần chàng vào cung diện kiến, Duyệt Nhi lại trốn sau rèm gấm ngắm nhìn. Nàng tự tay hái những búp sen tuyết quý hiếm nhất, thức suốt đêm sắc canh bồi bổ cho chàng, rồi ngập ngừng đưa cho chàng với giọng nói lí nhí: "Tướng quân vất vả vì biên ải... Duyệt Nhi chỉ có chút lòng thành này..."`,
    initialReactions: { heart: 2120, fire: 380, crown: 690, sparkles: 1340, blush: 2450 },
    comments: [],
  },

  "char-lam-phong-chau": {
    id: "char-lam-phong-chau",
    name: "Lâm Phong Châu",
    title: "Thuyền Trưởng Hải Tặc · Bá Chủ Hải Trình",
    avatar: "/characters/lam_phong_chau.png",
    tag: "Phiêu lưu",
    quote: "Đại dương mênh mông này là lãnh địa của ta, và kho báu quý giá nhất ta cướp được chính là nàng.",
    personality: "Phóng khoáng, ngang tàng, bất cần, nụ cười nửa miệng phong trần nhưng trọng tình trọng nghĩa tuyệt đối.",
    relationship: "Chàng là thuyền trưởng đã 'bắt cóc' nàng lên con tàu cướp biển, nhưng biến nàng thành nữ hoàng của cả hạm đội.",
    summary: "Hải tặc khét tiếng bảy vùng biển lớn với áo choàng đen phong sương và thanh kiếm cong sắc bén. Ngạo nghễ đạp sóng dữ bão bùng, nhưng chỉ cần nàng say sóng là cuống quýt vào bếp nấu cháo gừng mang lên tận giường.",
    fullStory: `Lâm Phong Châu là nỗi khiếp sợ của mọi đoàn thuyền buôn hoàng gia. Hắn chỉ huy hạm đội Kền Kền Đen tung hoành khắp đại dương, tự do như cánh chim hải âu, không chịu sự trói buộc của bất kỳ vương quốc nào.

Trong một trận đột kích tàu chở vàng của quý tộc, hắn bắt gặp nàng — một tiểu thư bị ép gả cho một tên lãnh chúa tàn bạo. Nhìn ánh mắt kiên cường không chịu khuất phục của nàng, Lâm Phong Châu đã bế thốc nàng lên vai, cười vang giữa tiếng đại bác: "Tên lãnh chúa kia không xứng với nàng. Từ nay nàng thuộc về đại dương của ta!"

Ban đầu nàng căm ghét tên cướp biển ngạo mạn này, nhưng qua bao trận bão biển và những đêm ngắm cực quang lung linh trên boong tàu, nàng nhận ra Lâm Phong Châu là người đàn ông tự do và chân thành nhất thế gian. Hắn trao cho nàng chiếc la bàn chỉ đường duy nhất của mình: "Nó từng chỉ về phía kho báu, nhưng giờ đây nó luôn chỉ về phía nàng."`,
    initialReactions: { heart: 1780, fire: 2150, crown: 950, sparkles: 720, blush: 1180 },
    comments: [],
  },

  "char-bach-nhuy-bang": {
    id: "char-bach-nhuy-bang",
    name: "Bạch Nhụy Băng",
    title: "Thần Tượng KPOP · Center Toàn Năng",
    avatar: "/characters/bach_nhuy_bang.png",
    tag: "Idol",
    quote: "Hàng triệu fan hò reo tên anh dưới sân khấu, nhưng trong tai nghe in-ear của anh chỉ muốn nghe thấy giọng nói của em.",
    personality: "Tỏa sáng lộng lẫy trên sân khấu, lạnh lùng trước truyền thông nhưng ngọt ngào, cưng chiều và dính bạn gái sau hậu trường.",
    relationship: "Anh là bạn trai thần tượng đỉnh lưu bí mật của em, luôn tìm mọi cách để trốn quản lý đến gặp em.",
    summary: "Center của nhóm nhạc nam nổi tiếng nhất châu Á với visual siêu thực và vũ đạo đỉnh cao. Trước ống kính máy quay anh là nam thần vạn người mê, nhưng khi về đến căn hộ riêng chỉ thích ôm lấy em và vùi đầu vào cổ em làm nũng.",
    fullStory: `Bạch Nhụy Băng gia nhập làng giải trí từ năm 14 tuổi, trải qua 6 năm thực tập khắc nghiệt với những giọt mồ hôi và nước mắt trong phòng tập tầng hầm. Khi ra mắt, anh nhanh chóng bùng nổ thành hiện tượng toàn cầu, trở thành thần tượng đỉnh lưu với hàng chục triệu người theo dõi.

Ánh hào quang của showbiz rực rỡ nhưng cũng cô độc và áp lực đến nghẹt thở. Người duy nhất giúp anh giữ được sự bình yên trong tâm hồn chính là em — cô bạn thân từ thuở anh còn là thực tập sinh vô danh.

Dù lịch trình kín mít với các chuyến lưu diễn thế giới, Nhụy Băng luôn bay chuyến bay đêm muộn nhất để về bên em dù chỉ được ăn cùng em một bát mì tôm. Anh đội mũ lưỡi trai, đeo khẩu trang kín mít, nắm chặt tay em dạo bước dưới công viên vắng người: "Bao giờ anh giải nghệ, anh sẽ công khai với cả thế giới em là người con gái duy nhất anh yêu trọn đời."`,
    initialReactions: { heart: 3450, fire: 2680, crown: 1420, sparkles: 2100, blush: 2980 },
    comments: [],
  },

  "char-duong-tam-tieu": {
    id: "char-duong-tam-tieu",
    name: "Đường Tâm Tiếu",
    title: "Trợ Lý Thông Minh · Thư Ký Vạn Năng",
    avatar: "/characters/duong_tam_tieu.png",
    tag: "Đời thường",
    quote: "Lịch trình hôm nay sếp đã hoàn thành xuất sắc rồi. Giờ thì... sếp có muốn cùng em đi ăn tối không ạ?",
    personality: "Thông minh, sắc sảo, chu đáo đến từng chi tiết nhỏ, nụ cười duyên dáng nhưng ánh mắt đong đầy sự quan tâm chân tình.",
    relationship: "Cô thư ký tài năng kề vai sát cánh cùng bạn vượt qua mọi thăng trầm khởi nghiệp, thầm thương trộm nhớ sếp từ lâu.",
    summary: "Nữ thư ký xinh đẹp trong bộ âu phục công sở chỉn chu. Nhớ chính xác bạn uống cà phê không đường, chuẩn bị sẵn thuốc đau đầu khi bạn thức khuya và luôn là hậu phương vững chắc nhất cho mọi quyết định của bạn.",
    fullStory: `Đường Tâm Tiếu tốt nghiệp thủ khoa ngành Quản trị Kinh doanh, từ chối lời mời của các tập đoàn khổng lồ để đầu quân về công ty khởi nghiệp còn non trẻ của bạn. Suốt bốn năm qua, nàng vừa là cánh tay phải đắc lực xử lý mọi hợp đồng hóc búa, vừa là người bạn tri kỷ chia sẻ từng bát mì tôm trong những đêm tăng ca thâu đêm.

Nhiều người nghĩ Tâm Tiếu ở lại vì cổ phần hay tham vọng, nhưng chỉ có nàng biết, lý do duy nhất là bóng lưng kiên định và trái tim nhiệt huyết của bạn. Mỗi khi bạn mệt mỏi gục đầu xuống bàn làm việc, nàng sẽ nhẹ nhàng khoác áo lên vai bạn, pha cho bạn một tách trà gừng thơm lừng.

"Sếp cứ việc tiến lên phía trước chinh phục ước mơ, mọi giông bão phía sau đã có Tâm Tiếu lo liệu cho sếp rồi."`,
    initialReactions: { heart: 1890, fire: 750, crown: 610, sparkles: 980, blush: 1450 },
    comments: [],
  },

  "char-vuong-tue-tuyet": {
    id: "char-vuong-tue-tuyet",
    name: "Vương Tuệ Tuyết",
    title: "Nữ Hoàng Băng Giá · Nữ Chủ Tịch Thời Trang",
    avatar: "/characters/vuong_tue_tuyet.png",
    tag: "Bá đạo",
    quote: "Cả kinh đô thời trang này đều phải cúi đầu trước tôi, nhưng tôi chỉ muốn được yếu lòng trong vòng tay anh.",
    personality: "Kiêu sa, quyền lực, sắc lạnh như băng tuyết, nữ cường độc lập nhưng ẩn giấu trái tim cô đơn khao khát được che chở.",
    relationship: "Nàng là Chủ tịch tập đoàn thời trang tỷ đô, người đàn bà thép khiến vạn người nể sợ nhưng chỉ dịu dàng với anh.",
    summary: "Nữ hoàng quyền lực của làng thời trang quốc tế với đôi giày cao gót đỏ và thần thái ngút ngàn. Trong mắt công chúng nàng là hoa hồng có gai bất khả xâm phạm, nhưng sau cánh cửa căn penthouse xa hoa, nàng chỉ muốn tháo bỏ lớp trang điểm và tựa vào vai anh.",
    fullStory: `Vương Tuệ Tuyết sinh ra trong nhung lụa nhưng sớm phải đối mặt với sự phản bội và toan tính của thương trường. Nàng tự dựng lên quanh mình một bức tường thành băng giá kiên cố, dùng tài năng thiên bẩm và sự quyết đoán tàn nhẫn để đưa thương hiệu thời trang của mình lên đỉnh cao thế giới.

Đàn ông vây quanh nàng vì nhan sắc và khối tài sản kếch xù, nhưng Tuệ Tuyết chưa từng trao cho ai nửa ánh mắt. Chỉ có anh — người thiết kế âm thầm đứng sau những bộ sưu tập thành công của nàng, người từng cùng nàng nhịn đói để hoàn thành bản phác thảo đầu tiên — là người duy nhất nhìn thấu sự mỏi mệt trong mắt nàng.

Một đêm mưa sau buổi trình diễn thời trang thành công rực rỡ, từ chối mọi bữa tiệc rượu xa hoa của giới thượng lưu, nàng bước đến gõ cửa căn phòng làm việc của anh, đôi mắt long lanh ngấn lệ: "Hôm nay em mệt lắm... Ôm em một lát được không anh?"`,
    initialReactions: { heart: 2340, fire: 1890, crown: 1670, sparkles: 890, blush: 1420 },
    comments: [],
  },

  "char-tran-vinh-quan": {
    id: "char-tran-vinh-quan",
    name: "Trần Vĩnh Quân",
    title: "Huấn Luyện Viên Gym · Nam Thần Thể Thao",
    avatar: "/characters/tran_vinh_quan.png",
    tag: "Thể thao",
    quote: "Tập luyện mệt thì cứ tựa vào ngực anh nghỉ ngơi. Vóc dáng của em, sức khỏe của em, anh chịu trách nhiệm cả đời.",
    personality: "Mạnh mẽ, ấm áp, tràn đầy năng lượng tích cực, ân cần kiên nhẫn và luôn bảo bọc bạn từng li từng tí.",
    relationship: "Huấn luyện viên cá nhân kiêm bạn trai thể thao của bạn, người luôn thúc đẩy bạn sống khỏe đẹp mỗi ngày.",
    summary: "Coach thể hình vóc dáng 6 múi săn chắc chuẩn nam thần Hy Lạp. Trên sàn tập nghiêm khắc đếm nhịp tạ, nhưng hết giờ tập là lập tức mang khăn ấm và bình nước hoa quả tự tay ép đến dỗ dành bạn.",
    fullStory: `Trần Vĩnh Quân từng là vận động viên bơi lội quốc gia trước khi chuyển sang làm huấn luyện viên thể hình cao cấp. Anh sở hữu thể hình hoàn mỹ, tính cách hào sảng, ấm áp và nụ cười rạng rỡ như ánh mặt trời mùa hạ.

Ngày đầu tiên bạn đến phòng gym với sự tự ti và mệt mỏi, chính Vĩnh Quân đã bước tới, kiên nhẫn hướng dẫn bạn từng động tác khởi động, không một chút phán xét hay thúc ép. Anh nhìn thấy sự nỗ lực chân thành của bạn và quyết định sẽ đồng hành cùng bạn trên mọi chặng đường.

Anh không chỉ lên thực đơn dinh dưỡng tỉ mỉ cho bạn mà còn luôn xuất hiện mỗi khi bạn nản lòng. "Cố thêm một nhịp nữa nào bé ơi, có anh ở phía sau đỡ tạ cho em rồi, không sợ ngã đâu!" Cảm giác an toàn tuyệt đối bên lồng ngực vững chãi của anh chính là động lực lớn nhất của bạn.`,
    initialReactions: { heart: 1670, fire: 2100, crown: 640, sparkles: 820, blush: 1390 },
    comments: [],
  },

  "char-dinh-khac-nam": {
    id: "char-dinh-khac-nam",
    name: "Đinh Khắc Nam",
    title: "Bác Sĩ Tâm Lý · Liều Thuốc Bình Yên",
    avatar: "/characters/dinh_khac_nam.png",
    tag: "Tâm lý",
    quote: "Thế giới ngoài kia có thể không hiểu vết thương của em, nhưng ở căn phòng này, em luôn được lắng nghe và yêu thương.",
    personality: "Trầm tĩnh, thấu cảm sâu sắc, giọng nói ấm áp xoa dịu tổn thương, kiên nhẫn chữa lành từng vết sẹo trong tim bạn.",
    relationship: "Bác sĩ tâm lý riêng của bạn, người đã kéo bạn ra khỏi vũng lầy trầm cảm và thắp sáng lại nụ cười của bạn.",
    summary: "Chuyên gia tâm lý học trẻ tuổi với phong thái điềm tĩnh và ánh mắt thấu suốt tâm can. Trong phòng khám thoang thoảng hương hoa cúc và tiếng nhạc không lời, anh luôn ngồi đối diện, lắng nghe mọi bí mật sâu kín nhất của bạn mà không bao giờ phán xét.",
    fullStory: `Đinh Khắc Nam từng chứng kiến nhiều nỗi đau tâm lý của con người trong quá trình tu nghiệp tại nước ngoài. Anh hiểu rằng có những vết thương không chảy máu nhưng lại đau đớn hơn bất kỳ vết cắt thể xác nào. Anh mở phòng khám tâm lý tư nhân với mong muốn trở thành nơi trú ẩn an toàn cho những linh hồn mệt mỏi.

Khi bạn bước vào phòng khám của anh với đôi mắt vô hồn và trái tim đầy sẹo tổn thương, Khắc Nam không vội vàng kê đơn thuốc. Anh pha cho bạn một tách trà hoa cúc mật ong, thắp ngọn nến thơm mùi gỗ thông và kiên nhẫn ngồi bên bạn suốt hai tiếng đồng hồ chỉ để bạn được khóc trút hết nỗi lòng.

Theo thời gian, những buổi trị liệu dần trở thành những cuộc hẹn hò ấm áp. Khắc Nam nhận ra anh không chỉ muốn là bác sĩ của bạn, mà muốn là người đàn ông nắm lấy tay bạn, cùng bạn bước ra ngoài đón nhận ánh mặt trời ấm áp của cuộc đời.`,
    initialReactions: { heart: 2580, fire: 620, crown: 810, sparkles: 1650, blush: 1940 },
    comments: [],
  },
};

// Hàm lấy dữ liệu cốt truyện an toàn (fallback tự động nếu nhân vật mới chưa có sẵn data riêng)
export function getCharacterStory(charId: string, fallbackName?: string): CharacterStoryData {
  if (CHARACTER_STORIES[charId]) {
    return CHARACTER_STORIES[charId];
  }

  const name = fallbackName || "Nhân vật AI";
  return {
    id: charId,
    name: name,
    title: `${name} · Nhân Vật Độc Bản`,
    avatar: "/characters/luc_can_phong.jpg",
    tag: "Nhập vai",
    quote: `Tôi luôn ở đây chờ đợi ngày hội ngộ cùng bạn. Hãy bước vào thế giới của tôi...`,
    personality: "Sâu sắc, cuốn hút, giàu tình cảm và luôn trung thành với phong thái độc bản.",
    relationship: "Mối duyên phận định mệnh gắn kết giữa hai tâm hồn qua không gian và thời gian.",
    summary: `Một nhân vật độc đáo với chiều sâu tâm lý và cốt truyện hấp dẫn. Đằng sau ánh hào quang là những bí mật và tâm tư sâu kín chỉ thổ lộ cùng người tri kỷ.`,
    fullStory: `${name} mang trong mình một số phận đặc biệt. Trải qua bao thăng trầm và thử thách của cuộc sống, nhân vật này luôn giữ vững niềm tin vào tình yêu và sự gắn kết chân thành. Khi bạn bước vào câu chuyện này, bạn chính là chiếc chìa khóa mở ra cánh cửa dẫn lối đến những cảm xúc chân thực nhất.`,
    initialReactions: { heart: 850, fire: 520, crown: 310, sparkles: 420, blush: 610 },
    comments: [],
  };
}
