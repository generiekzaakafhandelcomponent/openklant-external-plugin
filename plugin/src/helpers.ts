import {config} from "@valtimo/plugin-sdk";

export function getAuthHeaders(): Record<string, string> {
  const token = config.get("apiToken") as string;
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function getBaseUrl(): string {
  const baseUrl = config.get("baseUrl") as string;
  return baseUrl.replace(/\/$/, "");
}

export function setAtPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split("/").filter((p) => p.length > 0);
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== "object") {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  if (parts.length > 0) {
    current[parts[parts.length - 1]] = value;
  }
}
