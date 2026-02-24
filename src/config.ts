// src/config.ts
import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

// get path: ~/.gatorconfig.json
function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

// validate JSON structure
function validateConfig(raw: any): Config {
  if (!raw.db_url) {
    throw new Error("Missing db_url in config");
  }

  return {
    dbUrl: raw.db_url,
    currentUserName: raw.current_user_name,
  };
}

// write config to file
function writeConfig(cfg: Config) {
  const raw = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(raw, null, 2));
}

// exported: read config
export function readConfig(): Config {
  const data = fs.readFileSync(getConfigFilePath(), "utf-8");
  const raw = JSON.parse(data);
  return validateConfig(raw);
}

// exported: set user
export function setUser(name: string) {
  const cfg = readConfig();
  cfg.currentUserName = name;
  writeConfig(cfg);
}
