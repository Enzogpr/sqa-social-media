package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class UserServiceTest {

    // Instanciamos o service passando null no lugar do repositório
    // porque não vamos usar o banco de dados nestes testes simples!
    private final UserService userService = new UserService(null);

    @Test
    public void deveAceitarSenhaComPonto() {
        // 1. Pegamos a senha que o frontend aceitava mas o backend não (lembra do ponto final?)
        String senhaComPonto = "SenhaForte123.";

        // 2. Chamamos a validação do backend
        boolean resultado = userService.isPasswordValid(senhaComPonto);

        // 3. SEU DESAFIO: Escreva o comando assert para validar o resultado esperado
        // DICA: O JUnit usa assertTrue(resultado) ou assertFalse(resultado)
        // Lembre-se da nossa lição de QA: o que o TESTE ESPERA que seja correto?
        assertTrue(resultado);
    }

    @Test
    public void deveValidarEmailSemArrobaComoInvalido() {
        String emailRuim = "emailsemarroba.com";

        boolean resultado = userService.isEmailValid(emailRuim);

        // SEU DESAFIO: Escreva o comando assert adequado aqui!
        assertFalse(resultado);
    }
}
