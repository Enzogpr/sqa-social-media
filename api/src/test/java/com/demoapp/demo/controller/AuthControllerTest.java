package com.demoapp.demo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.mockito.Mockito.when;

import com.demoapp.demo.model.User;
import com.demoapp.demo.service.UserService;

// @WebMvcTest sobe apenas a camada web (Controllers) sem precisar carregar o banco de dados
@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc; // O "robô" que simula requisições HTTP (GET, POST...)

    @MockBean
    private UserService userService; // Criamos um "dublê" (mock) do serviço para não depender dele

    @Test
    public void deveRetornarErro400SeEmailNaoEnviadoNoCadastro() throws Exception {
        // Estamos simulando um POST para /auth/signup com um JSON vazio "{}"
        mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))

                // SEU DESAFIO: Escreva a verificação (expect) de que o status HTTP retornado é 400 (Bad Request)
                // DICA: use .andExpect(status().isBadRequest())

                .andExpect(jsonPath("$.message").value("E-mail e senha são obrigatórios"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void deveRetornarSucessoNoLoginQuandoOk() throws Exception {
        // Criamos o JSON perfeito para login
        String jsonValido = "{\"email\": \"teste@teste.com\", \"password\": \"Senha12!\"}";

        // O serviço é um mock: precisamos preparar seus retornos para esse cenário.
        // Sem isso, as validações retornariam false e o controller recusaria o login.
        User usuario = new User();
        usuario.setId(1L);
        usuario.setEmail("teste@teste.com");
        usuario.setPassword("Senha12!");
        when(userService.isEmailValid("teste@teste.com")).thenReturn(true);
        when(userService.isPasswordValid("Senha12!")).thenReturn(true);
        when(userService.findByEmail("teste@teste.com")).thenReturn(usuario);

        mockMvc.perform(post("/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonValido))

                // SEU DESAFIO: Escreva a verificação (expect) de que o status HTTP retornado é 200 (OK)
                // DICA: use .andExpect(status().isOk())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("teste@teste.com"));
    }
}
