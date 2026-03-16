export const COMMANDS = {
  who: "Nyaomaru is a cat. He's a frontend engineer who loves React and Vue.",
  where: 'Nyaomaru moved to Heerlen in the Netherlands from Japan. He works fully remotely.',
  'how-long':
    'Nyaomaru has worked as a software engineer for over 7 years, mainly focusing on frontend.',
  language:
    'He uses TypeScript, JavaScript, HTML, and CSS. He also has experience with Java, PHP, Python, Kotlin, and Swift. Languages: Japanese, English, a little Dutch.',
  favorite: 'React, Vue, catnip, and growing radishes!',
  help: `Available commands:
- who: Learn about Nyaomaru
- where: Find out where Nyaomaru is based
- how-long: Discover Nyaomaru's experience
- language: See the languages Nyaomaru uses
- favorite: Find out Nyaomaru's favorites
`,
} as const;
export type CommandKey = keyof typeof COMMANDS;

export const INITIAL_MESSAGE = `Welcome to Nyaomaru's Terminal!

I'm a frontend engineer who loves to code and share knowledge.
Feel free to ask me anything using like below commands:

who / where / how-long / language / favorite / etc...

What would you like to know about me?`;
