// Database models
export interface Parent {
  id: string;
  wa_id: string;
  parent_name: string;
  child_name: string;
  child_wa_id: string | null;
  voice_id: string;
  language: string;
  reply_mode: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  parent_id: string;
  kind: string;
  label_hi: string;
  scheduled_time: string;
  days_of_week: number;
  audio_media_id: string | null;
  active: boolean;
  created_at: string;
}

export interface ReminderEvent {
  id: string;
  reminder_id: string;
  fired_at: string;
  acknowledged_at: string | null;
  ack_method: string | null;
  status: "pending" | "acknowledged" | "missed" | "escalated";
  created_at: string;
}

export interface Message {
  id: string;
  parent_id: string;
  wa_message_id: string;
  direction: "inbound" | "outbound";
  transcript: string | null;
  modality: "text" | "audio";
  created_at: string;
}

// WhatsApp webhook payloads
export interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "audio" | "button" | "image" | "document";
  text?: { body: string };
  audio?: { id: string; mime_type: string };
  button?: { payload: string };
  image?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename: string };
}

export interface WhatsAppWebhookEvent {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts: Array<{ profile: { name: string }; wa_id: string }>;
        messages: WhatsAppWebhookMessage[];
      };
      field: string;
    }>;
  }>;
}

export interface WhatsAppSendPayload {
  messaging_product: string;
  to: string;
  type: string;
  [key: string]: unknown;
}
