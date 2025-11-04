import express from "express";
import { readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gerar hash da versão baseado no timestamp de modificação dos arquivos principais
function getAppVersion() {
  try {
    // Pega o timestamp de modificação do package.json como versão
    const packagePath = join(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const packageStats = statSync(packagePath);
    
    // Usa a versão do package.json ou gera um hash baseado no timestamp
    const version = packageJson.version || "1.0.0";
    
    // Adiciona timestamp de build (última modificação do package.json)
    const buildTime = Math.floor(packageStats.mtimeMs / 1000);
    
    return {
      version,
      buildTime,
      hash: `${version}-${buildTime}`,
    };
  } catch (error) {
    // Fallback: versão baseada em timestamp atual
    const timestamp = Math.floor(Date.now() / 1000);
    return {
      version: "1.0.0",
      buildTime: timestamp,
      hash: `1.0.0-${timestamp}`,
    };
  }
}

// GET /api/version - Retorna a versão atual da aplicação
router.get("/", (req, res) => {
  try {
    const versionInfo = getAppVersion();
    res.json({
      success: true,
      data: versionInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao obter versão",
    });
  }
});

export default router;
