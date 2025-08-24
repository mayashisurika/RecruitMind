import os, smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

def send_otp_email(to_email: str, code: str):
    subject = "Your RecruitMind Login Code"
    html = f"""
    <p>Hello,</p>
    <p>Your one-time login code is:</p>
    <h2 style="letter-spacing:4px;">{code}</h2>
    <p>This code expires in 5 minutes. If you didn’t request it, ignore this email.</p>
    """
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.ehlo()
        s.starttls()
        s.ehlo()  # <-- Add this line for Gmail compatibility
        s.login(SMTP_USER, SMTP_PASS)
        s.send_message(msg)