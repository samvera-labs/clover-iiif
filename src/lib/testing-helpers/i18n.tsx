import { I18nextProvider } from "react-i18next";
import React from "react";
import { i18n } from "i18next";
import i18nextDefaultConfig from "src/i18n/config";

/**
 * A provider for testing components that use i18next.
 */
export function I18NextTestingProvider({
  children,
  i18nextConfig = i18nextDefaultConfig,
}: {
  children: React.ReactNode;
  i18nextConfig?: i18n;
}) {
  return <I18nextProvider i18n={i18nextConfig}>{children}</I18nextProvider>;
}
