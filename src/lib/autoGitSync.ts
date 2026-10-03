import { exec } from "child_process";
import path from "path";

// Watcher script để tự động đẩy git khi bạn lưu tệp (File Save)
let debounceTimer: NodeJS.Timeout | null = null;

export function triggerAutoGitSync() {
  if (process.env.NODE_ENV !== "development") return;

  if (debounceTimer) clearTimeout(debounceTimer);

  // Chờ 15 giây sau lần lưu file cuối cùng mới thực hiện push để không gây lag
  debounceTimer = setTimeout(() => {
    const scriptPath = path.join(process.cwd(), "scripts", "auto_git_sync.bat");
    exec(`"${scriptPath}"`, (err, stdout, stderr) => {
      if (!err) {
        console.log("🚀 [Auto-Git] Da tu dong dong bo code len GitHub!");
      }
    });
  }, 15000);
}
