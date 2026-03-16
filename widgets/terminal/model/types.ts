export type TerminalHistory = {
  /** The content of the terminal line (command or response) */
  text: string;
  /** Whether the text is currently being typed with animation */
  isTyping: boolean;
};
