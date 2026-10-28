import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostCard from "./PostCard";

describe("Contadores de reações do PostCard", () => {
  // Verificamos valores distintos para evitar que likes/dislikes sejam trocados.
  it.each([
    { likes: 42, dislikes: 3 },
    { likes: 0, dislikes: 0 },
  ])("exibe $likes curtidas e $dislikes descurtidas", (reactions) => {
    render(
      <PostCard
        post={{ id: 7, title: "Post", body: "Texto", liked: false, reactions }}
        isAuthenticated={false}
        onLike={jest.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByTestId("post-likes")).toHaveTextContent(`${reactions.likes} curtidas`);
    expect(screen.getByTestId("post-dislikes")).toHaveTextContent(`${reactions.dislikes} descurtidas`);
  });
});
