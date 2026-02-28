import { useTheme } from "@/components/providers/ThemeProvider";

const ThemeSwitch = () => {
  const { themeMode, setThemeMode } = useTheme();
  const options = [
    {
      value: "day",
      label: "Sáng",
      title: "Luôn dùng nền sáng",
      icon: "fi-rr-sun",
    },
    {
      value: "night",
      label: "Tối",
      title: "Luôn dùng nền tối",
      icon: "fi-rr-moon",
    },
    {
      value: "system",
      label: "Theo hệ thống",
      title: "Theo giao diện hệ thống",
      icon: "fi-rr-screen",
    },
  ];

  return (
    <div className="theme-switch" role="group" aria-label="Chọn giao diện hiển thị">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`theme-switch__option${themeMode === option.value ? " is-active" : ""}`}
          onClick={() => setThemeMode(option.value)}
          aria-pressed={themeMode === option.value}
          title={option.title}
          aria-label={option.label}
        >
          <i className={option.icon} aria-hidden="true" />
          <span className="theme-switch__sr">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export { ThemeSwitch };
