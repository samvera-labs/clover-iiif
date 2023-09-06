import { useTheme } from "nextra-theme-docs";

const isDark = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
};

export { isDark };
