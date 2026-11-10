import { CompanySettings, SettingReferenceEntry } from "../contracts/settings.js";
export declare const SETTINGS_RELATIVE_PATH: string;
export declare class SettingsManager {
    static getSettingsPath(targetPath: string): string;
    static getDefaultSettings(): CompanySettings;
    static getReferenceCatalog(): SettingReferenceEntry[];
    static loadSettings(targetPath: string): CompanySettings;
    static saveSettings(targetPath: string, settings: CompanySettings): CompanySettings;
    static ensureSettingsFile(targetPath: string): CompanySettings;
    static updateSettingByPath(targetPath: string, dotKey: string, rawValue: string | boolean | number | null): {
        updatedSettings: CompanySettings;
        key: string;
        previousValue: unknown;
        newValue: unknown;
    };
    private static coerceValue;
}
//# sourceMappingURL=settings-manager.d.ts.map