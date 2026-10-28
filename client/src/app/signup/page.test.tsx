import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "./page";

// Criando dublês (mocks) para as rotas e contextos que a tela usa
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/contexts/AuthContext", () => ({
    useAuth: () => ({ login: jest.fn() }),
}));

describe("Tela de Cadastro (Integração)", () => {

    it("Deve mostrar erro se as senhas não coincidirem", async () => {
        render(<SignUp />);

        // 1. Encontramos os campos na tela
        const emailInput = screen.getByLabelText("Email");
        const senhaInput = screen.getByLabelText("Senha");
        const confirmarSenhaInput = screen.getByLabelText("Confirmar Senha");
        // A página também tem esse botão no header: selecionar o da área principal.
        const botaoCriar = within(screen.getByRole("main")).getByRole("button", { name: "Criar Conta" });

        // 2. Simulamos o usuário digitando (senhas diferentes!)
        fireEvent.change(emailInput, { target: { value: "teste@teste.com" } });
        fireEvent.change(senhaInput, { target: { value: "SenhaForte1!" } });
        fireEvent.change(confirmarSenhaInput, { target: { value: "SenhaDiferente2@" } });

        // 3. Simulamos o clique no botão
        fireEvent.click(botaoCriar);

        // 4. SEU DESAFIO: Escreva um expect verificando se a mensagem de erro "As senhas não coincidem" apareceu na tela.
        // DICA: Use await waitFor(() => expect(screen.getByText("TEXTO DO ERRO AQUI")).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument());
    });

    it("Deve mostrar erro de validação do próprio email", async () => {
        render(<SignUp />);
        const emailInput = screen.getByLabelText("Email");
        const botaoCriar = within(screen.getByRole("main")).getByRole("button", { name: "Criar Conta" });

        // 1. Simulamos um email completamente errado (sem o @)
        fireEvent.change(emailInput, { target: { value: "emailinvalido" } });
        fireEvent.click(botaoCriar);

        // 2. SEU DESAFIO: Escreva um expect verificando se a mensagem "Email inválido" apareceu na tela.
        // DICA: Faça igualzinho ao desafio anterior!
        await waitFor(() => expect(screen.getByText("Email inválido")).toBeInTheDocument());
    });

});
