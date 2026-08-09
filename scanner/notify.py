"""Delivery channels for the scan report.

Every channel is configured purely through environment variables and is skipped
silently when its variables are absent, so you can run email only, WhatsApp
only, or both.

Email (SMTP)
  SMTP_HOST      e.g. smtp.gmail.com
  SMTP_PORT      465 for SSL (default), 587 for STARTTLS
  SMTP_USER      the mailbox login
  SMTP_PASS      an app password, never the account password
  EMAIL_TO       comma-separated recipients
  EMAIL_FROM     optional; defaults to SMTP_USER

WhatsApp via CallMeBot (free, one-off setup, personal use)
  CALLMEBOT_PHONE   your number in international format, e.g. +919876543210
  CALLMEBOT_APIKEY  the key CallMeBot sends you

WhatsApp via Twilio (paid, more reliable)
  TWILIO_ACCOUNT_SID
  TWILIO_AUTH_TOKEN
  TWILIO_WHATSAPP_FROM   e.g. whatsapp:+14155238886
  TWILIO_WHATSAPP_TO     e.g. whatsapp:+919876543210
"""

from __future__ import annotations

import logging
import mimetypes
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

import requests

log = logging.getLogger(__name__)

# WhatsApp providers reject very long bodies; keep well under the limit.
WHATSAPP_CHAR_LIMIT = 1500
HTTP_TIMEOUT = 30


def _env(name: str) -> str:
    return (os.environ.get(name) or "").strip()


def send_email(subject: str, html: str, text: str, attachment: Path | None = None) -> bool:
    """Send the report by SMTP. Returns True if it was sent, False if not configured."""
    host = _env("SMTP_HOST")
    user = _env("SMTP_USER")
    password = _env("SMTP_PASS")
    recipients = [a.strip() for a in _env("EMAIL_TO").split(",") if a.strip()]

    if not (host and user and password and recipients):
        log.info("Email not configured, skipping.")
        return False

    port = int(_env("SMTP_PORT") or 465)

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = _env("EMAIL_FROM") or user
    message["To"] = ", ".join(recipients)
    message.set_content(text)
    message.add_alternative(html, subtype="html")

    if attachment and attachment.exists():
        ctype, _ = mimetypes.guess_type(attachment.name)
        maintype, _, subtype = (ctype or "application/octet-stream").partition("/")
        message.add_attachment(
            attachment.read_bytes(),
            maintype=maintype,
            subtype=subtype,
            filename=attachment.name,
        )

    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=60) as smtp:
            smtp.login(user, password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(host, port, timeout=60) as smtp:
            smtp.starttls()
            smtp.login(user, password)
            smtp.send_message(message)

    log.info("Email sent to %s", ", ".join(recipients))
    return True


def _send_whatsapp_callmebot(text: str) -> bool:
    phone = _env("CALLMEBOT_PHONE")
    apikey = _env("CALLMEBOT_APIKEY")
    if not (phone and apikey):
        return False

    response = requests.get(
        "https://api.callmebot.com/whatsapp.php",
        params={"phone": phone, "text": text, "apikey": apikey},
        timeout=HTTP_TIMEOUT,
    )
    response.raise_for_status()
    log.info("WhatsApp sent via CallMeBot to %s", phone)
    return True


def _send_whatsapp_twilio(text: str) -> bool:
    sid = _env("TWILIO_ACCOUNT_SID")
    token = _env("TWILIO_AUTH_TOKEN")
    sender = _env("TWILIO_WHATSAPP_FROM")
    recipient = _env("TWILIO_WHATSAPP_TO")
    if not (sid and token and sender and recipient):
        return False

    response = requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
        auth=(sid, token),
        data={"From": sender, "To": recipient, "Body": text},
        timeout=HTTP_TIMEOUT,
    )
    response.raise_for_status()
    log.info("WhatsApp sent via Twilio to %s", recipient)
    return True


def send_whatsapp(text: str) -> bool:
    """Send the summary over WhatsApp using whichever provider is configured."""
    body = text
    if len(body) > WHATSAPP_CHAR_LIMIT:
        body = body[: WHATSAPP_CHAR_LIMIT - 20].rstrip() + "\n...(truncated)"

    for provider in (_send_whatsapp_callmebot, _send_whatsapp_twilio):
        if provider(body):
            return True

    log.info("WhatsApp not configured, skipping.")
    return False
