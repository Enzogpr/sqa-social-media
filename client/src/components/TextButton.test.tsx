import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextButton from "./TextButton";
import "@testing-library/jest-dom";

describe("Componente: TextButton", () => {
    it("Deve renderizar o botão com o texto correto", () => {
        // 1. Renderizamos o componente na tela de mentirinha
        render(<TextButton>Meu Botão Teste</TextButton>);

        // 2. Procuramos se existe algum elemento na tela com o texto "Meu Botão Teste"
        const botao = screen.getByText("Meu Botão Teste");

        expect(botao).toBeInTheDocument();

    });

    it("Deve chamar a função ao ser clicado", () => {
        // 1. Criamos uma função falsa (mock) só para ver se ela é chamada
        const funcaoFalsa = jest.fn();

        // 2. Renderizamos o botão passando a função falsa no onClick
        render(<TextButton onClick={funcaoFalsa}>Clique Aqui</TextButton>);

        // 3. Simulamos um clique no botão
        const botao = screen.getByText("Clique Aqui");
        fireEvent.click(botao);

        expect(funcaoFalsa).toHaveBeenCalledTimes(1);

    });
});
