import * as vscode from "vscode";
import { Locale, MessageKey, messages } from "./messages";

export type { Locale, MessageKey };
export { messages };

/** Map VS Code UI language to supported panel locale. */
export function resolveLocale(language: string): Locale {
  const norm = language.toLowerCase().replace(/_/g, "-");
  if (norm === "ja" || norm.startsWith("ja-")) {
    return "ja";
  }
  return "en";
}

export function getPanelLocale(): Locale {
  try {
    return resolveLocale(vscode.env.language);
  } catch {
    return "en";
  }
}

export type MessageParams = Record<string, string | number>;

export function t(
  locale: Locale,
  key: MessageKey,
  params?: MessageParams
): string {
  const table = messages[locale] ?? messages.en;
  let text: string = table[key] ?? messages.en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Translate a preflight key or pass through unknown CLI text. */
export function translateIssue(
  locale: Locale,
  issue: MessageKey | string
): string {
  if (issue in messages.en) {
    return t(locale, issue as MessageKey);
  }
  return issue;
}
