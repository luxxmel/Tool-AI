"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { soundManager } from "@/utils/sound";
import RechargeModal, { PRESET_PACKAGES, calculateCustomPrice } from "@/components/payment/RechargeModal";
import WorkspaceBackgroundCustomizer from "@/components/theme/WorkspaceBackgroundCustomizer";
import { usePopup } from "@/context/PopupContext";

export type SettingsTab =
  | "general"
  | "appearance"
  | "workspace"
  | "account"
  | "personalization"
  | "credits"
  | "admin_credits"
  | "invite"
  | "help";

interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    conversations: number;
    posts: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  quota: string;
  joinedAt: string;
  status: "active" | "pending";
}

export interface TeamSeatPackage {
  id: string;
  seats: number;
  price: number;
  credits: number;
  name: string;
  badge?: string;
  badgeColor?: string;
  desc: string;
}

export const TEAM_SEAT_PACKAGES: TeamSeatPackage[] = [
  {
    id: "seat-1",
    seats: 1,
    price: 69000,
    credits: 200,
    name: "Thêm 1 Ghế Lẻ",
    badge: "Linh hoạt",
    badgeColor: "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30",
    desc: "Thêm 1 đồng nghiệp vào Workspace, tặng kèm 200 Credits sử dụng.",
  },
  {
    id: "seat-5",
    seats: 5,
    price: 299000,
    credits: 1200,
    name: "Gói Nhóm (5 Ghế)",
    badge: "Phổ biến nhất 🔥",
    badgeColor: "bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/40",
    desc: "Tiết kiệm 15%. Lý tưởng cho nhóm khởi nghiệp, sinh viên làm đồ án.",
  },
  {
    id: "seat-10",
    seats: 10,
    price: 549000,
    credits: 3000,
    name: "Gói Doanh Nghiệp (10 Ghế)",
    badge: "Tiết kiệm 25% ⭐",
    badgeColor: "bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/40",
    desc: "Tiết kiệm 25%. Quản lý phân quyền tập trung, tặng 3.000 Credits.",
  },
];

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export default function UserSettingsModal({
  isOpen,
  onClose,
  initialTab = "general",
}: UserSettingsModalProps) {
  const { user, updateUserProfile, updateUserCredits } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { showAlert, showConfirm } = usePopup();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // General Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sendShortcut, setSendShortcut] = useState<"enter" | "ctrl_enter">("enter");
  const [autoScroll, setAutoScroll] = useState(true);
  const [generalSuccess, setGeneralSuccess] = useState("");

  // Account Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Workspace Settings State
  const [wsName, setWsName] = useState("");
  const [wsIcon, setWsIcon] = useState("🏢");
  const [wsInstructions, setWsInstructions] = useState("");
  const [wsSuccess, setWsSuccess] = useState("");
  const [cacheClearedMsg, setCacheClearedMsg] = useState("");
  const [stats, setStats] = useState({ chats: 12, messages: 86, cacheKb: 1420 });

  // Credits state
  const [creditMsg, setCreditMsg] = useState("");
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedRechargePkg, setSelectedRechargePkg] = useState<string | undefined>(undefined);
  const [modalCustomCredits, setModalCustomCredits] = useState<number>(50);

  // Admin Credits State
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminMsg, setAdminMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState<number>(50);
  const [grantMode, setGrantMode] = useState<"add" | "set">("add");
  const [grantRole, setGrantRole] = useState<string>("");
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);

  // Personalization state
  const [selectedModel, setSelectedModel] = useState("fast");
  const [selectedTone, setSelectedTone] = useState("balanced");
  const [customInstructions, setCustomInstructions] = useState("");
  const [autoTitle, setAutoTitle] = useState(true);
  const [prefSuccess, setPrefSuccess] = useState("");

  // Invite & Team Workspace state
  const [inviteSubTab, setInviteSubTab] = useState<"team" | "referral">("team");
  const [teamSeats, setTeamSeats] = useState<number>(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sharedCreditsEnabled, setSharedCreditsEnabled] = useState(true);
  const [memberQuota, setMemberQuota] = useState("unlimited");
  const [inviteMemberName, setInviteMemberName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [seatPurchaseSuccess, setSeatPurchaseSuccess] = useState("");
  const [referralCount, setReferralCount] = useState(3);
  const [isBuyingSeatModalOpen, setIsBuyingSeatModalOpen] = useState(false);
  const [selectedSeatPkg, setSelectedSeatPkg] = useState<TeamSeatPackage | null>(null);

  // Direct Support State
  const [supportMessage, setSupportMessage] = useState("");
  const [supportNotice, setSupportNotice] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim()) return;
    try {
      setIsSendingSupport(true);
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          message: supportMessage.trim(),
          sender: "USER",
        }),
      });
      if (res.ok) {
        setSupportNotice("Đã gửi yêu cầu hỗ trợ thành công! Ban Quản Trị Admin sẽ xem xét và phản hồi tin nhắn của bạn.");
        setSupportMessage("");
        setTimeout(() => setSupportNotice(""), 6000);
      } else {
        showAlert("Không thể gửi tin nhắn hỗ trợ. Vui lòng thử lại sau.", "Lỗi gửi hỗ trợ");
      }
    } catch {
      showAlert("Lỗi kết nối máy chủ.", "Lỗi");
    } finally {
      setIsSendingSupport(false);
    }
  };

  // Đồng bộ tab được chọn mỗi khi mở modal
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Initialize values from localStorage & user state
  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);

    // Team & Seats preferences: Mặc định chỉ có 1 ghế (cho chính người dùng)
    const savedSeats = localStorage.getItem("omni_team_seats");
    if (savedSeats) {
      setTeamSeats(Number(savedSeats) || 1);
    } else {
      setTeamSeats(1);
    }

    const savedShared = localStorage.getItem("omni_shared_credits");
    if (savedShared !== null) setSharedCreditsEnabled(savedShared !== "false");

    try {
      const savedMembers = localStorage.getItem("omni_team_members");
      if (savedMembers) {
        setTeamMembers(JSON.parse(savedMembers));
      } else {
        const defaultOwner: TeamMember = {
          id: "owner",
          name: user?.displayName || "Bạn",
          email: user?.email || "user@omni.ai",
          role: "OWNER",
          quota: "Vô hạn (Chủ nhóm)",
          joinedAt: "Hôm nay",
          status: "active",
        };
        setTeamMembers([defaultOwner]);
      }
    } catch {
      // fallback
    }

    // General preferences
    const savedSound = localStorage.getItem("omni_sound_effects");
    if (savedSound !== null) setSoundEnabled(savedSound !== "false");

    const savedShortcut = localStorage.getItem("omni_send_mode");
    if (savedShortcut === "ctrl_enter" || savedShortcut === "enter") {
      setSendShortcut(savedShortcut);
    }

    const savedAutoScroll = localStorage.getItem("omni_auto_scroll");
    if (savedAutoScroll !== null) setAutoScroll(savedAutoScroll !== "false");

    // Workspace preferences
    const defaultWsName = `Không gian cá nhân của ${user?.displayName || "tôi"}`;
    const savedWsName = localStorage.getItem("omni_workspace_name") || defaultWsName;
    setWsName(savedWsName);

    const savedWsIcon = localStorage.getItem("omni_workspace_icon") || "🏢";
    setWsIcon(savedWsIcon);

    const savedWsPrompt = localStorage.getItem("omni_workspace_prompt") || "";
    setWsInstructions(savedWsPrompt);

    // Personalization preferences
    const savedModel = localStorage.getItem("omni_pref_model");
    if (savedModel) setSelectedModel(savedModel);

    const savedTone = localStorage.getItem("omni_pref_tone");
    if (savedTone) setSelectedTone(savedTone);

    const savedCustom = localStorage.getItem("omni_custom_instruction");
    if (savedCustom) setCustomInstructions(savedCustom);

    const savedAutoTitle = localStorage.getItem("omni_auto_title");
    if (savedAutoTitle !== null) setAutoTitle(savedAutoTitle !== "false");

    // Calculate approximate localStorage cache size
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalLength += (localStorage[key]?.length || 0) * 2;
        }
      }
      setStats({
        chats: 12,
        messages: 86,
        cacheKb: Math.max(120, Math.round(totalLength / 1024)),
      });
    } catch {
      // Ignore cache size errors
    }
  }, [initialTab, user?.displayName]);

  // 1. Lưu Cài Đặt Chung
  const handleSaveGeneral = () => {
    localStorage.setItem("omni_sound_effects", soundEnabled ? "true" : "false");
    localStorage.setItem("omni_send_mode", sendShortcut);
    localStorage.setItem("omni_auto_scroll", autoScroll ? "true" : "false");
    setGeneralSuccess(t("general.saved", "Đã lưu cài đặt chung thành công!"));
    setTimeout(() => setGeneralSuccess(""), 3500);
  };

  // 2. Lưu Cài Đặt Không Gian Làm Việc
  const handleSaveWorkspace = () => {
    localStorage.setItem("omni_workspace_name", wsName);
    localStorage.setItem("omni_workspace_icon", wsIcon);
    localStorage.setItem("omni_workspace_prompt", wsInstructions);
    setWsSuccess(t("ws.saved", "Đã cập nhật cài đặt không gian làm việc!"));
    setTimeout(() => setWsSuccess(""), 3500);
  };

  // 3. Xuất dữ liệu hội thoại (Export JSON)
  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        version: "2.5.0",
        workspace: {
          name: wsName,
          icon: wsIcon,
          prompt: wsInstructions,
        },
        user: {
          id: user?.id,
          name: user?.displayName,
          email: user?.email,
          role: user?.role,
        },
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `omni-workspace-export-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  // 4. Dọn dẹp cache trình duyệt
  const handleClearCache = () => {
    try {
      // Clear non-critical cache items
      sessionStorage.clear();
      setCacheClearedMsg(t("ws.cleared", "Đã dọn sạch bộ nhớ đệm trình duyệt!"));
      setStats((prev) => ({ ...prev, cacheKb: 120 }));
      setTimeout(() => setCacheClearedMsg(""), 3500);
    } catch {
      // Graceful fallback
    }
  };

  // 5. Cập nhật tên hiển thị
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;

    try {
      setIsSavingName(true);
      setNameError("");
      setNameSuccess("");

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật tên");

      updateUserProfile({ displayName: displayName.trim() });
      setNameSuccess(t("acc.saved", "Cập nhật tên hiển thị thành công!"));
      setTimeout(() => setNameSuccess(""), 3000);
    } catch {
      setNameError("Đã xảy ra lỗi khi lưu thông tin");
    } finally {
      setIsSavingName(false);
    }
  };

  // 6. Sao chép link mời
  const handleCopyInviteLink = () => {
    if (!user) return;
    const inviteUrl = `${window.location.origin}?ref=${user.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // 7. Thêm thành viên vào Workspace Team (sử dụng 1 ghế)
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (teamMembers.length >= teamSeats) {
      showAlert(
        `Bạn đã dùng hết ${teamSeats}/${teamSeats} ghế làm việc. Vui lòng mua thêm ghế thành viên để tiếp tục mời đồng nghiệp!`,
        "Hết ghế làm việc",
        "warning"
      );
      return;
    }

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteMemberName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole as "ADMIN" | "MEMBER" | "VIEWER",
      quota: memberQuota === "unlimited" ? "Dùng chung không giới hạn" : `${memberQuota} credits/ngày`,
      joinedAt: "Vừa xong",
      status: "pending",
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    try {
      localStorage.setItem("omni_team_members", JSON.stringify(updated));
    } catch {}

    setInviteSuccess(`Đã cấp 1 ghế làm việc và gửi lời mời tham gia tới ${newMember.email}!`);
    setInviteEmail("");
    setInviteMemberName("");
    setTimeout(() => setInviteSuccess(""), 4000);
  };

  // 7.1 Xóa / Thu hồi ghế thành viên
  const handleRemoveTeamMember = async (id: string, email: string) => {
    if (id === "owner") return;
    const ok = await showConfirm(
      `Bạn có chắc chắn muốn xóa thành viên ${email} và thu hồi lại 1 ghế trống cho Workspace?`,
      "Thu hồi ghế thành viên"
    );
    if (!ok) return;

    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    try {
      localStorage.setItem("omni_team_members", JSON.stringify(updated));
    } catch {}
    setInviteSuccess(`Đã thu hồi ghế từ ${email}! Hiện còn trống ${teamSeats - updated.length} ghế.`);
    setTimeout(() => setInviteSuccess(""), 3500);
  };

  // 7.2 Mua thêm ghế thành viên (Per-Seat Billing giống ChatGPT Team)
  const handlePurchaseSeats = (seatsToAdd: number, price: number, bonusCredits: number, packageName: string) => {
    const nextSeats = teamSeats + seatsToAdd;
    setTeamSeats(nextSeats);
    try {
      localStorage.setItem("omni_team_seats", String(nextSeats));
    } catch {}
    if (user && bonusCredits > 0) {
      updateUserCredits((user.credits || 0) + bonusCredits);
    }
    setSeatPurchaseSuccess(`🎉 Chúc mừng! Bạn đã nâng cấp thành công "${packageName}". Workspace hiện có ${nextSeats} ghế làm việc và được cộng +${bonusCredits} Credits!`);
    setIsBuyingSeatModalOpen(false);
    setSelectedSeatPkg(null);
    setTimeout(() => setSeatPurchaseSuccess(""), 5000);
  };

  // 7.3 Bật/tắt Quỹ Credits chung của Owner
  const handleToggleSharedCredits = () => {
    const nextVal = !sharedCreditsEnabled;
    setSharedCreditsEnabled(nextVal);
    try {
      localStorage.setItem("omni_shared_credits", nextVal ? "true" : "false");
    } catch {}
  };

  // 8. Lưu tùy chọn cá nhân
  const handleSavePreferences = () => {
    localStorage.setItem("omni_pref_model", selectedModel);
    localStorage.setItem("omni_pref_tone", selectedTone);
    localStorage.setItem("omni_custom_instruction", customInstructions);
    localStorage.setItem("omni_auto_title", autoTitle ? "true" : "false");
    setPrefSuccess(t("pers.saved", "Đã lưu tùy chọn cá nhân hóa!"));
    setTimeout(() => setPrefSuccess(""), 3000);
  };

  // 9. Tải danh sách người dùng cho Admin
  const loadAdminUsers = async (searchQuery = "") => {
    if (user?.role !== "ADMIN") return;
    try {
      setIsLoadingAdmin(true);
      const url = `/api/admin/credits?adminId=${encodeURIComponent(user.id)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng admin:", err);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "admin_credits" && user?.role === "ADMIN") {
      loadAdminUsers(adminSearch);
    }
  }, [isOpen, activeTab, user?.role]);

  // 10. Admin cấp phát credits
  const handleGrantCredits = async ({
    targetUserId,
    targetEmail,
    amount,
    mode = "add",
    role,
  }: {
    targetUserId?: string;
    targetEmail?: string;
    amount: number;
    mode?: "add" | "set";
    role?: string;
  }) => {
    if (!user || user.role !== "ADMIN") return;
    try {
      setIsSubmittingGrant(true);
      setAdminMsg(null);

      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user.id,
          targetUserId,
          targetEmail,
          amount,
          mode,
          role: role || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminMsg({ type: "success", text: data.message });
        loadAdminUsers(adminSearch);
        if (targetEmail === grantEmail) {
          setGrantEmail("");
        }
        setTimeout(() => setAdminMsg(null), 5000);
      } else {
        setAdminMsg({ type: "error", text: data.error || "Không thể cấp credits" });
      }
    } catch {
      setAdminMsg({ type: "error", text: "Lỗi kết nối khi gửi yêu cầu cấp credits" });
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl md:max-w-4xl lg:max-w-5xl bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[820px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title={t("btn.close", "Đóng")}
        >
          ✕
        </button>

        {/* Navigation Sidebar */}
        <div className="w-full md:w-60 bg-slate-50 dark:bg-[#0c0d12] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 p-3.5 sm:p-4 shrink-0 flex flex-col">
          {/* User Quick Info */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.displayName)}`;
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.displayName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user.email}
              </div>
              <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                <span>🪙</span>
                <span>{user.role === "ADMIN" ? t("menu.infinite", "∞ Vô hạn") : `${user.credits ?? 10} Credits`}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
            {/* 1. Cài đặt chung & Ngôn ngữ */}
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "general"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>⚙️</span>
              <span>{t("tab.general", "Cài đặt chung")}</span>
            </button>

            {/* 2. Giao diện & Hình nền */}
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "appearance"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>🎨</span>
              <span>{t("tab.appearance", "Giao diện & Hình nền")}</span>
            </button>

            {/* 3. Cài đặt không gian làm việc */}
            <button
              onClick={() => setActiveTab("workspace")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "workspace"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>🏢</span>
              <span>{t("tab.workspace", "Không gian làm việc")}</span>
            </button>

            {/* 3. Tài khoản cá nhân */}
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "account"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>👤</span>
              <span>{t("tab.account", "Tài khoản cá nhân")}</span>
            </button>

            {/* 4. Cá nhân hóa AI */}
            <button
              onClick={() => setActiveTab("personalization")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "personalization"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>🎨</span>
              <span>{t("tab.personalization", "Cá nhân hóa AI")}</span>
            </button>

            {/* 5. Gói & Nạp Credits */}
            <button
              onClick={() => setActiveTab("credits")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "credits"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>🪙</span>
              <span>{t("tab.credits", "Gói & Nạp Credits")}</span>
            </button>

            {/* 6. Admin Special: Phát Credits */}
            {user.role === "ADMIN" && (
              <button
                onClick={() => setActiveTab("admin_credits")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "admin_credits"
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-xs"
                    : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <span>👑</span>
                <span>{t("tab.admin_credits", "Phát Credits (Admin)")}</span>
              </button>
            )}

            {/* 7. Thêm thành viên */}
            <button
              onClick={() => setActiveTab("invite")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "invite"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>👥</span>
              <span>{t("tab.invite", "Thêm thành viên")}</span>
            </button>

            {/* 8. Trợ giúp & FAQ */}
            <button
              onClick={() => setActiveTab("help")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "help"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>🎯</span>
              <span>{t("tab.help", "Trợ giúp & FAQ")}</span>
            </button>
          </nav>

          {/* Version stamp at bottom */}
          <div className="pt-3 mt-auto border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>OmniAI v2.5.0 Pro</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {/* TAB 1: CÀI ĐẶT CHUNG (GENERAL) */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚙️</span>
                  <span>{t("general.title", "Cài đặt chung & Ngôn ngữ")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("general.subtitle", "Tùy chỉnh ngôn ngữ hiển thị, giao diện, hiệu ứng âm thanh và phím tắt")}
                </p>
              </div>

              {generalSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>{generalSuccess}</span>
                </div>
              )}

              {/* 1.1 Ngôn ngữ hiển thị (Tiếng Việt vs English) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>🌐</span>
                    <span>{t("general.language", "Ngôn ngữ giao diện")}</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    {language === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tiếng Việt */}
                  <button
                    type="button"
                    onClick={() => setLanguage("vi")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      language === "vi"
                        ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/40 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇻🇳</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Tiếng Việt
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ngôn ngữ mặc định
                        </div>
                      </div>
                    </div>
                    {language === "vi" && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* English */}
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      language === "en"
                        ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/40 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇬🇧</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          English
                        </div>
                        <div className="text-[10px] text-slate-400">
                          International English
                        </div>
                      </div>
                    </div>
                    {language === "en" && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 1.2 Chủ đề giao diện (Theme) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>🎨</span>
                  <span>{t("general.theme", "Chủ đề giao diện")}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === "dark"
                        ? "border-rose-500 bg-rose-500/10 font-bold text-rose-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>🌙</span>
                      <span>{t("general.theme_dark", "Chế độ Tối")}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Dịu mắt ban đêm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      theme === "light"
                        ? "border-rose-500 bg-rose-500/10 font-bold text-rose-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>☀️</span>
                      <span>{t("general.theme_light", "Chế độ Sáng")}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tươi sáng, rõ nét</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-400 text-left transition-all cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>💻</span>
                      <span>{t("general.theme_system", "Đổi nhanh")}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Bấm để đảo chiều</div>
                  </button>
                </div>
              </div>

              {/* 1.3 Hiệu ứng âm thanh & Phản hồi */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span>🔔</span>
                      <span>{t("general.sound", "Hiệu ứng âm thanh")}</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("general.sound_desc", "Phát âm thanh thông báo nhẹ khi gửi tin nhắn hoặc AI phản hồi xong")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => soundManager.testSound()}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      title={t("general.sound_test", "Nghe thử âm thanh")}
                    >
                      <span>🔊</span>
                      <span>{t("general.sound_test", "Nghe thử")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        soundEnabled ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          soundEnabled ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 1.4 Phím tắt gửi tin nhắn (Enter vs Ctrl+Enter) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>⌨️</span>
                  <span>{t("general.shortcuts", "Phím tắt gửi tin nhắn")}</span>
                </label>

                <div className="space-y-2">
                  <label
                    onClick={() => setSendShortcut("enter")}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      sendShortcut === "enter"
                        ? "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-mono">↵</span>
                      <span className="text-xs">{t("general.shortcut_enter", "Enter gửi tin nhắn (Shift + Enter xuống dòng)")}</span>
                    </div>
                    <input
                      type="radio"
                      name="shortcut"
                      checked={sendShortcut === "enter"}
                      onChange={() => setSendShortcut("enter")}
                      className="accent-rose-600"
                    />
                  </label>

                  <label
                    onClick={() => setSendShortcut("ctrl_enter")}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      sendShortcut === "ctrl_enter"
                        ? "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-mono">⌘ + ↵</span>
                      <span className="text-xs">{t("general.shortcut_ctrl_enter", "Ctrl / ⌘ + Enter gửi tin nhắn (Enter xuống dòng)")}</span>
                    </div>
                    <input
                      type="radio"
                      name="shortcut"
                      checked={sendShortcut === "ctrl_enter"}
                      onChange={() => setSendShortcut("ctrl_enter")}
                      className="accent-rose-600"
                    />
                  </label>
                </div>
              </div>

              {/* 1.5 Tự động cuộn trang (Auto-scroll) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>📜</span>
                    <span>{t("general.autoscroll", "Tự động cuộn trang")}</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t("general.autoscroll_desc", "Tự động cuộn xuống dưới cùng khi AI đang sinh văn bản")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    autoScroll ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoScroll ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Nút Lưu Cài Đặt Chung */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  {t("btn.save", "Lưu cài đặt")}
                </button>
              </div>
            </div>
          )}

          {/* TAB: GIAO DIỆN & HÌNH NỀN (APPEARANCE & WALLPAPER) */}
          {activeTab === "appearance" && (
            <WorkspaceBackgroundCustomizer />
          )}

          {/* TAB: CÀI ĐẶT KHÔNG GIAN LÀM VIỆC (WORKSPACE) */}
          {activeTab === "workspace" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏢</span>
                  <span>{t("ws.title", "Cài đặt không gian làm việc")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("ws.subtitle", "Quản lý định danh không gian, hướng dẫn ngữ cảnh chung và dữ liệu lưu trữ")}
                </p>
              </div>

              {wsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>{wsSuccess}</span>
                </div>
              )}

              {cacheClearedMsg && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>🧹</span>
                  <span>{cacheClearedMsg}</span>
                </div>
              )}

              {/* Hình nền không gian làm việc shortcut */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white text-lg shadow-sm shrink-0">
                    🎨
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Hình nền & Màu sắc không gian làm việc
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tùy biến hình nền 4K, dải màu chuyển động cực quang và hiệu ứng làm mờ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("appearance")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  Đổi hình nền ngay →
                </button>
              </div>

              {/* Định danh không gian làm việc */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Icon Picker */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t("ws.icon", "Biểu tượng")}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl shadow-xs">
                        {wsIcon}
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {["🏢", "🚀", "💻", "🧠", "📚", "🎨", "⚡", "💎"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setWsIcon(emoji)}
                            className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-colors cursor-pointer ${
                              wsIcon === emoji
                                ? "bg-rose-600 text-white shadow-xs"
                                : "hover:bg-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="sm:col-span-9">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      {t("ws.name", "Tên không gian làm việc")}
                    </label>
                    <input
                      type="text"
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      placeholder="vd: Không gian cá nhân của Lịnh Hoàng"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Shared System Context Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {t("ws.instructions", "Chỉ dẫn hệ thống chung cho không gian")}
                    </label>
                    <span className="text-[10px] text-slate-400">Tự động áp dụng cho mọi hội thoại</span>
                  </div>
                  <textarea
                    rows={3}
                    value={wsInstructions}
                    onChange={(e) => setWsInstructions(e.target.value)}
                    placeholder={t(
                      "ws.instructions_placeholder",
                      "Nhập ngữ cảnh chung áp dụng cho mọi đoạn chat trong không gian này (ví dụ: Ưu tiên trả lời ngắn gọn, lập luận chặt chẽ, định dạng Markdown rõ ràng...)"
                    )}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Thống kê không gian làm việc */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t("ws.stats_title", "Thống kê dữ liệu không gian")}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      {t("ws.stat_chats", "Hội thoại")}
                    </span>
                    <span className="text-lg font-black text-rose-500 mt-0.5 inline-block">
                      {stats.chats}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      {t("ws.stat_msgs", "Tin nhắn")}
                    </span>
                    <span className="text-lg font-black text-indigo-500 mt-0.5 inline-block">
                      {stats.messages}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      {t("ws.stat_cache", "Bộ nhớ tạm")}
                    </span>
                    <span className="text-lg font-black text-emerald-500 mt-0.5 inline-block">
                      {stats.cacheKb} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Xuất dữ liệu & Xóa cache */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t("ws.export_title", "Sao lưu & Quản lý dữ liệu")}
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>{t("ws.export_btn", "📥 Xuất dữ liệu hội thoại (JSON)")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                    title={t("ws.clear_cache_desc", "Xóa bộ nhớ đệm trình duyệt để giải phóng dung lượng")}
                  >
                    <span>{t("ws.clear_cache", "🧹 Dọn dẹp bộ nhớ tạm")}</span>
                  </button>
                </div>
              </div>

              {/* Nút lưu không gian làm việc */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveWorkspace}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  {t("btn.save", "Lưu cài đặt")}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TÀI KHOẢN CÁ NHÂN (ACCOUNT) */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>👤</span>
                  <span>{t("acc.title", "Thông tin tài khoản")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("acc.subtitle", "Quản lý thông tin hồ sơ và định danh của bạn trên hệ thống")}
                </p>
              </div>

              {nameSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>{nameSuccess}</span>
                </div>
              )}

              {nameError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{nameError}</span>
                </div>
              )}

              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("acc.name", "Tên hiển thị")}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("acc.email", "Địa chỉ Email")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed pr-24"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Đã xác thực
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {t("acc.role", "Vai trò")}
                    </span>
                    <span className="text-xs font-bold text-rose-500 mt-0.5 inline-block">
                      {user.role}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {t("acc.credits", "Số dư Credits")}
                    </span>
                    <span className="text-xs font-bold text-amber-500 mt-0.5 inline-block">
                      🪙 {user.role === "ADMIN" ? t("menu.infinite", "∞ Vô hạn") : `${user.credits ?? 10} Credits`}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingName}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingName ? t("acc.saving", "Đang lưu...") : t("acc.save", "Lưu thay đổi")}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CÁ NHÂN HÓA AI (PERSONALIZATION) */}
          {activeTab === "personalization" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎨</span>
                  <span>{t("pers.title", "Cá nhân hóa AI")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("pers.subtitle", "Thiết lập mô hình AI ưa thích và phong cách phản hồi mặc định")}
                </p>
              </div>

              {prefSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>{prefSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Default Brain Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t("pers.model", "Bộ não AI mặc định")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "fast", label: "⚡ Suy nghĩ nhanh", sub: "Omni Fast • Phản hồi tức thì" },
                      { id: "deep", label: "🧠 Suy luận sâu", sub: "Omni Deep • Tư duy logic đa tầng" },
                      { id: "creative", label: "🎨 Sáng tạo & Ảnh", sub: "Omni Creative • Văn thơ nghệ thuật" },
                    ].map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedModel === model.id
                            ? "border-rose-500 bg-rose-500/10 text-rose-500 font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{model.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{model.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Persona Tone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t("pers.tone", "Phong cách phản hồi")}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "creative", label: "✨ Sáng tạo", desc: "Giàu hình ảnh & mở rộng ý" },
                      { id: "balanced", label: "⚖️ Cân bằng", desc: "Tự nhiên & chuẩn mực" },
                      { id: "concise", label: "🎯 Ngắn gọn", desc: "Trực diện & súc tích" },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setSelectedTone(tone.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedTone === tone.id
                            ? "border-rose-500 bg-rose-500/10 text-rose-500 font-bold"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="text-xs font-bold">{tone.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tone.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Instruction for AI */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t("pers.custom_title", "Thông tin cá nhân để AI hiểu bạn hơn")}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {t("pers.custom_desc", "Chia sẻ về công việc, sở thích hoặc quy chuẩn bạn muốn AI luôn tuân theo")}
                  </p>
                  <textarea
                    rows={3}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder={t(
                      "pers.custom_placeholder",
                      "Ví dụ: Tôi là lập trình viên Fullstack, khi giải thích code hãy đưa ví dụ cụ thể và phân tích độ phức tạp thuật toán..."
                    )}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                {/* Auto Title Toggle */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t("pers.autotitle", "Tự động đặt tiêu đề đoạn chat")}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("pers.autotitle_desc", "AI tự động tóm tắt nội dung câu hỏi đầu tiên thành tiêu đề")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoTitle(!autoTitle)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      autoTitle ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        autoTitle ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    {t("btn.save", "Lưu cài đặt")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GÓI & NẠP CREDITS (CREDITS) */}
          {activeTab === "credits" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🪙</span>
                  <span>{t("tab.credits", "Quản lý Credits & Gói nạp")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Credits được dùng để trò chuyện và sử dụng các mô hình AI cao cấp
                </p>
              </div>

              {creditMsg && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-xs">
                  {creditMsg}
                </div>
              )}

              {user.role === "ADMIN" ? (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👑</span>
                    <div>
                      <div className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        Đặc quyền Quản trị viên (ADMIN)
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        🪙 ∞ Vô hạn Credits
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tài khoản Quản trị viên của bạn sở hữu số dư vô hạn vĩnh viễn trên toàn bộ hệ thống (Chat AI, Sinh ảnh Flux, Phân tích AI Vision Pro). Bạn không bao giờ bị trừ credit khi sử dụng bất kỳ tính năng nào.
                  </p>
                  <button
                    onClick={() => setActiveTab("admin_credits")}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>👉</span>
                    <span>Mở Bảng Cấp Phát Credits Cho Thành Viên Khác</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Số dư & Nút nạp nhanh */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Số dư hiện tại
                      </span>
                      <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
                        <span>🪙 {user.credits ?? 10}</span>
                        <span className="text-xs font-semibold text-slate-500">Credits khả dụng</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        1 Credit = 1 lượt tương tác AI chuyên sâu (không giới hạn độ dài)
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRechargePkg(undefined);
                        setIsRechargeModalOpen(true);
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>⚡ Mở Cổng Nạp VietQR / MoMo</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* 4 Gói Tiết Kiệm */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        🎁 Các Gói Nạp Tiết Kiệm (Phổ Biến)
                      </h4>
                      <span className="text-[11px] text-emerald-500 font-semibold">
                        Tiết kiệm đến 45%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PRESET_PACKAGES.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1.5 my-1">
                              <span className="text-xl font-black text-amber-500">
                                🪙 {pkg.credits}
                              </span>
                              <span className="text-xs text-slate-400">Credits</span>
                              {pkg.bonusCredits && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-500 font-bold ml-1">
                                  +Tặng {pkg.bonusCredits}c
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-3">
                              {pkg.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {pkg.price.toLocaleString("vi-VN")} đ
                            </span>
                            <button
                              onClick={() => {
                                setSelectedRechargePkg(pkg.id);
                                setIsRechargeModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              Nạp gói này
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mua Tùy Ý (Custom Amount Slider) */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          ⚡ Mua Tùy Ý Theo Số Lượng
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tự động giảm giá theo số lượng: Từ 100c giảm 5%, từ 300c giảm 10%, từ 1.000c giảm 20%
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-amber-500">
                          {modalCustomCredits} Credits
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="1500"
                      step="10"
                      value={modalCustomCredits}
                      onChange={(e) => setModalCustomCredits(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Thành tiền:{" "}
                        <strong className="text-slate-900 dark:text-white font-bold text-sm">
                          {calculateCustomPrice(modalCustomCredits).totalPrice.toLocaleString("vi-VN")} đ
                        </strong>{" "}
                        ({calculateCustomPrice(modalCustomCredits).unitPrice}đ/credit)
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRechargePkg(undefined);
                          setIsRechargeModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-bold text-xs transition-all cursor-pointer"
                      >
                        Thanh toán số lượng này ➔
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 6: CẤP PHÁT CREDITS (ADMIN) */}
          {activeTab === "admin_credits" && user.role === "ADMIN" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-amber-500 text-lg">👑</span>
                    <span>Trung Tâm Cấp Phát & Quản Trị Credits</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phát credits thưởng, nạp thêm cho thành viên hoặc phân quyền tài khoản hệ thống
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold shrink-0 self-start sm:self-auto">
                  <span>🪙 Số dư Admin:</span>
                  <span className="underline">∞ Vô hạn</span>
                </div>
              </div>

              {/* Status Message */}
              {adminMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between animate-in fade-in ${
                    adminMsg.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{adminMsg.type === "success" ? "✓" : "⚠️"}</span>
                    <span>{adminMsg.text}</span>
                  </div>
                  <button
                    onClick={() => setAdminMsg(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Quick Grant Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>🎁</span>
                    <span>Cấp phát nhanh theo Email / Tài khoản</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tự động tạo tài khoản nếu email mới
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Email người nhận
                    </label>
                    <input
                      type="email"
                      value={grantEmail}
                      onChange={(e) => setGrantEmail(e.target.value)}
                      placeholder="vd: user@gmail.com"
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Hình thức
                    </label>
                    <select
                      value={grantMode}
                      onChange={(e) => setGrantMode(e.target.value as "add" | "set")}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="add">+ Cộng thêm (Thưởng)</option>
                      <option value="set">= Đặt số dư cố định</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Phân quyền
                    </label>
                    <select
                      value={grantRole}
                      onChange={(e) => setGrantRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="">Giữ nguyên vai trò</option>
                      <option value="USER">Thành viên (USER)</option>
                      <option value="VIP">Đặc quyền VIP</option>
                      <option value="ADMIN">Quản trị viên (ADMIN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Số lượng Credits
                    </label>
                    <span className="text-[11px] font-bold text-amber-500">
                      Đang chọn: {grantAmount} Credits
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[20, 50, 100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setGrantAmount(amt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          grantAmount === amt
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-slate-400">Tùy chỉnh:</span>
                      <input
                        type="number"
                        min="1"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white text-right focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    disabled={isSubmittingGrant || !grantEmail.trim()}
                    onClick={() =>
                      handleGrantCredits({
                        targetEmail: grantEmail.trim(),
                        amount: grantAmount,
                        mode: grantMode,
                        role: grantRole || undefined,
                      })
                    }
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmittingGrant ? "⏳ Đang cấp..." : "🚀 Cấp Credits Ngay"}</span>
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Tất cả thành viên trong hệ thống ({adminUsers.length})</span>
                  </span>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc email..."
                      value={adminSearch}
                      onChange={(e) => {
                        setAdminSearch(e.target.value);
                        loadAdminUsers(e.target.value);
                      }}
                      className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      🔍
                    </span>
                  </div>
                </div>

                {isLoadingAdmin ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải danh sách người dùng...</span>
                  </div>
                ) : adminUsers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Không tìm thấy người dùng nào phù hợp
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {adminUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-2xl bg-white dark:bg-[#151620] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email)}`}
                            alt={u.name || u.email}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {u.name || u.email.split("@")[0]}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                                  u.role === "ADMIN"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : u.role === "VIP"
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <div className="text-right mr-1">
                            <div className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-end">
                              <span>🪙</span>
                              <span>{u.role === "ADMIN" ? "∞ Vô hạn" : `${u.credits} Credits`}</span>
                            </div>
                          </div>

                          {u.role !== "ADMIN" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleGrantCredits({
                                    targetUserId: u.id,
                                    amount: 50,
                                    mode: "add",
                                  })
                                }
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                                title="Cộng ngay +50 credits"
                              >
                                +50
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleGrantCredits({
                                    targetUserId: u.id,
                                    amount: 100,
                                    mode: "add",
                                  })
                                }
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                                title="Cộng ngay +100 credits"
                              >
                                +100
                              </button>
                              <button
                                type="button"
                                onClick={() => setGrantEmail(u.email)}
                                className="p-1 text-slate-400 hover:text-amber-400 text-xs cursor-pointer ml-1"
                                title="Điền email vào ô cấp nhanh"
                              >
                                ✏️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: THÊM THÀNH VIÊN (TEAM WORKSPACE & REFERRAL) */}
          {activeTab === "invite" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👥</span>
                    <span>Thành Viên & Mời Bạn Bè</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý thành viên làm việc chung (tính phí theo ghế như ChatGPT Team) hoặc chia sẻ link nhận thưởng Credits
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInviteSubTab("team")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      inviteSubTab === "team"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>🏢 Nhóm Làm Việc</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      inviteSubTab === "team" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {teamMembers.length}/{teamSeats}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteSubTab("referral")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      inviteSubTab === "referral"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>🎁 Mời Bạn Bè (+10c)</span>
                  </button>
                </div>
              </div>

              {/* Status Toasts */}
              {inviteSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>✓</span>
                  <span>{inviteSuccess}</span>
                </div>
              )}

              {seatPurchaseSuccess && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <span>👑</span>
                  <span>{seatPurchaseSuccess}</span>
                </div>
              )}

              {/* SUB-TAB 1: NHÓM LÀM VIỆC (TEAM WORKSPACE - PER-SEAT PRICING) */}
              {inviteSubTab === "team" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Banner Tình Trạng Ghế */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-indigo-500/10 to-transparent border border-rose-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🪑</span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Ghế thành viên Workspace: {teamMembers.length} / {teamSeats} ghế
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            teamSeats - teamMembers.length > 0
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          }`}>
                            {teamSeats - teamMembers.length > 0
                              ? `Còn trống ${teamSeats - teamMembers.length} ghế`
                              : "Đã dùng hết ghế"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Mô hình theo đầu người (Per-Seat giống ChatGPT Team). Mỗi thành viên tham gia được cấp 1 ghế làm việc để xem chung dự án và kho tài liệu nhóm.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("seat-packages-section");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <span>+ Mua thêm ghế</span>
                        <span>➔</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (teamMembers.length / teamSeats) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Bảng Giá Mua Ghế Thành Viên (ChatGPT Team Model) */}
                  <div id="seat-packages-section" className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>💳</span>
                        <span>Bảng Giá Ghế Làm Việc (Per-Seat Billing)</span>
                      </h4>
                      <span className="text-[11px] text-emerald-500 font-semibold">
                        Kèm tặng thêm Credits hàng tháng
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TEAM_SEAT_PACKAGES.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between hover:border-rose-500/50 transition-all shadow-2xs group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                                  {pkg.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-1 my-1">
                              <span className="text-lg font-black text-rose-500">
                                {pkg.price.toLocaleString("vi-VN")} đ
                              </span>
                              <span className="text-[10px] text-slate-400">/ tháng</span>
                            </div>

                            <div className="text-[11px] text-amber-500 font-bold flex items-center gap-1 mb-2">
                              <span>🪙</span>
                              <span>+Tặng {pkg.credits} Credits dùng chung</span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                              {pkg.desc}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSeatPkg(pkg);
                              setIsBuyingSeatModalOpen(true);
                            }}
                            className="w-full py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-600 dark:group-hover:text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            Chọn gói {pkg.seats} ghế ➔
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quỹ Credits Dùng Chung (Shared Credits Pool) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>🪙</span>
                          <span>Quỹ Credits chung của Chủ Workspace (Owner)</span>
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Cho phép thành viên trong Workspace sử dụng số dư Credits của bạn ({user.role === "ADMIN" ? "∞ Vô hạn" : `${user.credits ?? 10}c`})
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleSharedCredits}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          sharedCreditsEnabled ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            sharedCreditsEnabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {sharedCreditsEnabled && (
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Hạn mức mặc định khi mời thành viên mới:
                        </span>
                        <select
                          value={memberQuota}
                          onChange={(e) => setMemberQuota(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                        >
                          <option value="unlimited">Dùng chung không giới hạn</option>
                          <option value="50">Tối đa 50 credits / ngày</option>
                          <option value="100">Tối đa 100 credits / ngày</option>
                          <option value="200">Tối đa 200 credits / ngày</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Form Mời Thành Viên Mới (Chiếm 1 ghế) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>✉️</span>
                        <span>Mời đồng nghiệp vào Workspace (Cần 1 ghế trống)</span>
                      </h4>
                      <span className="text-[11px] font-bold text-rose-500">
                        Ghế khả dụng: {teamSeats - teamMembers.length}
                      </span>
                    </div>

                    {teamMembers.length >= teamSeats ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Bạn đã sử dụng hết {teamSeats}/{teamSeats} ghế. Vui lòng mua thêm ghế ở trên để tiếp tục mời thành viên!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSeatPkg(TEAM_SEAT_PACKAGES[0]);
                            setIsBuyingSeatModalOpen(true);
                          }}
                          className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          + Mua ghế (69k)
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleAddTeamMember} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-5">
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="dongnghiep@congty.com"
                              required
                              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              value={inviteMemberName}
                              onChange={(e) => setInviteMemberName(e.target.value)}
                              placeholder="Tên hoặc chức danh (tùy chọn)"
                              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <select
                              value={inviteRole}
                              onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER" | "VIEWER")}
                              className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
                            >
                              <option value="MEMBER">Thành viên (Member)</option>
                              <option value="ADMIN">Quản trị viên (Admin)</option>
                              <option value="VIEWER">Chỉ xem (Viewer)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <button
                            type="submit"
                            disabled={!inviteEmail.trim()}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🚀 Cấp 1 ghế & Mời vào Workspace</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Danh Sách Thành Viên Đang Có Trong Workspace */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>👥 Danh sách thành viên ({teamMembers.length}/{teamSeats} ghế)</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Chủ sở hữu & các thành viên cùng làm việc
                      </span>
                    </h4>

                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 rounded-2xl bg-white dark:bg-[#151620] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {member.name}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${
                                    member.role === "OWNER"
                                      ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                      : member.role === "ADMIN"
                                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {member.role === "OWNER"
                                    ? "👑 Chủ nhóm"
                                    : member.role === "ADMIN"
                                    ? "🛡️ Quản trị"
                                    : member.role === "VIEWER"
                                    ? "👁️ Chỉ xem"
                                    : "👤 Thành viên"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {member.email} • {member.quota}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                              {member.status === "active" ? "✓ Đang hoạt động" : "⏳ Chờ tham gia"}
                            </span>

                            {member.role !== "OWNER" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(member.id, member.email)}
                                className="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                                title="Xóa thành viên và giải phóng 1 ghế trống"
                              >
                                Thu hồi ghế
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: MỜI BẠN BÈ (+10C / NGƯỜI • VIRAL REFERRAL) */}
              {inviteSubTab === "referral" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Referral Bonus Banner */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 text-center space-y-2">
                    <span className="text-3xl">🎁</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Tặng 10 Credits Miễn Phí Cho Mỗi Bạn Bè Đăng Ký
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Chia sẻ liên kết của bạn tới bạn bè hoặc cộng đồng. Khi họ tạo tài khoản, cả hai bạn sẽ tự động được cộng ngay 10 Credits vào tài khoản!
                    </p>
                  </div>

                  {/* Stats Counter */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Bạn bè đã tham gia
                      </span>
                      <span className="text-xl font-black text-indigo-500 mt-1 inline-block">
                        {referralCount} người bạn
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Credits thưởng đã nhận
                      </span>
                      <span className="text-xl font-black text-amber-500 mt-1 inline-block">
                        +{referralCount * 10} Credits
                      </span>
                    </div>
                  </div>

                  {/* Personal Invite Link */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Liên kết mời bạn bè cá nhân của bạn
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={
                          typeof window !== "undefined"
                            ? `${window.location.origin}?ref=${user.id}`
                            : (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}?ref=${user.id}` : `?ref=${user.id}`)
                        }
                        className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer shrink-0"
                      >
                        {isCopied ? "✓ Đã chép!" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Share Buttons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Chia sẻ nhanh 1 chạm:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "")) + `?ref=${user.id}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>📘</span>
                        <span>Facebook</span>
                      </a>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "")) + `?ref=${user.id}`
                        )}&text=${encodeURIComponent("Tham gia OmniAI để trải nghiệm trợ lý thông minh và nhận ngay 10 Credits miễn phí!")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>✈️</span>
                        <span>Telegram</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>💬</span>
                        <span>Zalo</span>
                      </button>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          "Trải nghiệm OmniAI cực nhanh và thông minh! Đăng ký ngay để nhận 10 Credits:"
                        )}&url=${encodeURIComponent(
                          (typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "")) + `?ref=${user.id}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>🐦</span>
                        <span>X (Twitter)</span>
                      </a>
                    </div>
                  </div>

                  {/* 3 Steps Guide */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Cách thức hoạt động:
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-rose-500">1.</span>
                        <span>Gửi liên kết mời cá nhân cho bạn bè hoặc chia sẻ lên mạng xã hội.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-rose-500">2.</span>
                        <span>Bạn bè bấm vào liên kết và hoàn tất đăng ký tài khoản mới.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-rose-500">3.</span>
                        <span>Cả hai bạn lập tức được cộng 10 Credits vào tài khoản sử dụng vĩnh viễn!</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Thanh Toán Mua Ghế Thành Viên (Per-Seat Billing) */}
              {isBuyingSeatModalOpen && selectedSeatPkg && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                  <div
                    className="relative w-full max-w-md bg-white dark:bg-[#111218] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setIsBuyingSeatModalOpen(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>

                    <div className="text-center">
                      <span className="text-3xl">🪑</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        Xác Nhận Nâng Cấp {selectedSeatPkg.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thêm +{selectedSeatPkg.seats} ghế làm việc & tặng kèm +{selectedSeatPkg.credits} Credits
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                        Tổng thanh toán
                      </span>
                      <div className="text-2xl font-black text-rose-500">
                        {selectedSeatPkg.price.toLocaleString("vi-VN")} đ
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        Áp dụng ngay lập tức cho Workspace của bạn
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsBuyingSeatModalOpen(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const pkgToBuy = selectedSeatPkg;
                          setIsBuyingSeatModalOpen(false);
                          // Chuyển hướng sang cổng thanh toán VietQR / PayOS thực tế với giá tiền của gói ghế
                          setModalCustomCredits(pkgToBuy.credits || 200);
                          setSelectedRechargePkg(undefined);
                          setIsRechargeModalOpen(true);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>💳 Thanh toán VietQR ngay</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: TRỢ GIÚP & FAQ (HELP) */}
          {activeTab === "help" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎯</span>
                  <span>{t("tab.help", "Trợ giúp & Câu hỏi thường gặp")}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Giải đáp các thắc mắc phổ biến và hướng dẫn sử dụng OmniAI hiệu quả nhất
                </p>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>🪙</span>
                    <span>Credits hoạt động và tính phí như thế nào?</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mỗi lần gửi tin nhắn và nhận phản hồi chuyên sâu từ AI sẽ tiêu hao 1 credit. Sinh ảnh chất lượng cao tiêu hao 2 credits. Tài khoản Quản trị viên (ADMIN) sở hữu số dư vô hạn vĩnh viễn.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Làm sao nạp thêm Credits nhanh nhất?</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Bạn có thể bấm vào số dư Credits ở góc trái hoặc mở Cổng nạp VietQR / MoMo. Quét mã QR chuyển khoản chính xác nội dung hiển thị, hệ thống sẽ kích hoạt cộng credit tự động trong 5 - 30 giây.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>🔒</span>
                    <span>Lịch sử hội thoại và dữ liệu của tôi có được bảo mật?</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Toàn bộ tin nhắn và ảnh tải lên được mã hóa và phân tách nghiêm ngặt theo ID người dùng. Không ai ngoài bạn có quyền truy cập vào nội dung trò chuyện trong không gian làm việc của bạn.
                  </p>
                </div>
              </div>

              {/* Shortcuts Sheet */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>⌨️</span>
                  <span>Bảng phím tắt tiện ích</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Gửi tin nhắn</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Xuống dòng tin nhắn</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      Shift + Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Dán ảnh từ clipboard</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      Ctrl + V
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Đóng bảng cài đặt</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                      Esc
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Support Channels & Direct Ticket Form */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>📩</span>
                      <span>Gửi tin nhắn hỗ trợ trực tiếp đến Ban Quản Trị</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tin nhắn sẽ được chuyển trực tiếp tới tab Hỗ Trợ trong trang quản trị Admin
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="mailto:support@omni.ai"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-rose-500 hover:border-rose-500 transition-colors"
                    >
                      ✉️ Email
                    </a>
                    <a
                      href="https://t.me/omni_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-xs transition-colors"
                    >
                      Telegram ➔
                    </a>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <textarea
                    rows={2}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Mô tả vấn đề hoặc góp ý của bạn để Admin xử lý giúp bạn..."
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 transition-colors resize-none"
                  />
                  {supportNotice && (
                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <span>✓</span> {supportNotice}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSendingSupport || !supportMessage.trim()}
                      onClick={handleSendSupportMessage}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>{isSendingSupport ? "⏳ Đang gửi..." : "🚀 Gửi Yêu Cầu Hỗ Trợ"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credit Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        defaultPackageId={selectedRechargePkg}
        initialCustomCredits={modalCustomCredits}
        autoCheckout={true}
      />
    </div>
  );
}
