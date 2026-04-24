import SidebarToggleButton from "./sidebar-toggle-button";

type MobileSidebarToggleProps = {
  onClick: () => void;
};

const MobileSidebarToggle = ({ onClick }: MobileSidebarToggleProps) => {
  return (
    <div className="fixed right-3 top-[max(env(safe-area-inset-top),0.75rem)] z-40 lg:hidden">
      <SidebarToggleButton mode="open-mobile" onClick={onClick} />
    </div>
  );
};

export default MobileSidebarToggle;
