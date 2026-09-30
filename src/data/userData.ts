export interface CmsUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "vip" | "member";
  status: "active" | "banned" | "pending";
  avatar: string;
  joinedDate: string;
  lastLogin: string;
  promptsCount: number;
}

