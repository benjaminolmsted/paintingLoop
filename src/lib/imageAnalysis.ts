import { openai } from './openai';

export async function describeImage(image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You return strictly descriptive, non-interpretive prose about the supplied image.\nDo not infer intent, symbolism, psychology, or narrative. Describe only what is visually present."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image."
          },
          {
            type: "image_url",
            image_url: {
              url: image
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  });

  return response.choices[0].message.content || "";
}

export async function critiqueImage(image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a contemporary critical theorist with deep familiarity with art history, institutional critique, and the present art-market discourse.\nYou produce interpretive, contextual, and evaluative writing as if for a gallery press-release or review.\nYou do not merely describe; you locate the work inside current cultural and art-market conditions."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Critique this image."
          },
          {
            type: "image_url",
            image_url: {
              url: image
            }
          }
        ]
      }
    ],
    max_tokens: 1000
  });

  return response.choices[0].message.content || "";
}
