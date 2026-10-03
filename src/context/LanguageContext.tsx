"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "vi" | "en";

export interface Translations {
  [key: string]: string;
}

const translationsVi: Translations = {
  // Navigation & Popup
  "menu.admin_credits": "Phát Credits cho User",
  "menu.invite": "Thêm thành viên",
  "menu.appearance": "Giao diện & Hình nền",
  "menu.workspace": "Cài đặt không gian làm việc",
  "menu.personalization": "Cá nhân hóa",
  "menu.credits": "Quản lý & Cấp Credits",
  "menu.recharge": "Nạp thêm Credits",
  "menu.settings": "Cài đặt",
  "menu.help": "Trợ giúp",
  "menu.logout": "Đăng xuất",
  "menu.admin": "Quản trị viên",
  "menu.member": "Thành viên",
  "menu.infinite": "∞ Vô hạn",

  // Settings Tabs
  "tab.general": "Cài đặt chung",
  "tab.appearance": "Giao diện & Hình nền",
  "tab.workspace": "Không gian làm việc",
  "tab.account": "Tài khoản cá nhân",
  "tab.personalization": "Cá nhân hóa AI",
  "tab.credits": "Gói & Nạp Credits",
  "tab.admin_credits": "Phát Credits (Admin)",
  "tab.invite": "Thêm thành viên",
  "tab.help": "Trợ giúp & FAQ",

  // Appearance & Wallpaper
  "bg.title": "Hình nền & Tùy biến Không gian",
  "bg.subtitle": "Cá nhân hóa không gian làm việc theo sở thích: màu đơn sắc, dải màu neon cực quang, hoặc hình nền 4K",
  "bg.reset": "Khôi phục mặc định",
  "bg.currently_using": "Đang áp dụng:",
  "bg.sample_preview": "Khung trò chuyện hiển thị rõ ràng, độ tương phản sắc nét trên nền bạn đã chọn.",
  "bg.custom_heading": "Tải ảnh từ máy tính hoặc dán URL",
  "bg.upload_btn": "Tải ảnh từ máy tính...",
  "bg.apply_btn": "Áp dụng",
  "bg.adjust_title": "Tinh chỉnh độ hiển thị & Đọc chữ tối ưu",
  "bg.adjust_subtitle": "Đảm bảo nội dung trò chuyện luôn có độ tương phản cao, êm mắt khi làm việc",
  "bg.dimming": "Độ phủ tối (Dimming Overlay)",
  "bg.blur": "Độ làm mờ nền (Backdrop Blur)",

  // General Settings
  "general.title": "Cài đặt chung & Ngôn ngữ",
  "general.subtitle": "Tùy chỉnh ngôn ngữ hiển thị, giao diện, hiệu ứng âm thanh và phím tắt",
  "general.language": "Ngôn ngữ giao diện",
  "general.language_vi": "Tiếng Việt (Mặc định)",
  "general.language_en": "English (Tiếng Anh)",
  "general.theme": "Chủ đề giao diện",
  "general.theme_dark": "Chế độ Tối (Dark)",
  "general.theme_light": "Chế độ Sáng (Light)",
  "general.theme_system": "Tự động theo hệ thống",
  "general.sound": "Hiệu ứng âm thanh",
  "general.sound_desc": "Phát âm thanh thông báo nhẹ khi gửi tin nhắn hoặc AI phản hồi xong",
  "general.sound_test": "Nghe thử âm thanh",
  "general.shortcuts": "Phím tắt gửi tin nhắn",
  "general.shortcut_enter": "Enter gửi tin nhắn (Shift + Enter xuống dòng)",
  "general.shortcut_ctrl_enter": "Ctrl / ⌘ + Enter gửi tin nhắn (Enter xuống dòng)",
  "general.autoscroll": "Tự động cuộn trang",
  "general.autoscroll_desc": "Tự động cuộn xuống dưới cùng khi AI đang sinh văn bản",
  "general.saved": "Đã lưu cài đặt chung thành công!",

  // Workspace Settings
  "ws.title": "Cài đặt không gian làm việc",
  "ws.subtitle": "Quản lý định danh không gian, hướng dẫn ngữ cảnh chung và dữ liệu lưu trữ",
  "ws.name": "Tên không gian làm việc",
  "ws.icon": "Biểu tượng không gian",
  "ws.instructions": "Chỉ dẫn hệ thống chung cho không gian",
  "ws.instructions_placeholder": "Nhập ngữ cảnh chung áp dụng cho mọi đoạn chat trong không gian này (ví dụ: Ưu tiên trả lời ngắn gọn, lập luận chặt chẽ, định dạng Markdown rõ ràng...)",
  "ws.stats_title": "Thống kê dữ liệu không gian",
  "ws.stat_chats": "Hội thoại",
  "ws.stat_msgs": "Tin nhắn",
  "ws.stat_cache": "Bộ nhớ tạm",
  "ws.export_title": "Sao lưu & Quản lý dữ liệu",
  "ws.export_btn": "📥 Xuất dữ liệu hội thoại (JSON)",
  "ws.export_md": "📄 Xuất ghi chú (Markdown)",
  "ws.clear_cache": "🧹 Dọn dẹp bộ nhớ tạm",
  "ws.clear_cache_desc": "Xóa bộ nhớ đệm trình duyệt để giải phóng dung lượng và tải nhanh hơn",
  "ws.cleared": "Đã dọn sạch bộ nhớ đệm trình duyệt!",
  "ws.saved": "Đã cập nhật cài đặt không gian làm việc!",

  // Account Settings
  "acc.title": "Thông tin tài khoản",
  "acc.subtitle": "Quản lý thông tin hồ sơ và định danh của bạn trên hệ thống",
  "acc.name": "Tên hiển thị",
  "acc.email": "Địa chỉ Email",
  "acc.role": "Vai trò hệ thống",
  "acc.credits": "Số dư Credits",
  "acc.save": "Lưu thay đổi",
  "acc.saving": "Đang lưu...",
  "acc.saved": "Cập nhật tên hiển thị thành công!",

  // Personalization Settings
  "pers.title": "Cá nhân hóa AI",
  "pers.subtitle": "Thiết lập mô hình AI ưa thích và phong cách phản hồi mặc định",
  "pers.model": "Bộ não AI mặc định",
  "pers.tone": "Phong cách phản hồi",
  "pers.custom_title": "Thông tin cá nhân để AI hiểu bạn hơn",
  "pers.custom_desc": "Chia sẻ về công việc, sở thích hoặc quy chuẩn bạn muốn AI luôn tuân theo",
  "pers.custom_placeholder": "Ví dụ: Tôi là lập trình viên Fullstack, khi giải thích code hãy đưa ví dụ cụ thể...",
  "pers.autotitle": "Tự động đặt tiêu đề đoạn chat",
  "pers.autotitle_desc": "AI tự động tóm tắt nội dung câu hỏi đầu tiên thành tiêu đề",
  "pers.saved": "Đã lưu tùy chọn cá nhân hóa!",

  // Team & Invite
  "team.tab_team": "🏢 Nhóm Làm Việc (Team)",
  "team.tab_referral": "🎁 Mời Bạn Bè (+10c)",
  "team.seats_title": "Số ghế thành viên Workspace",
  "team.seats_desc": "Mỗi thành viên tham gia cần 1 ghế làm việc để xem chung dự án và kho tài liệu nhóm.",
  "team.upgrade_seats": "Mua thêm ghế",
  "team.shared_pool": "Quỹ Credits chung của Chủ nhóm",
  "team.shared_pool_desc": "Cho phép thành viên sử dụng số dư Credits của bạn để trò chuyện và làm việc",
  "team.member_list": "Thành viên trong Không gian làm việc",
  "team.add_btn": "Thêm vào nhóm",
  "team.role_owner": "Chủ nhóm (Owner)",
  "team.role_admin": "Quản trị viên",
  "team.role_member": "Thành viên",
  "team.role_viewer": "Chỉ xem",

  // Common buttons
  "btn.save": "Lưu cài đặt",
  "btn.saving": "Đang lưu...",
  "btn.copy": "Sao chép",
  "btn.copied": "✓ Đã chép!",
  "btn.cancel": "Hủy",
  "btn.close": "Đóng",

  // Sidebar Navigation
  "nav.home": "Trang chủ",
  "nav.explore": "Khám phá",
  "nav.images": "Hình ảnh",
  "nav.characters": "Nhân vật truyện",
  "nav.healing": "Góc Chữa Lành",
  "nav.assistants": "Trợ lý",
  "nav.stories": "Truyện của tôi",
  "nav.tools": "Công cụ AI",
  "nav.profile": "Trang cá nhân",
  "nav.admin": "Quản trị CMS",

  // Sidebar UI
  "sidebar.new_chat": "Trò chuyện mới",
  "sidebar.chats": "Đoạn chat",
  "sidebar.recent": "Gần đây",
  "sidebar.projects": "Dự án",
  "sidebar.projects_list": "Danh sách dự án",
  "sidebar.login": "Đăng nhập",
  "sidebar.search": "Tìm kiếm hội thoại...",
  "sidebar.new": "+ Mới",
  "sidebar.create_project": "+ Tạo dự án",
  "sidebar.create_first_project": "+ Tạo dự án đầu tiên",
  "sidebar.loading_chats": "Đang tải đoạn chat...",
  "sidebar.no_conversations": "Chưa có đoạn chat nào.",
  "sidebar.no_projects": "Chưa có dự án nào.",
  "sidebar.start_chat": "Bắt đầu trò chuyện",
  "sidebar.light_mode": "Chuyển sang chế độ sáng",
  "sidebar.dark_mode": "Chuyển sang chế độ tối",
  "sidebar.collapse": "Thu gọn thanh bên",
  "sidebar.expand": "Mở thanh bên",
  "sidebar.delete_chat": "Xóa đoạn chat này",
  "sidebar.delete_project": "Xóa dự án này",

  // Home Page
  "home.title": "Xin chào! Tôi có thể giúp gì cho bạn?",
  "home.subtitle": "Hỏi bất cứ điều gì — học tập, sáng tạo, lập trình, hay chỉ trò chuyện",
  "home.placeholder": "Hỏi tôi bất cứ điều gì...",
  "home.send": "Gửi",
  "home.suggestions_title": "Gợi ý cho bạn",
  "home.featured_assistants": "Trợ lý nổi bật",
  "home.trending_characters": "Nhân vật xu hướng",
  "home.view_all": "Xem tất cả",
  "home.trending": "Xu hướng",
  "home.footer_desc": "© 2026 OmniAI Inc. Nền tảng trợ lý & tìm kiếm thông minh.",
  "home.terms": "Điều khoản",
  "home.privacy": "Chính sách bảo mật",

  // Chat UI
  "chat.placeholder": "Nhập tin nhắn...",
  "chat.send": "Gửi",
  "chat.thinking": "Đang suy nghĩ...",
  "chat.copy": "Sao chép",
  "chat.retry": "Thử lại",
  "chat.new_chat": "Chat mới",
  "chat.stop": "Dừng",
  "chat.credit_free": "Miễn phí",
  "chat.credit_cost": "credit/tin nhắn",
  "chat.dialogue_only": "Chỉ lời thoại",
  "chat.dialogue_desc": "Loại bỏ lời dẫn chuyện và miêu tả dài dòng",
  "chat.error_connect": "Xin lỗi, đã xảy ra lỗi trong quá trình kết nối với AI. Vui lòng thử lại!",
  "chat.out_of_credits": "Tài khoản của bạn đã hết Credits. Vui lòng nạp thêm để tiếp tục!",

  // Explore
  "explore.title": "Khám phá cộng đồng",
  "explore.search": "Tìm kiếm bài viết...",
  "explore.post_btn": "✍️ Đăng bài ngay",
  "explore.empty_title": "Chưa có bài viết nào",
  "explore.empty_desc": "Hãy là người đầu tiên chia sẻ với cộng đồng!",
  "explore.share_title": "📝 Chia sẻ với cộng đồng",
  "explore.share_desc": "Đăng prompt hay, mẹo AI, tác phẩm nghệ thuật của bạn!",
  "explore.hot_questions": "Câu hỏi hot hôm nay",
  "explore.top_contributors": "Top Đóng góp",
  "explore.today": "Hôm nay",
  "explore.7days": "7 ngày",
  "explore.no_questions": "Chưa có câu hỏi nào hôm nay",
  "explore.start_chat_hint": "Bắt đầu chat để xuất hiện tại đây!",
  "explore.no_contributors": "Chưa có ai đóng góp bài viết",
  "explore.be_first": "Hãy là người đầu tiên đăng bài!",

  "explore.posts_count": "bài viết từ cộng đồng",
  "explore.new_post": "Đăng bài mới",
  "explore.filter_all": "Tất cả",
  "explore.filter_prompt": "Prompt AI",
  "explore.filter_art": "Nghệ thuật AI",
  "explore.filter_code": "Lập trình",
  "explore.filter_assistant": "Trợ lý",
  "explore.filter_general": "Thảo luận",
  "explore.search_placeholder": "Tìm bài viết, prompt...",
  "explore.no_results": "Không tìm thấy bài nào",
  "explore.no_results_desc": "Hãy là người đầu tiên chia sẻ trong chuyên mục này!",
  "explore.post_first": "✍️ Đăng bài đầu tiên",
  "explore.community_rules": "Quy tắc cộng đồng",
  "explore.comments": "bình luận",
  "explore.copy_prompt": "Sao chép Prompt",
  "explore.prompt_copied": "Đã sao chép!",
  "explore.delete_post": "Xóa bài viết",
  "explore.delete_post_confirm": "Bạn có chắc chắn muốn xóa bài viết này không?",
  "explore.edit_post": "Chỉnh sửa bài viết",
  "explore.banner_tag_feature": "Tính năng mới",
  "explore.banner_tag_event": "Sự kiện",
  "explore.banner_tag_tip": "Mẹo hay",

  // Create Post Modal
  "modal.create_post_title": "Đăng Bài Viết Khám Phá Mới",
  "modal.post_title_label": "Tiêu đề bài viết",
  "modal.post_title_placeholder": "VD: Mẹo tạo ảnh AI Midjourney chân dung siêu thực...",
  "modal.category_label": "Chuyên mục",
  "modal.content_label": "Nội dung bài đăng / Prompt",
  "modal.content_placeholder": "Chia sẻ công thức prompt, mẹo dùng AI, trải nghiệm hoặc câu chuyện của bạn...",
  "modal.image_url_label": "Link hình ảnh minh họa (Không bắt buộc)",
  "modal.submit_post": "Đăng bài ngay",
  "modal.submitting": "Đang lưu vào DB...",

  // Characters Directory
  "char.title": "Thế Giới Nhân Vật AI (Roleplay)",
  "char.subtitle": "Khám phá và trò chuyện nhập vai với hàng loạt nhân vật AI độc đáo mang tính cách sống động",
  "char.search_placeholder": "Tìm nhân vật, tính cách...",
  "char.roleplay_btn": "Nhập vai →",
  "char.interactions": "Tương tác:",

  // Healing Corner
  "healing.title": "Góc Gửi Gắm Nỗi Buồn",
  "healing.subtitle": "Nơi bạn được phép yếu lòng, trút bỏ gánh nặng và lắng nghe những cái ôm ấm áp từ câu chữ",
  "healing.free_badge": "Miễn Phí 100%",
  "healing.open_chat": "💬 Mở phòng chat riêng",
  "healing.mood_title": "Chọn tâm trạng hiện tại của bạn để mở lời:",
  "healing.online": "Đang lắng nghe",
  "healing.voice_female": "Nữ dịu dàng",
  "healing.voice_male": "Nam trầm ấm",
  "healing.input_placeholder": "Cứ trút hết vào đây... Mình ở đây bên bạn...",
  "healing.send_btn": "Gửi tâm sự",
  "healing.companion_title": "Tâm An · Người Bạn Lắng Nghe",
  "healing.companion_tagline": "“Không phán xét, không giáo điều, chỉ có thấu hiểu và sẻ chia”",
  "healing.thinking": "Tâm An đang lắng nghe và viết cho bạn...",
  "healing.listen_voice": "🎧 Nghe giọng đọc ấm áp",
  "healing.stop_voice": "⏹️ Dừng đọc",

  // AI Image Studio
  "img.title": "Studio Sáng Tạo Hình Ảnh AI",
  "img.subtitle": "Biến ý tưởng thành tác phẩm nghệ thuật 4K với AI tạo ảnh thế hệ mới",
  "img.prompt_placeholder": "Mô tả bức tranh bạn muốn AI vẽ (hoặc chọn gợi ý bên dưới)...",
  "img.generate_btn": "Tạo ảnh ngay",
  "img.generating": "Đang vẽ tranh AI...",
  "img.style_label": "Phong cách nghệ thuật",
  "img.ratio_label": "Tỷ lệ khung hình",
  "img.gallery_title": "Thư viện tranh đã tạo",
  "img.download": "Tải về",
  "img.use_prompt": "Dùng prompt này",

  // AI Tools Studio
  "tools.title": "Kho Công Cụ AI Thông Minh",
  "tools.subtitle": "Tối ưu hóa năng suất làm việc, sáng tạo nội dung và tự động hóa tác vụ hàng ngày",
  "tools.all": "Tất cả công cụ",
  "tools.pro": "Chuyên nghiệp (PRO)",
  "tools.utility": "Tiện ích văn phòng",
  "tools.run_btn": "Thực thi công cụ",
  "tools.running": "Đang xử lý...",
  "tools.result": "Kết quả xử lý AI",

  // My Stories & Scripts
  "stories.title": "Truyện, Kịch Bản & Văn Bản",
  "stories.subtitle": "Sáng tác truyện, kịch bản TikTok/Video, tiểu thuyết với AI hỗ trợ · Xuất file Word (DOCX) & TXT",
  "stories.new_story": "Tạo kịch bản / truyện mới",
  "stories.tab_history": "Lịch sử nhập vai",
  "stories.tab_writer": "Workspace Sáng Tác AI",
  "stories.empty": "Chưa có lịch sử nhập vai nào",
  "stories.empty_desc": "Trò chuyện với nhân vật AI hoặc bắt đầu tạo kịch bản, viết truyện của bạn!",
  "stories.roleplay_luna": "🌙 Nhập vai cùng Luna",
  "stories.open_workspace": "Mở Workspace Sáng Tác",
  "stories.workspace_desc": "Editor + AI phân tích 7 chế độ · Hỗ trợ kịch bản TikTok/Video, truyện ngắn & xuất file Word (.docx)",
  "stories.loading": "Đang tải lịch sử kịch bản...",
  "stories.default_bot": "Trợ lý AI",
  "stories.new_conversation": "Cuộc trò chuyện mới",
  "stories.click_continue": "Bấm để tiếp tục câu chuyện...",

  // Story Writer
  "writer.title_placeholder": "Truyện chưa có tên",
  "writer.saved": "Đã lưu",
  "writer.words": "từ",
  "writer.chars": "ký tự",
  "writer.read_time": "phút đọc",
  "writer.ai_analysis": "AI Phân tích",
  "writer.select_mode": "Chọn loại phân tích",
  "writer.notes_for_ai": "Ghi chú cho AI (không bắt buộc)",
  "writer.notes_placeholder": "VD: Đây là truyện lãng mạn hiện đại, nhân vật chính tên Minh 25 tuổi, tính cách hướng nội...",
  "writer.all_content": "Toàn bộ",
  "writer.selected_content": "Đã chọn",
  "writer.selected_snippet": "Đoạn chọn:",
  "writer.analyzing": "Đang phân tích...",
  "writer.analyze_btn": "Phân tích",
  "writer.analysis_result": "Kết quả phân tích",
  "writer.insert_btn": "Chèn ↓",
  "writer.start_template": "Bắt đầu từ template",
  "writer.placeholder": "Bắt đầu viết truyện hoặc kịch bản của bạn tại đây...\n\nMẹo: Chọn (bôi đen) một đoạn văn bất kỳ rồi nhấn nút AI Phân tích để nhận phân tích chính xác cho đoạn đó!",
  "writer.tips_title": "Mẹo sử dụng",
  "writer.tip_1": "Bôi đen đoạn muốn phân tích trước",
  "writer.tip_2": "Thêm ghi chú về nhân vật/bối cảnh để AI hiểu đúng hơn",
  "writer.tip_3": "Dùng \"Viết lại\" để AI cải thiện đoạn đã chọn",
  "writer.tip_4": "Dùng \"Tiếp tục\" để AI viết thêm theo mạch truyện",

  // Common
  "common.loading": "Đang tải...",
  "common.error": "Có lỗi xảy ra",
  "common.back": "Quay lại",
  "common.new": "+ Mới",
  "common.all": "Tất cả",
};

const translationsEn: Translations = {
  // Navigation & Popup
  "menu.admin_credits": "Distribute Credits (Admin)",
  "menu.invite": "Invite Members",
  "menu.appearance": "Appearance & Wallpaper",
  "menu.workspace": "Workspace Settings",
  "menu.personalization": "Personalization",
  "menu.credits": "Manage & Buy Credits",
  "menu.recharge": "Recharge Credits",
  "menu.settings": "Settings",
  "menu.help": "Help & Support",
  "menu.logout": "Log Out",
  "menu.admin": "Administrator",
  "menu.member": "Member",
  "menu.infinite": "∞ Unlimited",

  // Settings Tabs
  "tab.general": "General Settings",
  "tab.appearance": "Appearance & Wallpaper",
  "tab.workspace": "Workspace",
  "tab.account": "Account Profile",
  "tab.personalization": "AI Personalization",
  "tab.credits": "Credits & Billing",
  "tab.admin_credits": "Grant Credits (Admin)",
  "tab.invite": "Add Members",
  "tab.help": "Help & FAQ",

  // Appearance & Wallpaper
  "bg.title": "Workspace Wallpapers & Appearance",
  "bg.subtitle": "Customize your personal workspace: curated solid colors, futuristic neon meshes, or 4K wallpapers",
  "bg.reset": "Reset to Default",
  "bg.currently_using": "Currently Active:",
  "bg.sample_preview": "Chat cards remain crisp and readable with optimal contrast over your chosen background.",
  "bg.custom_heading": "Upload from computer or paste image URL",
  "bg.upload_btn": "Upload from computer...",
  "bg.apply_btn": "Apply",
  "bg.adjust_title": "Legibility & Display Fine-Tuning",
  "bg.adjust_subtitle": "Ensures chat messages stay comfortable to read with optimal contrast",
  "bg.dimming": "Dimming Overlay",
  "bg.blur": "Backdrop Blur",

  // General Settings
  "general.title": "General Settings & Language",
  "general.subtitle": "Customize display language, appearance theme, sound effects, and typing shortcuts",
  "general.language": "Display Language",
  "general.language_vi": "Tiếng Việt (Vietnamese)",
  "general.language_en": "English (Default)",
  "general.theme": "Appearance Theme",
  "general.theme_dark": "Dark Theme (Default)",
  "general.theme_light": "Light Theme",
  "general.theme_system": "System Default",
  "general.sound": "Sound Effects",
  "general.sound_desc": "Play subtle notification chimes when sending a message or when AI completes response",
  "general.sound_test": "Play Sound Sample",
  "general.shortcuts": "Message Send Shortcut",
  "general.shortcut_enter": "Enter to send (Shift + Enter for new line)",
  "general.shortcut_ctrl_enter": "Ctrl / ⌘ + Enter to send (Enter for new line)",
  "general.autoscroll": "Auto-scroll Output",
  "general.autoscroll_desc": "Automatically scroll to bottom while AI generates response text",
  "general.saved": "General settings saved successfully!",

  // Workspace Settings
  "ws.title": "Workspace Settings",
  "ws.subtitle": "Manage workspace identity, shared system prompt, and stored data",
  "ws.name": "Workspace Name",
  "ws.icon": "Workspace Icon",
  "ws.instructions": "Shared System Context / Prompt",
  "ws.instructions_placeholder": "Enter custom background context applied to all conversations in this workspace (e.g.: Be concise, provide robust code samples, format tables clearly...)",
  "ws.stats_title": "Workspace Storage Statistics",
  "ws.stat_chats": "Chats",
  "ws.stat_msgs": "Messages",
  "ws.stat_cache": "Local Cache",
  "ws.export_title": "Backup & Data Management",
  "ws.export_btn": "📥 Export Conversations (JSON)",
  "ws.export_md": "📄 Export Notes (Markdown)",
  "ws.clear_cache": "🧹 Clear Local Cache",
  "ws.clear_cache_desc": "Clear cached local browser session data to free up space and load faster",
  "ws.cleared": "Browser cache cleared successfully!",
  "ws.saved": "Workspace settings saved successfully!",

  // Account Settings
  "acc.title": "Account Profile",
  "acc.subtitle": "Manage your profile information and system credentials",
  "acc.name": "Display Name",
  "acc.email": "Email Address",
  "acc.role": "System Role",
  "acc.credits": "Credits Balance",
  "acc.save": "Save Changes",
  "acc.saving": "Saving...",
  "acc.saved": "Display name updated successfully!",

  // Personalization Settings
  "pers.title": "AI Personalization",
  "pers.subtitle": "Set preferred AI intelligence model and default response tone",
  "pers.model": "Default AI Model",
  "pers.tone": "Response Persona Tone",
  "pers.custom_title": "Custom Profile Info for AI Context",
  "pers.custom_desc": "Tell the AI about your profession, topics, or guidelines to tailor every answer",
  "pers.custom_placeholder": "e.g., I am a Fullstack developer; prefer concise code examples and clean TypeScript architecture...",
  "pers.autotitle": "Auto-Generate Chat Titles",
  "pers.autotitle_desc": "Automatically summarize the first query into a conversation title",
  "pers.saved": "Personalization preferences saved!",

  // Team & Invite
  "team.tab_team": "🏢 Team Workspace",
  "team.tab_referral": "🎁 Invite Friends (+10c)",
  "team.seats_title": "Workspace Member Seats",
  "team.seats_desc": "Each member requires 1 seat to collaborate and share team projects & knowledge.",
  "team.upgrade_seats": "Add More Seats",
  "team.shared_pool": "Owner's Shared Credit Pool",
  "team.shared_pool_desc": "Allow team members to draw from your credit balance for AI interactions",
  "team.member_list": "Workspace Team Members",
  "team.add_btn": "Add to Team",
  "team.role_owner": "Owner",
  "team.role_admin": "Admin",
  "team.role_member": "Member",
  "team.role_viewer": "Viewer",

  // Common buttons
  "btn.save": "Save Settings",
  "btn.saving": "Saving...",
  "btn.copy": "Copy",
  "btn.copied": "✓ Copied!",
  "btn.cancel": "Cancel",
  "btn.close": "Close",

  // Sidebar Navigation
  "nav.home": "Home",
  "nav.explore": "Explore",
  "nav.images": "Images",
  "nav.characters": "Story Characters",
  "nav.healing": "Healing Corner",
  "nav.assistants": "Assistants",
  "nav.stories": "My Stories",
  "nav.tools": "AI Tools",
  "nav.profile": "Profile",
  "nav.admin": "CMS Admin",

  // Sidebar UI
  "sidebar.new_chat": "New Chat",
  "sidebar.chats": "Chats",
  "sidebar.recent": "Recent",
  "sidebar.projects": "Projects",
  "sidebar.projects_list": "Projects",
  "sidebar.login": "Sign In",
  "sidebar.search": "Search conversations...",
  "sidebar.new": "+ New",
  "sidebar.create_project": "+ Create project",
  "sidebar.create_first_project": "+ Create first project",
  "sidebar.loading_chats": "Loading chats...",
  "sidebar.no_conversations": "No conversations yet.",
  "sidebar.no_projects": "No projects yet.",
  "sidebar.start_chat": "Start a conversation",
  "sidebar.light_mode": "Switch to light mode",
  "sidebar.dark_mode": "Switch to dark mode",
  "sidebar.collapse": "Collapse sidebar",
  "sidebar.expand": "Expand sidebar",
  "sidebar.delete_chat": "Delete this chat",
  "sidebar.delete_project": "Delete this project",

  // Home Page
  "home.title": "Hello! How can I help you?",
  "home.subtitle": "Ask anything — study, create, code, or just chat",
  "home.placeholder": "Ask me anything...",
  "home.send": "Send",
  "home.suggestions_title": "Suggestions for you",
  "home.featured_assistants": "Featured Assistants",
  "home.trending_characters": "Trending Characters",
  "home.view_all": "View all",
  "home.trending": "Trending",
  "home.footer_desc": "© 2026 OmniAI Inc. Smart assistant & AI platform.",
  "home.terms": "Terms of Service",
  "home.privacy": "Privacy Policy",

  // Chat UI
  "chat.placeholder": "Type a message...",
  "chat.send": "Send",
  "chat.thinking": "Thinking...",
  "chat.copy": "Copy",
  "chat.retry": "Retry",
  "chat.new_chat": "New Chat",
  "chat.stop": "Stop",
  "chat.credit_free": "Free",
  "chat.credit_cost": "credit/message",
  "chat.dialogue_only": "Dialogue Only",
  "chat.dialogue_desc": "Omit narrative and lengthy descriptions",
  "chat.error_connect": "Sorry, an error occurred while connecting to AI. Please try again!",
  "chat.out_of_credits": "Your account has run out of Credits. Please recharge to continue!",

  // Explore
  "explore.title": "Explore Community",
  "explore.search": "Search posts...",
  "explore.post_btn": "✍️ Post Now",
  "explore.empty_title": "No posts yet",
  "explore.empty_desc": "Be the first to share with the community!",
  "explore.share_title": "📝 Share with Community",
  "explore.share_desc": "Post great prompts, AI tips, or your artwork!",
  "explore.hot_questions": "Hot questions today",
  "explore.top_contributors": "Top Contributors",
  "explore.today": "Today",
  "explore.7days": "7 days",
  "explore.no_questions": "No questions today yet",
  "explore.start_chat_hint": "Start chatting to appear here!",
  "explore.no_contributors": "No contributors yet",
  "explore.be_first": "Be the first to post!",

  "explore.posts_count": "community posts",
  "explore.new_post": "New Post",
  "explore.filter_all": "All",
  "explore.filter_prompt": "AI Prompts",
  "explore.filter_art": "AI Art",
  "explore.filter_code": "Code & Tech",
  "explore.filter_assistant": "Assistants",
  "explore.filter_general": "Discussion",
  "explore.search_placeholder": "Search posts, prompts...",
  "explore.no_results": "No posts found",
  "explore.no_results_desc": "Be the first to share in this category!",
  "explore.post_first": "✍️ Create first post",
  "explore.community_rules": "Community Rules",
  "explore.comments": "comments",
  "explore.copy_prompt": "Copy Prompt",
  "explore.prompt_copied": "Copied!",
  "explore.delete_post": "Delete post",
  "explore.delete_post_confirm": "Are you sure you want to delete this post?",
  "explore.edit_post": "Edit post",
  "explore.banner_tag_feature": "New Feature",
  "explore.banner_tag_event": "Special Event",
  "explore.banner_tag_tip": "Pro Tip",

  // Create Post Modal
  "modal.create_post_title": "Create New Community Post",
  "modal.post_title_label": "Post Title",
  "modal.post_title_placeholder": "e.g., Tips for generating photorealistic portraits with Midjourney...",
  "modal.category_label": "Category",
  "modal.content_label": "Post Content / Prompt",
  "modal.content_placeholder": "Share your prompt formula, AI tips, experiences or stories...",
  "modal.image_url_label": "Illustration Image URL (Optional)",
  "modal.submit_post": "Publish Post",
  "modal.submitting": "Publishing...",

  // Characters Directory
  "char.title": "AI Characters World (Roleplay)",
  "char.subtitle": "Explore and immerse yourself in roleplay conversations with diverse, vibrant AI personas",
  "char.search_placeholder": "Search characters, personalities...",
  "char.roleplay_btn": "Roleplay →",
  "char.interactions": "Interactions:",

  // Healing Corner
  "healing.title": "Healing & Comfort Corner",
  "healing.subtitle": "A safe haven to release burdens, be vulnerable, and receive comforting warmth through words",
  "healing.free_badge": "100% Free",
  "healing.open_chat": "💬 Open private chat",
  "healing.mood_title": "Choose your current mood to start:",
  "healing.online": "Listening Online",
  "healing.voice_female": "Gentle Female",
  "healing.voice_male": "Warm Male",
  "healing.input_placeholder": "Pour your heart out here... I am right here with you...",
  "healing.send_btn": "Send Note",
  "healing.companion_title": "Tam An · Empathetic Friend",
  "healing.companion_tagline": "“No judgment, no preaching, only understanding and gentle presence”",
  "healing.thinking": "Tam An is listening and writing to you...",
  "healing.listen_voice": "🎧 Listen with warm voice",
  "healing.stop_voice": "⏹️ Stop voice",

  // AI Image Studio
  "img.title": "AI Image Creation Studio",
  "img.subtitle": "Transform concepts into 4K artwork with next-gen generative AI",
  "img.prompt_placeholder": "Describe what you want AI to draw (or select a suggestion below)...",
  "img.generate_btn": "Generate Image",
  "img.generating": "Generating artwork...",
  "img.style_label": "Art Style",
  "img.ratio_label": "Aspect Ratio",
  "img.gallery_title": "Generated Artwork Gallery",
  "img.download": "Download",
  "img.use_prompt": "Use this prompt",

  // AI Tools Studio
  "tools.title": "AI Intelligence Tools Studio",
  "tools.subtitle": "Supercharge daily productivity, content creation, and workflow automation",
  "tools.all": "All Tools",
  "tools.pro": "Professional (PRO)",
  "tools.utility": "Office Utilities",
  "tools.run_btn": "Execute Tool",
  "tools.running": "Processing...",
  "tools.result": "AI Output Result",

  // My Stories & Scripts
  "stories.title": "Stories, Scripts & Documents",
  "stories.subtitle": "Craft stories, TikTok/Video scripts & novels with AI · Export Word (.docx) & TXT",
  "stories.new_story": "New Script / Story",
  "stories.tab_history": "Roleplay History",
  "stories.tab_writer": "AI Writing Workspace",
  "stories.empty": "No roleplay history yet",
  "stories.empty_desc": "Chat with an AI character or start creating your script and story!",
  "stories.roleplay_luna": "🌙 Roleplay with Luna",
  "stories.open_workspace": "Open Writing Workspace",
  "stories.workspace_desc": "Editor + 7 AI modes · TikTok/Video scripts, novels & Word (.docx) export",
  "stories.loading": "Loading story history...",
  "stories.default_bot": "AI Assistant",
  "stories.new_conversation": "New conversation",
  "stories.click_continue": "Click to continue story...",

  // Story Writer
  "writer.title_placeholder": "Untitled Story",
  "writer.saved": "Saved",
  "writer.words": "words",
  "writer.chars": "characters",
  "writer.read_time": "min read",
  "writer.ai_analysis": "AI Analysis",
  "writer.select_mode": "Select Analysis Mode",
  "writer.notes_for_ai": "Notes for AI (optional)",
  "writer.notes_placeholder": "e.g., Modern romance story, protagonist Alex is 25, introverted...",
  "writer.all_content": "All",
  "writer.selected_content": "Selected",
  "writer.selected_snippet": "Selected:",
  "writer.analyzing": "Analyzing...",
  "writer.analyze_btn": "Analyze",
  "writer.analysis_result": "Analysis Result",
  "writer.insert_btn": "Insert ↓",
  "writer.start_template": "Start from template",
  "writer.placeholder": "Start writing your story or script here...\n\nTip: Select any text chunk and click AI Analysis to get targeted insights!",
  "writer.tips_title": "Usage Tips",
  "writer.tip_1": "Highlight text you want to analyze first",
  "writer.tip_2": "Add notes about characters/setting for deeper AI understanding",
  "writer.tip_3": "Use \"Rewrite\" to enhance selected excerpts",
  "writer.tip_4": "Use \"Continue\" to let AI write the next paragraphs",

  // Common
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
  "common.back": "Back",
  "common.new": "+ New",
  "common.all": "All",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "omni_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
      if (saved === "vi" || saved === "en") {
        setLanguageState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      } else {
        setLanguageState("vi");
        if (typeof document !== "undefined") {
          document.documentElement.lang = "vi";
        }
      }
    } catch {
      setLanguageState("vi");
    } finally {
      setMounted(true);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_KEY, newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch (e) {
      console.error("Error saving language preference:", e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = language === "en" ? translationsEn : translationsVi;
    if (dict[key]) return dict[key];
    if (fallback) return fallback;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide a graceful fallback if used outside of Provider
    return {
      language: "vi" as Language,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
}
