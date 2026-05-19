/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from '../app/page';

describe('room-reader rendered page', () => {
  it('renders the required safety framing copy', () => {
    render(<Home />);

    expect(screen.getByText(/room-reader uses editable audience cards and topic-specific lenses for rehearsal/i)).toBeInTheDocument();
    expect(screen.getByText(/Personas are rehearsal assumptions, not psychological profiles/i)).toBeInTheDocument();
  });

  it('starts as an app flow on topic setup instead of a dashboard', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /choose your rehearsal room/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to audience setup/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/rehearsal transcript textarea fallback/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /run room check/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/room report/i)).not.toBeInTheDocument();
  });

  it('progresses topic setup to audience setup to rehearsal room to report', async () => {
    render(<Home />);

    fireEvent.click(screen.getByRole('button', { name: /continue to audience setup/i }));
    expect(screen.getByRole('heading', { name: /register the audience/i })).toBeInTheDocument();
    expect(screen.getByText('Ondrey')).toBeInTheDocument();
    expect(screen.getByText('George')).toBeInTheDocument();
    expect(screen.getByText('Tony')).toBeInTheDocument();
    expect(screen.getByText('Balaji')).toBeInTheDocument();
    expect(screen.getByText('Elon Musk')).toBeInTheDocument();
    expect(screen.getByText('Xi Jinping')).toBeInTheDocument();
    expect(screen.getByText('Mark Zuckerberg')).toBeInTheDocument();
    expect(screen.getByText('Generic audience')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Marcus')).toBeInTheDocument();
    expect(screen.getByText(/structure-focused comedy audience member/i)).toBeInTheDocument();
    expect(screen.getByText(/marketing operator with sharp editorial instincts/i)).toBeInTheDocument();
    expect(screen.getByText(/fast-taste product builder with blunt editorial standards/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy persona request prompt/i })).toBeInTheDocument();
    expect((screen.getByLabelText(/persona request prompt/i) as HTMLTextAreaElement).value).toMatch(/stand-up comedy audience card/i);
    expect(screen.getByText(/Ask a friend or public-figure research pass/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/persona name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter rehearsal room/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /run room check/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /enter rehearsal room/i }));
    expect(screen.getByText(/audience agents waiting/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rehearsal transcript textarea fallback/i)).toBeEnabled();
    expect(screen.getByRole('button', { name: /run room check/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /run room check/i }));
    await waitFor(() => expect(screen.getByLabelText(/room report/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /rehearse revised version/i })).toBeInTheDocument();
  });

  it('keeps textarea fallback usable when Web Speech API is unsupported in the room step', () => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;

    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /continue to audience setup/i }));
    fireEvent.click(screen.getByRole('button', { name: /enter rehearsal room/i }));

    expect(screen.getByRole('button', { name: /mic unavailable/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/rehearsal transcript textarea fallback/i)).toBeEnabled();
  });
});
