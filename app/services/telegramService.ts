import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
const GROUP_ID = process.env.TELEGRAM_GROUP_ID || "";

export const telegramService = {
    /**
     * Generates a single-use invite link for the private group.
     */
    async generateInviteLink(): Promise<string | null> {
        try {
            if (!GROUP_ID) throw new Error("TELEGRAM_GROUP_ID not set");

            const invite = await bot.api.createChatInviteLink(GROUP_ID, {
                member_limit: 1, // One-time use
                // expire_date: Math.floor(Date.now() / 1000) + 3600 // Optional: expires in 1 hour
            });
            return invite.invite_link;
        } catch (error) {
            console.error("Error generating Telegram invite link:", error);
            return null;
        }
    },

    /**
     * Kicks (bans) a user from the group.
     * Note: In Telegram, "kick" is technically banChatMember.
     * To just remove without banning permanently, we can unban immediately after.
     */
    async kickUser(chatId: string | number): Promise<boolean> {
        try {
            if (!GROUP_ID) throw new Error("TELEGRAM_GROUP_ID not set");

            // Ban user (removes them)
            await bot.api.banChatMember(GROUP_ID, Number(chatId));

            // Immediately unban so they can rejoin if they re-verify later
            await bot.api.unbanChatMember(GROUP_ID, Number(chatId));

            return true;
        } catch (error) {
            console.error(`Error kicking user ${chatId} from Telegram group:`, error);
            return false;
        }
    },

    /**
     * Sends a message to a specific user.
     */
    async sendMessage(chatId: string | number, text: string) {
        try {
            await bot.api.sendMessage(Number(chatId), text);
        } catch (error) {
            console.error(`Error sending message to ${chatId}:`, error);
        }
    },

    /**
     * Returns the bot instance for webhook handling.
     */
    getBot() {
        return bot;
    }
};
