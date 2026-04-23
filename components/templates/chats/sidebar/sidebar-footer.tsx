import { Activity, CircleQuestionMark, Moon, Settings, Sun, User } from "lucide-react";
import SidebarFooterItem from "./sidebar-footer-item";

type SidebarFooterProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

const SidebarFooter = ({ isDarkMode, onToggleTheme }: SidebarFooterProps) => {
  return (
    <footer className="mt-auto border-t border-[#c4cee3] pt-5 dark:border-[#304073]">
      <div className="space-y-1">
        <SidebarFooterItem icon={<CircleQuestionMark className="size-5" />} label="راهنما" />
        <SidebarFooterItem icon={<Activity className="size-5" />} label="فعالیت" />
        <SidebarFooterItem
          icon={isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          label={isDarkMode ? "تم روشن" : "تم تیره"}
          onClick={onToggleTheme}
          isActive
        />
        <SidebarFooterItem icon={<Settings className="size-5" />} label="تنظیمات" />
        <SidebarFooterItem icon={<User className="size-5" />} label="حساب کاربری" />
      </div>
    </footer>
  );
};

export default SidebarFooter;
