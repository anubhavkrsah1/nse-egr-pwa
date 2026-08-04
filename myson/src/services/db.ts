import { SupabaseClient } from "@supabase/supabase-js";
import { Parent, Reminder, ReminderEvent, Message } from "../types.js";

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async getParentByWaId(waId: string): Promise<Parent | null> {
    const { data, error } = await this.supabase
      .from("parents")
      .select("*")
      .eq("wa_id", waId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }

  async createParent(parent: Omit<Parent, "id" | "created_at">): Promise<Parent> {
    const { data, error } = await this.supabase
      .from("parents")
      .insert([parent])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logMessage(
    parentId: string,
    waMessageId: string,
    direction: "inbound" | "outbound",
    transcript?: string,
    modality?: "text" | "audio"
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from("messages")
      .insert([
        {
          parent_id: parentId,
          wa_message_id: waMessageId,
          direction,
          transcript,
          modality,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessageByWaId(waMessageId: string): Promise<Message | null> {
    const { data, error } = await this.supabase
      .from("messages")
      .select("*")
      .eq("wa_message_id", waMessageId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }

  async getRemindersDue(scheduledTime: string): Promise<Reminder[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayBit = 1 << dayOfWeek;

    const { data, error } = await this.supabase
      .from("reminders")
      .select("*")
      .eq("scheduled_time", scheduledTime)
      .eq("active", true)
      .gt("days_of_week", dayBit - 1);

    if (error) throw error;
    return data || [];
  }

  async logReminderEvent(
    reminderId: string,
    status: "pending" | "acknowledged" | "missed" | "escalated"
  ): Promise<ReminderEvent> {
    const { data, error } = await this.supabase
      .from("reminder_events")
      .insert([
        {
          reminder_id: reminderId,
          fired_at: new Date().toISOString(),
          status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acknowledgeReminder(
    reminderId: string,
    method: "button" | "voice" | "text"
  ): Promise<ReminderEvent> {
    const { data, error } = await this.supabase
      .from("reminder_events")
      .update({
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        ack_method: method,
      })
      .eq("reminder_id", reminderId)
      .eq("status", "pending")
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPendingRemindersForParent(parentId: string): Promise<ReminderEvent[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString();

    const { data, error } = await this.supabase
      .from("reminder_events")
      .select(
        `
        *,
        reminder:reminders(*)
      `
      )
      .eq("reminder.parent_id", parentId)
      .eq("status", "pending")
      .lt("fired_at", thirtyMinutesAgo);

    if (error) throw error;
    return data || [];
  }

  async markReminderMissed(reminderId: string): Promise<ReminderEvent> {
    const { data, error } = await this.supabase
      .from("reminder_events")
      .update({ status: "missed" })
      .eq("reminder_id", reminderId)
      .eq("status", "pending")
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMissedCountForReminder(
    reminderId: string,
    hours: number = 24
  ): Promise<number> {
    const since = new Date(Date.now() - hours * 60000).toISOString();

    const { count, error } = await this.supabase
      .from("reminder_events")
      .select("*", { count: "exact", head: true })
      .eq("reminder_id", reminderId)
      .eq("status", "missed")
      .gt("fired_at", since);

    if (error) throw error;
    return count || 0;
  }

  async getReminder(reminderId: string): Promise<Reminder | null> {
    const { data, error } = await this.supabase
      .from("reminders")
      .select("*")
      .eq("id", reminderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }
}

export const createDatabaseService = (supabase: SupabaseClient): DatabaseService => {
  return new DatabaseService(supabase);
};
