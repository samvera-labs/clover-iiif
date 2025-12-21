import { I18nextProvider } from "react-i18next";
import React from "react";
import { i18n } from "i18next";
import { initCloverI18n } from "src/i18n/config";

const initializedInstance = initCloverI18n();

/**
 * A provider for testing components that use i18next.
 */
export function I18NextTestingProvider({
  children,
  i18nextConfig = initializedInstance,
}: {
  children: React.ReactNode;
  i18nextConfig?: i18n;
}) {
  return <I18nextProvider i18n={i18nextConfig}>{children}</I18nextProvider>;
}
