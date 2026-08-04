import crypto from "crypto";
import { FastifyRequest, FastifyReply } from "fastify";
import { WhatsAppClient } from "../services/whatsapp.js";
import { DatabaseService } from "../services/db.js";
import { WhatsAppWebhookEvent, WhatsAppWebhookMessage } from "../types.js";

export class WebhookHandler {
  constructor(
    private whatsapp: WhatsAppClient,
    private db: DatabaseService,
    private verifyToken: string
  ) {}

  async handleVerify(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const mode = req.query.hub?.mode as string;
    const token = req.query.hub?.verify_token as string;
    const challenge = req.query.hub?.challenge as string;

    if (mode === "subscribe" && token === this.verifyToken) {
      console.log("Webhook verified");
      reply.type("text/plain").send(challenge);
    } else {
      reply.status(403).send("Forbidden");
    }
  }

  async handleMessage(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const body = req.body as WhatsAppWebhookEvent;

    // Return 200 immediately — process asynchronously
    reply.status(200).send({ success: true });

    try {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field !== "messages") continue;

          const { messages, contacts, metadata } = change.value;

          if (!messages || messages.length === 0) continue;

          const message = messages[0];
          const waId = contacts[0].wa_id;

          // Idempotency: check if message already processed
          const existing = await this.db.getMessageByWaId(message.id);
          if (existing) {
            console.log(`Message ${message.id} already processed, skipping`);
            continue;
          }

          // Get or create parent
          let parent = await this.db.getParentByWaId(waId);
          if (!parent) {
            parent = await this.db.createParent({
              wa_id: waId,
              parent_name: contacts[0].profile.name || "Parent",
              child_name: "Rohit",
              child_wa_id: null,
              voice_id: "child_hindi_1",
              language: "hi",
              reply_mode: "auto",
            });
            console.log(`Created new parent: ${parent.id}`);
          }

          // Log inbound message
          await this.db.logMessage(
            parent.id,
            message.id,
            "inbound",
            message.type === "text" ? message.text?.body : `[${message.type}]`,
            message.type === "audio" ? "audio" : "text"
          );

          // Route based on message type
          if (message.type === "text") {
            await this.handleTextMessage(message, parent);
          } else if (message.type === "audio") {
            await this.handleAudioMessage(message, parent);
          } else if (message.type === "button") {
            await this.handleButtonMessage(message, parent);
          } else {
            await this.handleFallback(message, parent);
          }
        }
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
    }
  }

  private async handleTextMessage(
    message: WhatsAppWebhookMessage,
    parent: any
  ): Promise<void> {
    const body = message.text?.body || "";
    console.log(`Text from ${parent.wa_id}: ${body}`);

    // Echo bot for now
    const messageId = await this.whatsapp.sendText(parent.wa_id, body);
    await this.db.logMessage(parent.id, messageId, "outbound", body, "text");
  }

  private async handleAudioMessage(
    message: WhatsAppWebhookMessage,
    parent: any
  ): Promise<void> {
    const audioId = message.audio?.id;
    console.log(`Audio from ${parent.wa_id}: ${audioId}`);

    // For Day 1, send a hardcoded response
    const response = "Suno, mera voice note.";
    const messageId = await this.whatsapp.sendText(parent.wa_id, response);
    await this.db.logMessage(parent.id, messageId, "outbound", response, "text");
  }

  private async handleButtonMessage(
    message: WhatsAppWebhookMessage,
    parent: any
  ): Promise<void> {
    const payload = message.button?.payload;
    console.log(`Button from ${parent.wa_id}: ${payload}`);

    const responses: Record<string, string> = {
      le_li: "Ache, le li. Thik hain.",
      baad_mein: "Thik hai, baad mein karenge.",
      kaunsi: "Ye konsi goli? Doctor se pooch lenge.",
    };

    const response = responses[payload] || "Samjha nahi.";
    const messageId = await this.whatsapp.sendText(parent.wa_id, response);
    await this.db.logMessage(parent.id, messageId, "outbound", response, "text");
  }

  private async handleFallback(
    message: WhatsAppWebhookMessage,
    parent: any
  ): Promise<void> {
    const response = "Sorry, isme mujhe kuch samjha nahi aya.";
    const messageId = await this.whatsapp.sendText(parent.wa_id, response);
    await this.db.logMessage(parent.id, messageId, "outbound", response, "text");
  }
}

export const createWebhookHandler = (
  whatsapp: WhatsAppClient,
  db: DatabaseService,
  verifyToken: string
): WebhookHandler => {
  return new WebhookHandler(whatsapp, db, verifyToken);
};
