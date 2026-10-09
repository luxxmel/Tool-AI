"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth, User } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import { ExplorePost } from "@/data/postData";
import RechargeModal from "@/components/payment/RechargeModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface UserPrivacySettings {
  hideEmail: boolean;
  hideLocation: boolean;
  hideBio: boolean;
  hideSocials: boolean;
  hideStats: boolean;
}

interface UserProfileSocials {
  bio: string;
  github: string;
  twitter: string;
  facebook: string;
  website: string;
  location: string;
  bannerUrl?: string;
  privacy?: UserPrivacySettings;
}

export default function UserProfileView({
  onOpenLoginModal,
  targetUserId,
}: {
  onOpenLoginModal: () => void;
  targetUserId?: string;
}) {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const searchParams = useSearchParams();
  const urlUserId = searchParams?.get("userId") || undefined;
  
  // ID của profile đang xem (nếu có targetUserId hoặc urlUserId thì là xem profile người khác, ngược lại là profile bản thân)
  const viewUserId = targetUserId || urlUserId || user?.id;
  const isOwnProfile = Boolean(user && user.id === viewUserId);

  const { t, language } = useLanguage();
  const { showAlert } = usePopup();

  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // Profile data state
  const [bio, setBio] = useState<string>("Nhà sáng tạo nội dung & Yêu thích công nghệ AI ✨");
  const [location, setLocation] = useState<string>("Việt Nam");
  const [github, setGithub] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || "");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  // Privacy toggles state
  const [privacy, setPrivacy] = useState<UserPrivacySettings>({
    hideEmail: false,
    hideLocation: false,
    hideBio: false,
    hideSocials: false,
    hideStats: false,
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn ảnh đại diện từ máy (local file)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Xử lý chọn ảnh Banner bìa từ máy (local file)
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert("Ảnh banner quá lớn. Vui lòng chọn ảnh dưới 10MB!", "Thông báo", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setBannerUrl(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Load profile meta
  useEffect(() => {
    const targetId = viewUserId;
    if (!targetId) return;

    if (isOwnProfile && user) {
      setDisplayName(user.displayName);
      setAvatarUrl(user.avatar);
    }

    const savedKey = `user_profile_meta_${targetId}`;
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
        if (meta.bannerUrl !== undefined) setBannerUrl(meta.bannerUrl);
        if (meta.privacy !== undefined) setPrivacy(meta.privacy);
      } catch (err) {
        console.error("Lỗi đọc profile meta:", err);
      }
    }
  }, [viewUserId, isOwnProfile, user]);

  // Load user posts
  const fetchUserPosts = async () => {
    const targetId = viewUserId;
    if (!targetId) return;
    try {
      setIsLoadingPosts(true);
      const res = await fetch(`/api/posts?authorId=${targetId}`);
      if (res.ok) {
        const data: ExplorePost[] = await res.json();
        setPosts(data);
        if (!isOwnProfile && data.length > 0 && data[0].author) {
          setDisplayName(data[0].author.name);
          setAvatarUrl(data[0].author.avatar);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải bài viết:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (viewUserId) {
      fetchUserPosts();
    }
  }, [viewUserId]);

  const handleSaveProfile = () => {
    if (!user) return;
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
      bannerUrl: bannerUrl.trim(),
      privacy,
    };
    localStorage.setItem(`user_profile_meta_${user.id}`, JSON.stringify(meta));

    setIsEditingProfile(false);
    setSaveSuccessMsg("Đã lưu cập nhật hồ sơ thành công!");
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
    <div className="w-full max-w-[980px] mx-auto pb-16 animate-in fade-in duration-300">
      {saveSuccessMsg && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2 shadow-lg">
          <span>✓</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ── MODERN GLASSMORPHISM PROFILE HEADER CARD ── */}
      <div className="relative rounded-3xl overflow-hidden bg-white/80 dark:bg-[#0c0e18]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl mb-8 transition-all">
        {/* Banner nghệ thuật với Glow & Mesh Gradient */}
        <div className="h-44 sm:h-60 w-full relative overflow-hidden group">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Profile Cover Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-violet-900 via-indigo-900 to-cyan-900 relative">
              {/* Subtle Tech Grid Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
              <div className="absolute -top-24 -left-20 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 right-10 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Nút đổi ảnh bìa khi hover (chỉ chính chủ) */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <button
                onClick={() => {
                  setIsEditingProfile(true);
                  setTimeout(() => bannerFileInputRef.current?.click(), 100);
                }}
                className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-xs border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
              >
                <span>🖼️ Đổi ảnh bìa</span>
              </button>
            </div>
          )}

          {/* Top Actions Floating Bar */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs border border-white/20 shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
              >
                <span className="text-cyan-400">✏️</span>
                <span>{isEditingProfile ? "Đóng chỉnh sửa" : "Chỉnh sửa hồ sơ"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Nội dung thông tin chính & Avatar */}
        <div className="px-6 sm:px-8 pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar & Tên người dùng */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar với vòng Neon Glow */}
              <div className="relative group self-start sm:self-auto">
                <div
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-[#f8fafc] dark:border-[#0c0e18] shadow-2xl shrink-0 bg-slate-900 cursor-pointer ring-2 ring-indigo-500/40 hover:ring-cyan-400 transition-all relative"
                  title="Bấm để thay đổi ảnh đại diện"
                >
                  <img
                    src={avatarUrl || user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs">
                    <span className="text-xl">📷</span>
                    <span>Đổi ảnh</span>
                  </div>
                </div>
                {/* Online Indicator */}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0c0e18] shadow-sm" title="Đang hoạt động" />
              </div>

              {/* Tên & Tagline */}
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                    {user.displayName}
                  </h1>
                  {user.role === "ADMIN" && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 dark:text-amber-300 font-extrabold border border-amber-500/40 uppercase tracking-widest flex items-center gap-1 shadow-xs">
                      <span>👑</span> ADMIN
                    </span>
                  )}
                  {user.role === "VIP" && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 dark:text-purple-300 font-extrabold border border-purple-500/40 uppercase tracking-widest flex items-center gap-1">
                      <span>✨</span> VIP
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">@{user.username || user.email.split("@")[0]}</span>
                  {!privacy.hideLocation && location && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span>📍</span> {location}
                      </span>
                    </>
                  )}
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>📅</span> Tham gia tháng 10/2026
                  </span>
                </div>
              </div>
            </div>

            {/* Nút Nạp Credits & Số Dư */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRechargeOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 group"
              >
                <span className="text-base group-hover:rotate-12 transition-transform">🪙</span>
                <span>
                  {user.role === "ADMIN" ? (language === "en" ? "∞ Unlimited" : "∞ Vô hạn Credits") : `${user.credits ?? 10} Credits`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black ml-0.5 uppercase shadow-xs">
                  + Nạp
                </span>
              </button>
            </div>
          </div>

          {/* Tiểu sử (Bio Card) */}
          {!privacy.hideBio && (
            <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>💬</span> Giới thiệu
              </div>
              <p>{bio || "Chưa có lời giới thiệu nào. Hãy bấm 'Chỉnh sửa hồ sơ' để giới thiệu bản thân nhé."}</p>
            </div>
          )}

          {/* Mạng xã hội & Liên hệ */}
          {!privacy.hideSocials && (
            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1 mb-6">
              {!privacy.hideEmail && (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  <span>✉️</span>
                  <span>{user.email}</span>
                </div>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-950/30 px-3.5 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:scale-105 transition-all font-medium"
                >
                  <span>🌐</span>
                  <span>{website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {github && (
                <a
                  href={`https://github.com/${github.replace(/^https?:\/\/github\.com\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:scale-105 transition-all font-medium"
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
                  className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/30 px-3.5 py-1.5 rounded-xl border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 hover:scale-105 transition-all font-medium"
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
                  className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:scale-105 transition-all font-medium"
                >
                  <span>👥</span>
                  <span>Facebook</span>
                </a>
              )}
            </div>
          )}

          {/* ── BỘ CHỈ SỐ THỐNG KÊ (METRICS DASHBOARD CARDS) ── */}
          {!privacy.hideStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
              {/* Card 1: Bài viết */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all flex items-center gap-3.5 group">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Bài viết đã đăng
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {posts.length}
                  </span>
                </div>
              </div>

              {/* Card 2: Lượt thích */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/50 transition-all flex items-center gap-3.5 group">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  ❤️
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Lượt yêu thích
                  </span>
                  <span className="text-2xl font-black text-rose-500 dark:text-rose-400 tracking-tight">
                    {totalLikes}
                  </span>
                </div>
              </div>

              {/* Card 3: Bình luận */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all flex items-center gap-3.5 group">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Bình luận tương tác
                  </span>
                  <span className="text-2xl font-black text-purple-500 dark:text-purple-400 tracking-tight">
                    {totalComments}
                  </span>
                </div>
              </div>

              {/* Card 4: Số dư Credits */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all flex items-center gap-3.5 group">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  🪙
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Số dư Credits
                  </span>
                  <span className="text-2xl font-black text-amber-500 dark:text-amber-300 tracking-tight">
                    {user.role === "ADMIN" ? (language === "en" ? "∞" : "∞ Vô hạn") : (user.credits ?? 10)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT PROFILE INLINE DRAWER ── */}
      {isEditingProfile && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-[#0c0e17] border-2 border-indigo-500/50 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-cyan-400">✏️</span>
              <span>Chỉnh sửa hồ sơ cá nhân</span>
            </h3>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Tên hiển thị:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị của bạn..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Quốc gia / Thành phố:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Hà Nội, Việt Nam"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Tiểu sử (Bio ngắn):
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu đôi nét về bản thân, sở thích hoặc công việc..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed font-medium"
              />
            </div>

            {/* Chọn Avatar từ máy tính / thư mục ảnh */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Ảnh đại diện (Avatar):
              </label>

              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-md shrink-0 bg-slate-800">
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
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>📁 Chọn ảnh đại diện từ máy tính</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvatarUrl(user.avatar)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Khôi phục
                    </button>
                  </div>

                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Hoặc dán URL link ảnh trực tiếp..."
                    className="w-full px-3.5 py-2 text-[11px] rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Chọn Ảnh Bìa (Banner) từ máy tính */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Ảnh bìa trang cá nhân (Cover Banner):
              </label>

              <input
                type="file"
                ref={bannerFileInputRef}
                accept="image/*"
                onChange={handleBannerFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-16 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-md shrink-0 bg-slate-800">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-violet-900 to-cyan-900 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                      Banner mặc định
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>🖼️ Tải ảnh bìa Banner từ máy tính</span>
                    </button>

                    {bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Gỡ Banner
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="Hoặc dán URL link ảnh bìa (https://...)"
                    className="w-full px-3.5 py-2 text-[11px] rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Website / Portfolio:
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mywebsite.com"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                GitHub Username:
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="VD: octocat"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Twitter / X:
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="VD: username"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Facebook Link / Name:
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="VD: facebook.com/myname"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Cài đặt Quyền riêng tư & Ẩn thông tin */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">🔒</span>
                <label className="block text-xs font-bold text-slate-300">
                  Cài đặt Quyền riêng tư (Ẩn thông tin trên trang cá nhân):
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacy.hideEmail}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideEmail: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>🙈 Ẩn địa chỉ Email</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacy.hideLocation}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideLocation: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>📍 Ẩn Quốc gia / Địa chỉ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacy.hideBio}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideBio: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>📜 Ẩn Tiểu sử (Bio)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacy.hideSocials}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideSocials: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>🔗 Ẩn tất cả liên kết Mạng xã hội</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={privacy.hideStats}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideStats: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>📊 Ẩn Hàng Thống kê (Bài đã đăng, Lượt thích, Bình luận, Credits)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center justify-between border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "posts"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>📝 Bài viết đã đăng</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "about"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>👤 Giới thiệu & Chi tiết</span>
          </button>
        </div>

        <Link
          href="/explore"
          className="pb-3.5 text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>Khám phá cộng đồng →</span>
        </Link>
      </div>

      {/* ── TAB CONTENT: POSTS ── */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="p-16 text-center text-slate-400 text-xs font-medium">
              <span className="animate-spin inline-block mr-2 text-base">⏳</span> Đang tải bài viết của bạn...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 sm:p-16 rounded-3xl bg-[#0c0e17]/80 border border-slate-800 text-center">
              <div className="text-5xl mb-4">✍️</div>
              <h4 className="text-lg font-extrabold text-white mb-2">
                Bạn chưa có bài viết nào
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
                Hãy chia sẻ các mẹo prompt hay, tác phẩm tạo ra từ AI hoặc thắc mắc với cộng đồng ngay hôm nay.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
              >
                <span>🚀 Đến bảng tin để đăng bài</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-[#0c0e17]/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">
                        {post.title || "Bài viết không tiêu đề"}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post attachment"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/50">
                    <span className="font-mono text-[11px]">{post.createdAt || "Gần đây"}</span>
                    <div className="flex items-center gap-4">
                      <span>❤️ {post.likes || 0}</span>
                      <span>💬 {post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: ABOUT ── */}
      {activeTab === "about" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0e17]/90 border border-slate-800/80 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3">
              Thông tin tài khoản
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Email liên kết</span>
                <span className="font-mono font-bold text-white">{user.email}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Vai trò hệ thống</span>
                <span className="font-bold text-cyan-400">{user.role}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Số dư Credits</span>
                <span className="font-bold text-amber-300">
                  {user.role === "ADMIN" ? (language === "en" ? "∞ Unlimited" : "∞ Vô hạn Credits") : `${user.credits ?? 10} Credits`}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Quốc gia</span>
                <span className="font-bold text-white">{location || "Việt Nam"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {isRechargeOpen && (
        <RechargeModal
          isOpen={isRechargeOpen}
          onClose={() => setIsRechargeOpen(false)}
        />
      )}
    </div>
  );
}
