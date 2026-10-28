package com.demoapp.demo.service;

import com.demoapp.demo.model.UserPostReaction;
import com.demoapp.demo.repository.UserPostReactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {
  @Mock
  private UserPostReactionRepository repository;
  private MockRestServiceServer dummyJson;
  private PostService service;

  @BeforeEach
  void prepararHttp() {
    // Somente os testes unitários substituem o HTTP externo por respostas conhecidas.
    RestTemplate http = new RestTemplate();
    dummyJson = MockRestServiceServer.bindTo(http).build();
    service = new PostService(repository, http, new ObjectMapper());
  }

  @Test
  void devePreservarLikesEDislikesNoFeed() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts?limit=1&skip=0"))
        .andRespond(withSuccess("""
            {"posts":[{"id":7,"title":"Post","body":"Texto",
            "reactions":{"likes":42,"dislikes":3}}],"total":1,"skip":0,"limit":1}
            """, MediaType.APPLICATION_JSON));

    Map<String, Object> result = service.getPosts(1, 0, null);
    Map<?, ?> post = (Map<?, ?>) ((List<?>) result.get("posts")).get(0);

    assertEquals(Map.of("likes", 42, "dislikes", 3), post.get("reactions"));
    assertEquals(false, post.get("liked"));
    dummyJson.verify();
  }

  @Test
  void deveUsarZeroQuandoNaoHouverReactions() {
    dummyJson.expect(requestTo("https://dummyjson.com/posts?limit=1&skip=0"))
        .andRespond(withSuccess("""
            {"posts":[{"id":7,"title":"Post","body":"Texto"}],
            "total":1,"skip":0,"limit":1}
            """, MediaType.APPLICATION_JSON));

    Map<String, Object> result = service.getPosts(1, 0, null);
    Map<?, ?> post = (Map<?, ?>) ((List<?>) result.get("posts")).get(0);

    assertEquals(Map.of("likes", 0, "dislikes", 0), post.get("reactions"));
    dummyJson.verify();
  }

  @Test
  void devePreservarReactionsTambemNosPostsCurtidos() {
    UserPostReaction reaction = new UserPostReaction();
    reaction.setUserId(5L);
    reaction.setPostId(7L);
    when(repository.findByUserId(5L)).thenReturn(List.of(reaction));
    dummyJson.expect(requestTo("https://dummyjson.com/posts/7"))
        .andRespond(withSuccess("""
            {"id":7,"title":"Post","body":"Texto","reactions":{"likes":42,"dislikes":3}}
            """, MediaType.APPLICATION_JSON));

    Map<String, Object> result = service.getLikedPosts(5L, 1, 0);
    Map<?, ?> post = (Map<?, ?>) ((List<?>) result.get("posts")).get(0);

    assertEquals(Map.of("likes", 42, "dislikes", 3), post.get("reactions"));
    assertEquals(true, post.get("liked"));
    dummyJson.verify();
  }
}
