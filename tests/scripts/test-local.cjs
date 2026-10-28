// Arquivo .cjs usa CommonJS (require). spawn inicia outro processo do Node.js.
const { spawn } = require('node:child_process');

// O runner do Playwright inicia e encerra os servidores definidos no webServer.
// process.execPath usa o mesmo Node deste script.
// require.resolve encontra o CLI instalado; "test" manda executar a suíte.
// slice(2) repassa argumentos extras, como --project=api ou --headed.
const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...process.argv.slice(2)], {
  // Mostrar no terminal atual os logs e resultados do processo filho.
  stdio: 'inherit',
  env: {
    // Manter as variáveis do ambiente, incluindo PATH e a localização do Java.
    ...process.env,
    // Ativar webServer no playwright.config.ts.
    START_SERVERS: 'true',
    // Usar portas separadas das tradicionais; aceitar endereços personalizados.
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8081',
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL || 'http://localhost:3001',
  },
});

// Se o processo nem conseguir iniciar, informar o erro e devolver falha.
child.on('error', error => {
  console.error(error);
  process.exitCode = 1;
});
// Propagar o resultado: 0 é sucesso; 1 indica falha nos testes/execução.
// ?? usa 1 quando o processo termina sem um código numérico (por exemplo, sinal).
child.on('exit', code => { process.exitCode = code ?? 1; });
