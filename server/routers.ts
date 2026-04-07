import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // AI Chat Tool
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: `System: You are AI Saad Studio, a helpful AI assistant. Respond in Urdu, English, or Roman Urdu based on the user's language. Be friendly, helpful, and concise.\n\nUser: ${input.message}`,
              },
            ],
          });
          const replyText = response.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
          return { reply: replyText };
        } catch (error) {
          console.error("LLM Error:", error);
          return { reply: "Error: Could not process your message. Please try again." };
        }
      }),
  }),

  // Image Prompt Generator
  imagePrompt: router({
    generate: publicProcedure
      .input(z.object({ description: z.string().min(1), style: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: `Create a highly detailed, professional image generation prompt for: "${input.description}". Style: ${input.style}. Include lighting, composition, mood, technical details, camera settings, and artistic elements. Make it suitable for AI image generation tools.`,
              },
            ],
          });
          return { prompt: response.choices?.[0]?.message?.content || "Could not generate prompt." };
        } catch (error) {
          console.error("LLM Error:", error);
          return { prompt: "Error: Could not generate image prompt. Please try again." };
        }
      }),
  }),

  // Content Writer
  content: router({
    generate: publicProcedure
      .input(z.object({ topic: z.string().min(1), type: z.string(), language: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: `Write a ${input.type} about: "${input.topic}". Language: ${input.language}. Make it engaging, well-structured, professional, and suitable for the target audience.`,
              },
            ],
          });
          return { content: response.choices?.[0]?.message?.content || "Could not generate content." };
        } catch (error) {
          console.error("LLM Error:", error);
          return { content: "Error: Could not generate content. Please try again." };
        }
      }),
  }),

  // Code Helper
  code: router({
    generate: publicProcedure
      .input(z.object({ description: z.string().min(1), language: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: `Generate clean, well-commented ${input.language} code for: "${input.description}". Include proper error handling, best practices, and explanatory comments.`,
              },
            ],
          });
          return { code: response.choices?.[0]?.message?.content || "Could not generate code." };
        } catch (error) {
          console.error("LLM Error:", error);
          return { code: "Error: Could not generate code. Please try again." };
        }
      }),
  }),

  // Translator
  translate: router({
    translate: publicProcedure
      .input(z.object({ text: z.string().min(1), from: z.string(), to: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const fromLang = input.from === "Auto Detect" ? "auto-detected" : input.from;
          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: `Translate the following text from ${fromLang} to ${input.to}. Provide only the translation without any additional explanation: "${input.text}"`,
              },
            ],
          });
          return { translation: response.choices?.[0]?.message?.content || "Could not translate." };
        } catch (error) {
          console.error("LLM Error:", error);
          return { translation: "Error: Could not translate. Please try again." };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
