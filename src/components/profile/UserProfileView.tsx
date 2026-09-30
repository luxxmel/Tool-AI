"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth, User } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import { ExplorePost } from "@/data/postData";
import RechargeModal from "@/components/payment/RechargeModal";
import Link from "next/link";

interface UserProfileSocials {
  bio: string;
  github: string;
  twitter: string;
  facebook: string;
  website: string;
  location: string;
}

export default function UserProfileView({
  onOpenLoginModal,
}: {
  onOpenLoginModal: () => void;
}) {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const { t, language } = useLanguage();
  const { showAlert } = usePopup();

  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "about">("posts");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // Socials and Bio (persisted in localStorage linked to userId)
  const [bio, setBio] = useState<string>("Nhà sáng tạo nội dung & Yêu thích công nghệ AI ✨");
  const [location, setLocation] = useState<string>("Việt Nam");
  const [github, setGithub] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || "");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn ảnh từ máy (local folder)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn kích thước ảnh 8MB
    if (file.size > 8 * 1024 * 1024) {
      showAlert("Ảnh quá lớn. Vui lòng chọn ảnh dung lượng dưới 8MB!", "Thông báo", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatarUrl(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Load custom profile information
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setAvatarUrl(user.avatar);

    const savedKey = `user_profile_meta_${user.id}`;
    const raw = localStorage.getItem(savedKey);
    if (raw) {
      try {
        const meta: UserProfileSocials = JSON.parse(raw);
        if (meta.bio !== undefined) setBio(meta.bio);
        if (meta.location !== undefined) setLocation(meta.location);
        if (meta.github !== undefined) setGithub(meta.github);
        if (meta.twitter !== undefined) setTwitter(meta.twitter);
        if (meta.facebook !== undefined) setFacebook(meta.facebook);
        if (meta.website !== undefined) setWebsite(meta.website);
      } catch (err) {
        console.error("Lỗi đọc profile meta:", err);
      }
    }
  }, [user]);

  // Load user posts
  const fetchUserPosts = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingPosts(true);
      const res = await fetch(`/api/posts?authorId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết của user:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const handleSaveProfile = () => {
    if (!user) return;
    // Update AuthContext and LocalStorage
    updateUserProfile({
      displayName: displayName.trim() || user.displayName,
      avatar: avatarUrl.trim() || user.avatar,
    });

    const meta: UserProfileSocials = {
      bio: bio.trim(),
      location: location.trim(),
      github: github.trim(),
      twitter: twitter.trim(),
      facebook: facebook.trim(),
      website: website.trim(),
    };
    localStorage.setItem(`user_profile_meta_${user.id}`, JSON.stringify(meta));

    setIsEditingProfile(false);
    setSaveSuccessMsg("Đã lưu cập nhật trang cá nhân thành công!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full max-w-[850px] mx-auto py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center text-3xl mb-4 shadow-xl">
          👤
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {language === "en" ? "Profile & Activity" : "Trang cá nhân & Hoạt động"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          {language === "en"
            ? "Sign in to view your published posts, bio, social links, and account statistics."
            : "Đăng nhập để xem danh sách bài viết đã đăng, thiết lập tiểu sử (Bio), mạng xã hội và số dư tài khoản."}
        </p>
        <button
          onClick={onOpenLoginModal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer"
        >
          {language === "en" ? "Sign In Now" : "Đăng nhập ngay"}
        </button>
      </div>
    );
  }

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0);

  return (
    <div className="w-full max-w-[980px] mx-auto pb-16 animate-in fade-in duration-200">
      {saveSuccessMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── PROFILE HEADER HERO CARD ── */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-800 shadow-xl mb-6">
        {/* Cover Banner */}
        <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 relative">
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsEditingProfile((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/30 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isEditingProfile ? "✕ Đóng chỉnh sửa" : "✏️ Chỉnh sửa hồ sơ"}</span>
            </button>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar & Basic details */}
            <div className="flex items-end gap-4">
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-[#0c0e18] shadow-2xl shrink-0 bg-slate-200 dark:bg-slate-800 cursor-pointer"
                title="Bấm vào để đổi ảnh đại diện từ máy tính"
              >
                <img
                  src={avatarUrl || user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                  <span className="text-base">📷</span>
                  <span>Đổi ảnh</span>
                </div>
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c0e18]" />
              </div>

              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                    {user.displayName}
                  </h1>
                  {user.role === "ADMIN" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 font-extrabold border border-amber-500/30 uppercase tracking-wider">
                      ADMIN
                    </span>
                  )}
                  {user.role === "VIP" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-extrabold border border-purple-500/30 uppercase tracking-wider">
                      VIP
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  @{user.username || user.email.split("@")[0]}
                </div>
              </div>
            </div>

            {/* Quick Actions & Credits Pill */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsRechargeOpen(true)}
                className="px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>🪙</span>
                <span>
                  {user.role === "ADMIN" ? "∞ Vô hạn Credits" : `${user.credits ?? 10} Credits`}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black ml-1">
                  +Nạp
                </span>
              </button>
            </div>
          </div>

          {/* Bio & Social Badges */}
          <div className="mt-2 space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed font-normal">
              {bio || "Chưa có lời giới thiệu nào. Hãy bấm 'Chỉnh sửa hồ sơ' để viết bio của bạn."}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {location && (
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span>📧</span>
                <span>{user.email}</span>
              </div>
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-indigo-600 dark:text-cyan-400 hover:underline"
                >
                  <span>🔗</span>
                  <span>{website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {github && (
                <a
                  href={`https://github.com/${github.replace(/^https?:\/\/github\.com\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>🐙</span>
                  <span>GitHub</span>
                </a>
              )}
              {twitter && (
                <a
                  href={`https://twitter.com/${twitter.replace(/^https?:\/\/twitter\.com\//, "").replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
                >
                  <span>🐦</span>
                  <span>Twitter / X</span>
                </a>
              )}
              {facebook && (
                <a
                  href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                >
                  <span>👥</span>
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xl font-black text-indigo-600 dark:text-cyan-400 block">
                {posts.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Bài đã đăng
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xl font-black text-rose-500 block">
                {totalLikes}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Lượt thích ❤️
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xl font-black text-amber-500 block">
                {totalComments}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Bình luận 💬
              </span>
            </div>
            <div className="hidden sm:block p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-xl font-black text-emerald-500 block">
                {user.role === "ADMIN" ? "∞" : (user.credits ?? 10)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Số dư Credits 🪙
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDIT PROFILE INLINE DRAWER ── */}
      {isEditingProfile && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c0e18] border-2 border-indigo-500/40 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>✏️</span>
              <span>Chỉnh sửa thông tin cá nhân & Liên kết mạng xã hội</span>
            </h3>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên hiển thị:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ / Quốc gia:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Hà Nội, Việt Nam"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiểu sử (Bio ngắn):
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu đôi nét về bản thân, sở thích hoặc định hướng công việc..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Chọn Avatar từ máy tính / thư mục ảnh */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Ảnh đại diện (Avatar):
              </label>

              {/* Hidden file input to open local file picker */}
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Avatar Preview */}
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-md shrink-0 bg-slate-200 dark:bg-slate-800">
                  <img
                    src={avatarUrl || user.avatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>📁 Tự chọn ảnh từ máy tính (Folder ảnh)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvatarUrl(user.avatar)}
                      className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                      title="Khôi phục ảnh ban đầu"
                    >
                      Khôi phục
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Hoặc dán link ảnh trực tiếp (https://...)"
                      className="w-full px-3 py-1.5 text-[11px] rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Website / Portfolio:
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mywebsite.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                GitHub Username:
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="VD: octocat"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Twitter / X:
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="VD: username"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Facebook (Link hoặc Tên):
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="VD: facebook.com/myname"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:opacity-95 cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "posts"
                ? "border-indigo-600 text-indigo-600 dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>📝 Bài viết đã đăng</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "about"
                ? "border-indigo-600 text-indigo-600 dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>👤 Giới thiệu & Tài khoản</span>
          </button>
        </div>

        <Link
          href="/?tab=explore"
          className="pb-3 text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>Khám phá cộng đồng →</span>
        </Link>
      </div>

      {/* ── TAB CONTENT: POSTS ── */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <span className="animate-spin inline-block mr-2">⏳</span> Đang tải các bài viết của bạn...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <div className="text-4xl mb-3">✍️</div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                Bạn chưa có bài viết nào
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Hãy chia sẻ các mẹo sử dụng AI, prompt hay hoặc câu hỏi với cộng đồng OmniAI ngay hôm nay.
              </p>
              <Link
                href="/?tab=explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:opacity-95"
              >
                <span>🚀 Đến mục Khám phá để đăng bài</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 border border-indigo-200/50 dark:border-indigo-800/40">
                          {post.categoryLabel || post.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {post.status === "published" ? "Công khai" : "Bản nháp"}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                      {post.content}
                    </p>

                    {post.image && (
                      <div className="mb-3 max-h-56 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-bold text-rose-500">
                        <span>❤️</span> {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <span>💬</span> {post.commentsCount || 0} bình luận
                      </span>
                    </div>

                    <Link
                      href={`/?tab=explore#${post.id}`}
                      className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                    >
                      Xem trên Khám phá ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: ABOUT & ACCOUNT ── */}
      {activeTab === "about" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Thông tin chi tiết tài khoản
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">ID Người dùng:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">
                  {user.id}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Email tài khoản:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {user.email}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Cấp bậc / Vai trò:</span>
                <span className="font-bold text-amber-500">
                  {user.role} {user.role === "ADMIN" ? "👑" : "⭐"}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Số dư Credits khả dụng:</span>
                <span className="font-bold text-emerald-500">
                  {user.role === "ADMIN" ? "Vô hạn (Unlimited)" : `${user.credits ?? 10} Credits`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
    </div>
  );
}
