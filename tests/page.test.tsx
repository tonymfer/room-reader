/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../app/page";

type FakeSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        results: Array<{ 0: { transcript: string }; isFinal: boolean }>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

describe("room-reader rendered page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the required safety framing copy", () => {
    render(<Home />);

    expect(
      screen.getByText(
        /room-reader uses editable audience cards and topic-specific lenses for rehearsal/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Personas are rehearsal assumptions, not psychological profiles/i,
      ),
    ).toBeInTheDocument();
  });

  it("starts as an app flow on topic setup instead of a dashboard", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /choose your rehearsal room/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue to audience setup/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/rehearsal transcript textarea fallback/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply joke to audience/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /end rehearsal/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/room report/i)).not.toBeInTheDocument();
  });

  it("progresses topic setup to audience setup to rehearsal room to report", async () => {
    render(<Home />);

    fireEvent.click(
      screen.getByRole("button", { name: /continue to audience setup/i }),
    );
    expect(
      screen.getByRole("heading", { name: /register the audience/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ondrey")).toBeInTheDocument();
    expect(screen.getByText("George")).toBeInTheDocument();
    expect(screen.getByText("Tony")).toBeInTheDocument();
    expect(screen.getByText("Balaji")).toBeInTheDocument();
    expect(screen.getByText("Elon Musk")).toBeInTheDocument();
    expect(screen.getByText("Xi Jinping")).toBeInTheDocument();
    expect(screen.getByText("Mark Zuckerberg")).toBeInTheDocument();
    expect(screen.getByText("Generic audience")).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Marcus")).toBeInTheDocument();
    expect(
      screen.getByText(/structure-focused comedy audience member/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/marketing operator with sharp editorial instincts/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /fast-taste product builder with blunt editorial standards/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /copy persona request prompt/i }),
    ).toBeInTheDocument();
    expect(
      (screen.getByLabelText(/persona request prompt/i) as HTMLTextAreaElement)
        .value,
    ).toMatch(/stand-up comedy audience card/i);
    expect(
      screen.getByText(/Ask a friend or public-figure research pass/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/persona name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enter rehearsal room/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /apply joke to audience/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /end rehearsal/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /enter rehearsal room/i }),
    );
    expect(screen.getByText(/audience agents waiting/i)).toBeInTheDocument();
    const textarea = screen.getByLabelText(
      /rehearsal transcript textarea fallback/i,
    ) as HTMLTextAreaElement;
    expect(textarea).toBeEnabled();
    expect(textarea.value).toBe("");
    expect(
      screen.getByRole("button", { name: /apply joke to audience/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /end rehearsal/i }),
    ).toBeDisabled();
    fireEvent.change(textarea, {
      target: { value: "A short joke about AI cofounders." },
    });
    expect(
      screen.getByRole("button", { name: /apply joke to audience/i }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /end rehearsal/i }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /apply joke to audience/i }));
    await waitFor(() =>
      expect(screen.getAllByLabelText(/reaction/i).length).toBeGreaterThan(0),
    );
    expect(screen.queryByLabelText(/room report/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /end rehearsal/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/room report/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /rehearse revised version/i }),
    ).toBeInTheDocument();
  });

  it("applies captured mic speech to audience agents when mic is turned off", async () => {
    let lastInstance: FakeSpeechRecognition | null = null;
    class Fake implements FakeSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult: FakeSpeechRecognition["onresult"] = null;
      onerror: FakeSpeechRecognition["onerror"] = null;
      onend: FakeSpeechRecognition["onend"] = null;
      start() {}
      stop() {
        this.onend?.();
      }
      constructor() {
        lastInstance = this;
      }
    }
    const previous = window.SpeechRecognition;
    (
      window as unknown as { SpeechRecognition: typeof Fake }
    ).SpeechRecognition = Fake;
    try {
      render(<Home />);
      fireEvent.click(
        screen.getByRole("button", { name: /continue to audience setup/i }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: /enter rehearsal room/i }),
      );

      fireEvent.click(screen.getByRole("button", { name: /start mic/i }));
      expect(lastInstance).not.toBeNull();
      expect(
        screen.getByRole("button", { name: /stop mic/i }),
      ).toBeInTheDocument();

      act(() => {
        lastInstance!.onresult?.({
          results: [
            {
              0: { transcript: "my AI cofounder hurt my feelings" },
              isFinal: true,
            },
          ],
        });
      });

      const textarea = screen.getByLabelText(
        /rehearsal transcript textarea fallback/i,
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe("my AI cofounder hurt my feelings");

      fireEvent.click(screen.getByRole("button", { name: /stop mic/i }));
      await waitFor(() =>
        expect(screen.getAllByLabelText(/reaction/i).length).toBeGreaterThan(0),
      );
      expect(screen.queryByLabelText(/room report/i)).not.toBeInTheDocument();
    } finally {
      if (previous) {
        (
          window as unknown as { SpeechRecognition: typeof previous }
        ).SpeechRecognition = previous;
      } else {
        delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
      }
    }
  });

  it("does not trigger room check when mic is turned off without any speech", () => {
    let lastInstance: FakeSpeechRecognition | null = null;
    class Fake implements FakeSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult: FakeSpeechRecognition["onresult"] = null;
      onerror: FakeSpeechRecognition["onerror"] = null;
      onend: FakeSpeechRecognition["onend"] = null;
      start() {}
      stop() {
        this.onend?.();
      }
      constructor() {
        lastInstance = this;
      }
    }
    const previous = window.SpeechRecognition;
    (
      window as unknown as { SpeechRecognition: typeof Fake }
    ).SpeechRecognition = Fake;
    try {
      render(<Home />);
      fireEvent.click(
        screen.getByRole("button", { name: /continue to audience setup/i }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: /enter rehearsal room/i }),
      );

      fireEvent.click(screen.getByRole("button", { name: /start mic/i }));
      expect(lastInstance).not.toBeNull();

      fireEvent.click(screen.getByRole("button", { name: /stop mic/i }));
      expect(screen.queryByLabelText(/room report/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /start mic/i }),
      ).toBeInTheDocument();
    } finally {
      if (previous) {
        (
          window as unknown as { SpeechRecognition: typeof previous }
        ).SpeechRecognition = previous;
      } else {
        delete (window as { SpeechRecognition?: unknown }).SpeechRecognition;
      }
    }
  });

  it("keeps textarea fallback usable when Web Speech API is unsupported in the room step", () => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;

    render(<Home />);
    fireEvent.click(
      screen.getByRole("button", { name: /continue to audience setup/i }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /enter rehearsal room/i }),
    );

    expect(
      screen.getByRole("button", { name: /mic unavailable/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/rehearsal transcript textarea fallback/i),
    ).toBeEnabled();
  });
});
