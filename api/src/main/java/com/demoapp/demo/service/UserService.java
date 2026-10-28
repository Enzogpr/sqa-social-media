package com.demoapp.demo.service;

import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import com.demoapp.demo.model.User;

import com.demoapp.demo.repository.UserRepository;

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public boolean isEmailValid(String email) {
    return email != null && email.contains("@");
  }

  public boolean isPasswordValid(String password) {
    // A mesma regra do frontend: oito caracteres e pelo menos um de cada grupo.
    // Pontuação como ponto e exclamação também conta como caractere especial.
    String passRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9\\s]).{8,}$";
    return password != null && Pattern.matches(passRegex, password);
  }

  public User createUser(String email, String password) {
    User user = new User();
    user.setEmail(email);
    user.setPassword(password);
    return userRepository.save(user);
  }

  public User findByEmail(String email) {
    return userRepository.findByEmail(email).orElse(null);
  }

}
