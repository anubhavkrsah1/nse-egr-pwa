import Fastify from "fastify";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { createWhatsAppClient } from "./services/whatsapp.js";
import { createDatabaseService } from "./services/db.js";
import { createWebhookHandler } from "./handlers/webhook.js";

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "PHONE_NUMBER_ID",
  "WHATSAPP_API_TOKEN",
  "WEBHOOK_VERIFY_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "ANTHROPIC_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

async function bootstrap() {
  // Initialize Fastify
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      prettyPrint: { colorize: true },
    },
  });

  // Initialize services
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const whatsapp = createWhatsAppClient(
    process.env.PHONE_NUMBER_ID!,
    process.env.WHATSAPP_API_TOKEN!
  );

  const db = createDatabaseService(supabase);

  const webhookHandler = createWebhookHandler(
    whatsapp,
    db,
    process.env.WEBHOOK_VERIFY_TOKEN!
  );

  // Health check
  fastify.get("/health", async (req, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Webhook endpoint
  fastify.get("/webhook", async (req, reply) => {
    await webhookHandler.handleVerify(req, reply);
  });

  fastify.post("/webhook", async (req, reply) => {
    await webhookHandler.handleMessage(req, reply);
  });

  // Start server
  const port = parseInt(process.env.PORT || "3000");
  const host = process.env.HOST || "0.0.0.0";

  try {
    await fastify.listen({ port, host });
    console.log(`✓ Server running on http://${host}:${port}`);
    console.log(`✓ Webhook: POST http://${host}:${port}/webhook`);
    console.log(`✓ Verify: GET http://${host}:${port}/webhook`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
