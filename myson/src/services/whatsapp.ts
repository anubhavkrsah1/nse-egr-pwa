import axios, { AxiosInstance } from "axios";
import { WhatsAppSendPayload } from "../types.js";

export class WhatsAppClient {
  private client: AxiosInstance;
  private phoneNumberId: string;

  constructor(phoneNumberId: string, apiToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.client = axios.create({
      baseURL: `https://graph.instagram.com/v18.0/${phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async sendText(to: string, body: string): Promise<string> {
    const response = await this.client.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    });
    return response.data.messages[0].id;
  }

  async sendAudio(
    to: string,
    mediaId: string,
    caption?: string
  ): Promise<string> {
    const response = await this.client.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "audio",
      audio: { id: mediaId },
      ...(caption && { caption }),
    });
    return response.data.messages[0].id;
  }

  async sendInteractiveButtons(
    to: string,
    header: string,
    body: string,
    buttons: Array<{ type: string; reply: { id: string; title: string } }>
  ): Promise<string> {
    const response = await this.client.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        header: { type: "text", text: header },
        body: { text: body },
        action: { buttons: buttons.slice(0, 3) },
      },
    });
    return response.data.messages[0].id;
  }

  async uploadMedia(file: Buffer, type: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", new Blob([file]), "audio.opus");
    formData.append("type", type);
    formData.append("messaging_product", "whatsapp");

    const response = await axios.post(
      `https://graph.instagram.com/v18.0/${this.phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        },
      }
    );

    return response.data.id;
  }

  async getMedia(mediaId: string): Promise<Buffer> {
    const response = await this.client.get(`/${mediaId}`, {
      params: { fields: "url" },
    });

    const downloadResponse = await axios.get(response.data.url, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      },
    });

    return downloadResponse.data;
  }
}

export const createWhatsAppClient = (
  phoneNumberId: string,
  apiToken: string
): WhatsAppClient => {
  return new WhatsAppClient(phoneNumberId, apiToken);
};
