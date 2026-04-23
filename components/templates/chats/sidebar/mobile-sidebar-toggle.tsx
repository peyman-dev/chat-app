import SidebarToggleButton from "./sidebar-toggle-button";

type MobileSidebarToggleProps = {
  onClick: () => void;
};

const MobileSidebarToggle = ({ onClick }: MobileSidebarToggleProps) => {
  return (
    <div className="fixed right-4 top-4 z-40 lg:hidden">
      <SidebarToggleButton mode="open-mobile" onClick={onClick} />
    </div>
  );
};

export default MobileSidebarToggle;
