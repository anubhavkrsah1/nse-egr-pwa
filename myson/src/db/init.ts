import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function initDb() {
  try {
    console.log("Initializing database schema...");

    // Create parents table
    const { error: parentsError } = await supabase.rpc("exec", {
      sql: `
        CREATE TABLE IF NOT EXISTS parents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          wa_id TEXT UNIQUE NOT NULL,
          parent_name TEXT NOT NULL,
          child_name TEXT NOT NULL,
          child_wa_id TEXT,
          voice_id TEXT DEFAULT 'child_hindi_1',
          language TEXT DEFAULT 'hi',
          reply_mode TEXT DEFAULT 'auto',
          created_at TIMESTAMP DEFAULT now()
        );
      `,
    });

    // For Supabase, we need to use SQL directly via the management API or execute via a stored procedure
    // Let's create a simpler approach using the dashboard or direct SQL execution

    console.log(
      "Note: Run the following SQL in your Supabase dashboard to initialize tables:"
    );

    const sql = `
-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT UNIQUE NOT NULL,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_wa_id TEXT,
  voice_id TEXT DEFAULT 'child_hindi_1',
  language TEXT DEFAULT 'hi',
  reply_mode TEXT DEFAULT 'auto',
  created_at TIMESTAMP DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  label_hi TEXT NOT NULL,
  scheduled_time TIME NOT NULL,
  days_of_week INTEGER NOT NULL DEFAULT 127,
  audio_media_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Create reminder_events table
CREATE TABLE IF NOT EXISTS reminder_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  fired_at TIMESTAMP NOT NULL,
  acknowledged_at TIMESTAMP,
  ack_method TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Create messages table with idempotency guard
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  wa_message_id TEXT UNIQUE NOT NULL,
  direction TEXT NOT NULL,
  transcript TEXT,
  modality TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_parent_id ON reminders(parent_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminder_events_reminder_id ON reminder_events(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_status ON reminder_events(status);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON messages(wa_message_id);
    `;

    console.log(sql);
    console.log("\n✓ Schema definition logged above");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDb();
