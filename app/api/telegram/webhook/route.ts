import { webhookCallback } from "grammy";
import { PrismaClient } from "@prisma/client";
import { telegramService } from "@/app/services/telegramService";

const prisma = new PrismaClient();
const bot = telegramService.getBot();

// Define bot logic
bot.command("start", async (ctx) => {
    const token = ctx.match; // The payload (e.g., /start <token>)
    const chatId = ctx.chat.id.toString();

    if (!token) {
        return ctx.reply("Welcome to Ethereal Techno Bot. Please use the link from the dashboard to connect your account.");
    }

    try {
        // Find user with this token
        const user = await prisma.user.findFirst({
            where: { telegramConnectionToken: token }
        });

        if (!user) {
            return ctx.reply("Invalid or expired connection token. Please try again from the dashboard.");
        }

        // Update user with chatId and clear token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                telegramChatId: chatId,
                telegramUsername: ctx.chat.username || ctx.chat.first_name, // Fallback if no username
                telegramConnectionToken: null // One-time use
            }
        });

        await ctx.reply(`Account connected successfully! welcome, ${user.username}.`);

        // Generate and send invite link
        const inviteLink = await telegramService.generateInviteLink();
        if (inviteLink) {
            await ctx.reply("Here is your exclusive link to join the Private Community Group:", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Join Group", url: inviteLink }]
                    ]
                }
            });
        } else {
            await ctx.reply("Error generating invite link. Please contact support.");
        }

    } catch (error) {
        console.error("Webhook processing error:", error);
        ctx.reply("An error occurred while connecting your account.");
    }
});

// Create the webhook handler
// Note: Next.js App Router needs a specific way to handle the request body stream for grammy
export const POST = webhookCallback(bot, "std/http");
