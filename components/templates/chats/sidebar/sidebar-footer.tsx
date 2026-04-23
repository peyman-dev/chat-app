import { Activity, CircleQuestionMark, Moon, Settings, Sun, User } from "lucide-react";
import SidebarFooterItem from "./sidebar-footer-item";

type SidebarFooterProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  collapsed?: boolean;
};

const SidebarFooter = ({ isDarkMode, onToggleTheme, collapsed = false }: SidebarFooterProps) => {
  return (
    <footer className="mt-auto border-t border-white/20 pt-4 dark:border-white/15">
      <div className="space-y-1.5">
        <SidebarFooterItem icon={<CircleQuestionMark className="size-[18px]" />} label="راهنما" collapsed={collapsed} />
        <SidebarFooterItem icon={<Activity className="size-[18px]" />} label="فعالیت" collapsed={collapsed} />
        <SidebarFooterItem
          icon={isDarkMode ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          label={isDarkMode ? "تم روشن" : "تم تیره"}
          onClick={onToggleTheme}
          isActive
          collapsed={collapsed}
        />
        <SidebarFooterItem icon={<Settings className="size-[18px]" />} label="تنظیمات" collapsed={collapsed} />
        <SidebarFooterItem icon={<User className="size-[18px]" />} label="حساب کاربری" collapsed={collapsed} />
      </div>
    </footer>
  );
};

export default SidebarFooter;
