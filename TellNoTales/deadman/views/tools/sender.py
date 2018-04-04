import smtplib
from email.message import EmailMessage

class GmailSender()
    def __init__(self):
        self.gmail_sender = 'sender@gmail.com'
        gmail_passwd = 'password'

        self.server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        self.server.login(gmail_sender, gmail_passwd)


    def send(self, subject, message, destination, origin):
        email_message = EmailMessage()
        email_message.set_content(message)
        email_message['Subject'] = subject
        email_message['From'] = origin
        email_message['To'] = destination

        self.server.send_message(email_message)

    def __enter__(self):
        print("Entering GmailSender")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting manager")
