export interface PostCommentItem {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  };
}

export interface ExplorePost {
  id: string;
  authorId?: string;
  author: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    isVip?: boolean;
    role?: string;
  };
  title: string;
  content: string;
  category: "prompt" | "assistant" | "art" | "code" | "general";
  categoryLabel: string;
  image?: string;
  likes: number;
  commentsCount: number;
  reactions?: Record<string, number>;
  userReaction?: string | null;
  comments?: PostCommentItem[];
  createdAt: string;
  status: "published" | "hidden";
}

export const INITIAL_POSTS: ExplorePost[] = [];
