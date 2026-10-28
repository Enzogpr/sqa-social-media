import { isPasswordValid } from "./password";

describe("Validação de Senha (isPasswordValid)", () => {

    it("Deve aceitar uma senha válida com exatamente 8 caracteres", () => {
        // 1. Criei a variável (dentro do 'it' e usando 'const')
        const senha = "Senha12@";

        // 2. Chamei a função e guardei o resultado
        const resultado = isPasswordValid(senha);

        // 3. Verifico se o resultado é o que eu esperava (true)
        expect(resultado).toBe(true);
    });

    it("Deve aceitar senhas válidas que contêm o caractere especial de exclamação", () => {
        const senha = "Senha123!"; // Senha válida acima do mínimo de 8 caracteres.
        const resultado = isPasswordValid(senha); // 2. Chamei a função e guardei o resultado
        expect(resultado).toBe(true); // 3. Verifico se o resultado é o que eu esperava (true)
    });



});
