import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the main title', () => {
    render(<App />);
    const title = screen.getByText(/Meme Coin Screener/i);
    expect(title).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<App />);
    const tagline = screen.getByText(/Discover early-stage meme coin opportunities/i);
    expect(tagline).toBeInTheDocument();
  });

  it('renders blockchain selection', () => {
    render(<App />);
    const blockchainTitle = screen.getByText(/Select Blockchain/i);
    expect(blockchainTitle).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<App />);
    const filterTitle = screen.getByText(/Filter Criteria/i);
    expect(filterTitle).toBeInTheDocument();
  });

  it('renders the Apply & Reload button', () => {
    render(<App />);
    const button = screen.getByText(/Apply & Reload/i);
    expect(button).toBeInTheDocument();
  });

  it('button is enabled by default', () => {
    render(<App />);
    const button = screen.getByText(/Apply & Reload/i);
    expect(button).not.toBeDisabled();
  });

  it('can switch between blockchains', () => {
    render(<App />);
    const solanaButton = screen.getByText(/Solana/i);
    const suiButton = screen.getByText(/Sui/i);
    
    expect(solanaButton).toHaveClass('bg-crypto-accent');
    
    fireEvent.click(suiButton);
    expect(suiButton).toHaveClass('bg-crypto-accent');
  });
}); 