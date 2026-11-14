"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth, User } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePopup } from "@/context/PopupContext";
import { ExplorePost } from "@/data/postData";
import RechargeModal from "@/components/payment/RechargeModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { COUNTRIES_LIST } from "@/data/countriesData";

interface UserPrivacySettings {
  hideEmail: boolean;
  hideLocation: boolean;
  hideBio: boolean;
  hideSocials: boolean;
  hideStats: boolean;
  hideBirthdate: boolean;
  hideGender: boolean;
}

interface UserProfileSocials {
  bio: string;
  github: string;
  twitter: string;
  facebook: string;
  website: string;
  location: string;
  birthdate?: string;
  gender?: string;
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

  const [activeTab, setActiveTab] = useState<"posts" | "about" | "api_keys">("posts");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  // API Keys Management State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    if (!user) return;
    setIsLoadingKeys(true);
    try {
      const res = await fetch(`/api/user/keys?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (e) {
      console.error("Lỗi khi tải API Keys:", e);
    } finally {
      setIsLoadingKeys(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "api_keys" && isOwnProfile) {
      fetchApiKeys();
    }
  }, [activeTab, isOwnProfile, fetchApiKeys]);

  const handleCreateApiKey = async () => {
    if (!user) return;
    setIsCreatingKey(true);
    try {
      const res = await fetch("/api/user/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("Tạo khóa API thành công! Bạn có thể sao chép để tích hợp vào ứng dụng của bạn.", "Thành công", "success");
        setNewKeyName("");
        fetchApiKeys();
      } else {
        showAlert(data.error || "Không thể tạo khóa", "Thông báo", "error");
      }
    } catch (e) {
      showAlert("Lỗi kết nối khi tạo khóa API", "Thông báo", "error");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/user/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId, userId: user.id, action: "REVOKE" }),
      });
      if (res.ok) {
        showAlert("Đã thu hồi khóa API thành công!", "Thành công", "success");
        fetchApiKeys();
      }
    } catch (e) {
      showAlert("Lỗi khi thu hồi khóa", "Thông báo", "error");
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/keys?keyId=${keyId}&userId=${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showAlert("Đã xóa khóa API vĩnh viễn!", "Thành công", "success");
        fetchApiKeys();
      }
    } catch (e) {
      showAlert("Lỗi khi xóa khóa", "Thông báo", "error");
    }
  };

  // Profile data state
  const [bio, setBio] = useState<string>("Nhà sáng tạo nội dung & Yêu thích công nghệ AI ✨");
  const [location, setLocation] = useState<string>("Việt Nam");
  const [birthdate, setBirthdate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES_LIST.filter((c) => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });
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
    hideBirthdate: false,
    hideGender: false,
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
        if (meta.birthdate !== undefined) setBirthdate(meta.birthdate);
        if (meta.gender !== undefined) setGender(meta.gender);
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
      birthdate: birthdate.trim(),
      gender: gender.trim(),
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

      {/* ── HIGH-END CYBER PROFILE CARD ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0c0e17]/95 border border-slate-800/80 shadow-2xl backdrop-blur-2xl mb-8">
        {/* Animated Cyber Banner */}
        <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-violet-900 via-indigo-900 to-cyan-900 relative overflow-hidden group">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Profile Cover Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <>
              {/* Micro Particles Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </>
          )}

          {/* Quick Upload Banner Button Overlay (chỉ hiển thị với chính chủ) */}
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <button
                onClick={() => {
                  setIsEditingProfile(true);
                  setTimeout(() => bannerFileInputRef.current?.click(), 100);
                }}
                className="pointer-events-auto px-4 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xs border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <span>🖼️ Đổi ảnh bìa Banner</span>
              </button>
            </div>
          )}

          {/* Edit Profile Button Top Right (chỉ hiển thị với chính chủ) */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-xl text-white font-bold text-xs border border-white/15 shadow-xl transition-all cursor-pointer flex items-center gap-2 group hover:scale-105"
              >
                <span className="text-cyan-400 group-hover:rotate-12 transition-transform">✏️</span>
                <span>{isEditingProfile ? "Đóng chỉnh sửa" : "Chỉnh sửa hồ sơ"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Content Body */}
        <div className="px-6 sm:px-8 pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5">
            {/* Glowing Avatar */}
            <div className="flex items-end gap-5">
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="group relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#0c0e17] shadow-2xl shrink-0 bg-slate-900 cursor-pointer ring-2 ring-indigo-500/50 hover:ring-cyan-400 transition-all"
                title="Bấm vào đây để thay đổi ảnh đại diện từ máy tính"
              >
                <img
                  src={avatarUrl || user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs">
                  <span className="text-lg">📷</span>
                  <span>Đổi ảnh</span>
                </div>
                <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0c0e17] shadow-xs" />
              </div>

              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                    {user.displayName}
                  </h1>
                  {user.role === "ADMIN" && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 uppercase tracking-widest">
                      👑 ADMIN
                    </span>
                  )}
                  {user.role === "VIP" && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-black border border-purple-500/40 uppercase tracking-widest">
                      ✨ VIP
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                  <span>@{user.username || user.email.split("@")[0]}</span>
                  {!privacy.hideLocation && location && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">{location}</span>
                    </>
                  )}
                  {!privacy.hideGender && gender && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">
                        {gender === "male" ? "Nam ♂" : gender === "female" ? "Nữ ♀" : gender}
                      </span>
                    </>
                  )}
                  {!privacy.hideBirthdate && birthdate && (
                    <>
                      <span>•</span>
                      <span className="text-pink-400 flex items-center gap-1 font-sans">
                        🎂 {(() => {
                          try {
                            const [y, m, d] = birthdate.split("-");
                            return `${d}/${m}/${y}`;
                          } catch {
                            return birthdate;
                          }
                        })()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Credits Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRechargeOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 group"
              >
                <span className="text-base group-hover:rotate-12 transition-transform">🪙</span>
                <span>
                  {user.role === "ADMIN" ? "∞ Vô hạn Credits" : `${user.credits ?? 10} Credits`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black ml-1 uppercase">
                  + Nạp
                </span>
              </button>
            </div>
          </div>

          {/* Bio & Social Badges */}
          <div className="mt-4 space-y-4">
            {!privacy.hideBio && (
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-normal bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
                {bio || "Chưa có lời giới thiệu nào. Hãy bấm 'Chỉnh sửa hồ sơ' để giới thiệu bản thân nhé."}
              </p>
            )}

            {!privacy.hideSocials && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                {!privacy.hideEmail && (
                  <div className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span>📧</span>
                    <span className="text-slate-300">{user.email}</span>
                  </div>
                )}
                {website && (
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
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
                    className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
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
                    className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800 text-sky-400 hover:text-sky-300 transition-all"
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
                    className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800 text-blue-400 hover:text-blue-300 transition-all"
                  >
                    <span>👥</span>
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sleek Metrics Bar */}
          {!privacy.hideStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center hover:border-indigo-500/60 transition-all">
                <span className="text-2xl font-black text-cyan-400 block">
                  {posts.length}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Bài viết đã đăng 📝
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center hover:border-rose-500/60 transition-all">
                <span className="text-2xl font-black text-rose-400 block">
                  {totalLikes}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Lượt yêu thích ❤️
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-center hover:border-purple-500/60 transition-all">
                <span className="text-2xl font-black text-purple-400 block">
                  {totalComments}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Bình luận tương tác 💬
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center hover:border-amber-500/60 transition-all">
                <span className="text-2xl font-black text-amber-300 block">
                  {user.role === "ADMIN" ? "∞" : (user.credits ?? 10)}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-1 block">
                  Số dư Credits 🪙
                </span>
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

            <div className="relative" ref={countryDropdownRef}>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>🌍 Quốc gia / Thành phố:</span>
                <span className="text-[10px] text-cyan-400 font-normal">Bấm để chọn danh sách nước</span>
              </label>

              {/* Ô hiển thị và kích hoạt dropdown */}
              <div
                onClick={() => {
                  setIsCountryDropdownOpen((prev) => !prev);
                  setCountrySearch("");
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{(() => {
                    const found = COUNTRIES_LIST.find((c) => location.includes(c.name) || location.includes(c.nameEn));
                    return found ? found.flag : "📍";
                  })()}</span>
                  <span className={location ? "text-white" : "text-slate-500"}>
                    {location || "Chọn quốc gia hoặc nhập thành phố..."}
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">▼</span>
              </div>

              {/* Dropdown Danh sách quốc gia có thanh tìm kiếm */}
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2.5 rounded-2xl bg-[#090b14] border border-indigo-500/40 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Ô tìm kiếm quốc gia */}
                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                    <input
                      type="text"
                      autoFocus
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Tìm kiếm quốc gia (Việt Nam, US, Japan...)"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>

                  {/* Cho phép người dùng tự gõ thành phố tùy chỉnh */}
                  <div className="px-2 py-1.5 mb-1 text-[11px] text-slate-400 bg-slate-900/40 rounded-lg flex items-center justify-between">
                    <span>Tự nhập địa chỉ khác:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (countrySearch.trim()) {
                          setLocation(countrySearch.trim());
                          setIsCountryDropdownOpen(false);
                        }
                      }}
                      className="text-cyan-400 hover:underline font-bold"
                    >
                      Dùng &quot;{countrySearch.trim() || "..."}&quot;
                    </button>
                  </div>

                  {/* Danh sách cuộn các quốc gia */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredCountries.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">
                        Không tìm thấy quốc gia phù hợp. Bạn có thể bấm &quot;Dùng...&quot; ở trên để tự đặt.
                      </div>
                    ) : (
                      filteredCountries.map((c) => {
                        const isSelected = location === c.name || location.includes(c.name);
                        return (
                          <div
                            key={c.code}
                            onClick={() => {
                              setLocation(c.name);
                              setIsCountryDropdownOpen(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-600/30 text-cyan-300 font-bold border border-indigo-500/40"
                                : "hover:bg-slate-800/80 text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{c.flag}</span>
                              <span className="font-medium">{c.name}</span>
                              <span className="text-[10px] text-slate-500">({c.nameEn})</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{c.code}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                🎂 Ngày tháng năm sinh:
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-medium [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                ⚧ Giới tính:
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500 font-medium [color-scheme:dark]"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
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
                    checked={privacy.hideBirthdate}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideBirthdate: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>🎂 Ẩn Ngày tháng năm sinh</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacy.hideGender}
                    onChange={(e) => setPrivacy((prev) => ({ ...prev, hideGender: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>⚧ Ẩn Giới tính</span>
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

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("api_keys")}
              className={`pb-3.5 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "api_keys"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <span>🔑 Khóa API & Nhà phát triển</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                PRO
              </span>
            </button>
          )}
        </div>

        <Link
          href="/?tab=explore"
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
                href="/?tab=explore"
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
                <span className="font-bold text-amber-300">{user.credits} Credits</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Quốc gia</span>
                <span className="font-bold text-white">{location || "Việt Nam"}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Ngày sinh</span>
                  {privacy.hideBirthdate && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Đang ẩn</span>
                  )}
                </div>
                <span className="font-bold text-white">
                  {birthdate ? (() => {
                    try {
                      const [y, m, d] = birthdate.split("-");
                      return `${d}/${m}/${y}`;
                    } catch {
                      return birthdate;
                    }
                  })() : "Chưa cập nhật"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Giới tính</span>
                  {privacy.hideGender && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Đang ẩn</span>
                  )}
                </div>
                <span className="font-bold text-white">
                  {gender === "male" ? "Nam ♂" : gender === "female" ? "Nữ ♀" : gender === "other" ? "Khác" : "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: API KEYS & DEVELOPER PORTAL ── */}
      {activeTab === "api_keys" && isOwnProfile && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Card giới thiệu API */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-[#0a0c16] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    API v1 • OpenAI Compatible
                  </span>
                  <span className="text-xs text-slate-400">• Tích hợp ứng dụng ngoài</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Cổng Kết Nối Khóa API Biết Tuốt
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                  Tạo khóa API bí mật (<code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">btk-...</code>) để nhúng trí tuệ nhân tạo Biết Tuốt AI vào website, chatbot Telegram, Zalo hoặc app riêng của bạn. 
                  Cơ chế tính phí minh bạch: <strong>1.000 tokens ≈ 1 Credit</strong> (Số dư tự động trừ vào ví Credits của bạn).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 text-center shrink-0 w-full sm:w-auto">
                <span className="text-[11px] text-slate-400 block mb-1">Số dư hiện tại</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {user?.role === "ADMIN" ? "∞ Vô hạn" : `${(user?.credits ?? 0).toLocaleString()} 🪙`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsRechargeOpen(true)}
                  className="mt-2 w-full px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] shadow-sm cursor-pointer hover:opacity-95"
                >
                  + Nạp thêm Credits
                </button>
              </div>
            </div>
          </div>

          {/* Form tạo khóa mới */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0c0e17] border border-slate-800 shadow-md">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>➕</span>
              <span>Tạo Khóa API Mới</span>
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Đặt tên khóa (VD: Bot Telegram Bán Hàng, App React...)"
                className="flex-1 w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreateApiKey}
                disabled={isCreatingKey}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isCreatingKey ? "Đang tạo..." : "🔑 Tạo Khóa Mới"}
              </button>
            </div>
          </div>

          {/* Danh sách các khóa API đang sở hữu */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0c0e17] border border-slate-800 shadow-md space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>Khóa API Của Bạn</span>
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {apiKeys.length}/5 khóa hoạt động
              </span>
            </h4>

            {isLoadingKeys ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <span className="animate-spin inline-block mr-2">⏳</span> Đang tải danh sách khóa...
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                Bạn chưa có khóa API nào. Hãy tạo khóa đầu tiên ở trên để bắt đầu lập trình!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Tên Khóa</th>
                      <th className="py-2.5 px-3">Mã API Key</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Token đã dùng</th>
                      <th className="py-2.5 px-3">Credits trừ</th>
                      <th className="py-2.5 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                          {k.name}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="bg-slate-950 px-2 py-1 rounded text-cyan-400 border border-slate-800 text-[11px]">
                              {k.maskedKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(k.fullKey);
                                setCopiedKeyId(k.id);
                                setTimeout(() => setCopiedKeyId(null), 2000);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                              title="Sao chép toàn bộ khóa API"
                            >
                              {copiedKeyId === k.id ? "✓ Đã chép" : "Copy"}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {k.status === "ACTIVE" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ● Hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              ✕ Đã thu hồi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {k.tokensUsed?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">
                          {k.creditsUsed?.toLocaleString() || 0} 🪙
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {k.status === "ACTIVE" && (
                              <button
                                type="button"
                                onClick={() => handleRevokeApiKey(k.id)}
                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/20 cursor-pointer"
                              >
                                Vô hiệu hóa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteApiKey(k.id)}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/20 cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hướng dẫn tích hợp Code mẫu */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0c0e17] border border-slate-800 shadow-md">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span>💻</span>
              <span>Hướng Dẫn Tích Hợp (cURL / Python / Node.js)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Endpoint tương thích 100% với OpenAI SDK. Bạn chỉ cần đổi <code className="text-cyan-400 font-mono">baseURL</code> sang <code className="text-cyan-400 font-mono">https://biettuot.io.vn/api/v1</code> và dùng API Key <code className="text-cyan-400 font-mono">btk-...</code> vừa tạo.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              <pre>{`curl https://biettuot.io.vn/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer btk-YOUR_API_KEY_HERE" \\
  -d '{
    "model": "biettuot-omni",
    "messages": [
      {"role": "user", "content": "Xin chào Biết Tuốt AI!"}
    ]
  }'`}</pre>
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
