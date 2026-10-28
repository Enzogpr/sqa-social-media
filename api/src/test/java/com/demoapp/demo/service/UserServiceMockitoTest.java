package com.demoapp.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.demoapp.demo.model.User;
import com.demoapp.demo.repository.UserRepository;

// Essa anotação liga os superpoderes do Mockito neste arquivo!
@ExtendWith(MockitoExtension.class)
public class UserServiceMockitoTest {

    // Criamos um "robô" que finge ser o banco de dados
    @Mock
    private UserRepository userRepository;

    // Injetamos esse "robô" falsificado dentro do nosso Service de verdade
    @InjectMocks
    private UserService userService;

    @Test
    public void deveCriarUsuarioSalvandoNoBancoDeDados() {
        // PREPARAÇÃO (Arrange): Ensinamos o robô o que ele deve fazer
        User usuarioFalso = new User();
        usuarioFalso.setId(1L);
        usuarioFalso.setEmail("teste@teste.com");
        usuarioFalso.setPassword("Senha123!");

        // Dizemos: "Quando alguém mandar você salvar qualquer usuário, retorne o usuarioFalso"
        when(userRepository.save(any(User.class))).thenReturn(usuarioFalso);

        // AÇÃO (Act): O que queremos testar de verdade
        User resultado = userService.createUser("teste@teste.com", "Senha123!");

        // VALIDAÇÃO (Assert):
        // 1. Verificamos se o serviço retornou o usuário correto
        assertEquals("teste@teste.com", resultado.getEmail());

        // 2. SEU DESAFIO: Use o Mockito para verificar se o comando 'save' do repositório
        // foi chamado exatamente 1 vez!
        // DICA: Use verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void deveBuscarUsuarioPorEmailComSucesso() {
        // PREPARAÇÃO
        User usuarioFalso = new User();
        usuarioFalso.setEmail("busca@teste.com");

        // Ensinamos o robô a encontrar o usuário
        when(userRepository.findByEmail("busca@teste.com")).thenReturn(Optional.of(usuarioFalso));

        // AÇÃO
        User resultado = userService.findByEmail("busca@teste.com");

        // SEU DESAFIO: Escreva um assert garantindo que o resultado NÃO é nulo!
        // DICA: Use assertNotNull(resultado);
        assertNotNull(resultado);
    }
}
