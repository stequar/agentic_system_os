import fs from "node:fs";
import path from "node:path";
import {
  CompanySettings,
  CompanySettingsSchema,
  SETTINGS_REFERENCE_CATALOG,
  SettingReferenceEntry,
} from "../contracts/settings.js";

export const SETTINGS_RELATIVE_PATH = path.join(".company-os", "settings.json");

export class SettingsManager {
  public static getSettingsPath(targetPath: string): string {
    return path.join(path.resolve(targetPath), SETTINGS_RELATIVE_PATH);
  }

  public static getDefaultSettings(): CompanySettings {
    return CompanySettingsSchema.parse({});
  }

  public static getReferenceCatalog(): SettingReferenceEntry[] {
    return SETTINGS_REFERENCE_CATALOG;
  }

  public static loadSettings(targetPath: string): CompanySettings {
    const filePath = this.getSettingsPath(targetPath);
    if (!fs.existsSync(filePath)) {
      return this.getDefaultSettings();
    }
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return CompanySettingsSchema.parse(raw);
    } catch {
      return this.getDefaultSettings();
    }
  }

  public static saveSettings(
    targetPath: string,
    settings: CompanySettings
  ): CompanySettings {
    const validated = CompanySettingsSchema.parse(settings);
    const filePath = this.getSettingsPath(targetPath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(validated, null, 2) + "\n", "utf-8");
    return validated;
  }

  public static ensureSettingsFile(targetPath: string): CompanySettings {
    const filePath = this.getSettingsPath(targetPath);
    if (fs.existsSync(filePath)) {
      return this.loadSettings(targetPath);
    }
    return this.saveSettings(targetPath, this.getDefaultSettings());
  }

  public static updateSettingByPath(
    targetPath: string,
    dotKey: string,
    rawValue: string | boolean | number | null
  ): {
    updatedSettings: CompanySettings;
    key: string;
    previousValue: unknown;
    newValue: unknown;
  } {
    const catalogEntry = SETTINGS_REFERENCE_CATALOG.find((e) => e.key === dotKey);
    if (!catalogEntry) {
      const validKeys = SETTINGS_REFERENCE_CATALOG.map((e) => e.key).join(", ");
      throw new Error(
        `Invalid setting key "${dotKey}". Valid keys are: ${validKeys}`
      );
    }

    const current = this.loadSettings(targetPath);
    const parts = dotKey.split(".");
    if (parts.length !== 2) {
      throw new Error(`Setting key "${dotKey}" must follow <section>.<property> format.`);
    }

    const [section, prop] = parts as [keyof CompanySettings, string];
    const sectionObj = current[section] as Record<string, unknown>;
    const previousValue = sectionObj ? sectionObj[prop] : undefined;

    const coercedValue = this.coerceValue(rawValue, catalogEntry.type);
    const nextDraft = structuredClone(current) as Record<string, any>;
    if (!nextDraft[section] || typeof nextDraft[section] !== "object") {
      nextDraft[section] = {};
    }
    nextDraft[section][prop] = coercedValue;

    const validated = this.saveSettings(targetPath, nextDraft as CompanySettings);
    const updatedSection = validated[section] as Record<string, unknown>;

    return {
      updatedSettings: validated,
      key: dotKey,
      previousValue,
      newValue: updatedSection[prop],
    };
  }

  private static coerceValue(
    rawValue: string | boolean | number | null,
    expectedType: SettingReferenceEntry["type"]
  ): unknown {
    if (expectedType === "boolean") {
      if (typeof rawValue === "boolean") return rawValue;
      const normalized = String(rawValue).trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      return rawValue;
    }
    if (expectedType === "number") {
      if (typeof rawValue === "number") return rawValue;
      const num = Number(rawValue);
      return Number.isNaN(num) ? rawValue : num;
    }
    if (expectedType === "string | null") {
      if (rawValue === null) return null;
      const trimmed = String(rawValue).trim();
      if (trimmed.toLowerCase() === "null" || trimmed === "") return null;
      return trimmed;
    }
    return String(rawValue);
  }
}
