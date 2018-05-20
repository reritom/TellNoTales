import smtplib
from email.message import EmailMessage
from email.mime.text import MIMEText

class GmailSender():
    def __init__(self, gmail_sender, gmail_password):
        self.server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        self.server.login(gmail_sender, gmail_password)

    def send(self, subject, message, destination, origin):
        print("Sending message from {0} to {1}".format(origin, destination))
        email_message = MIMEText(message, 'html')
        email_message['Subject'] = subject
        email_message['From'] = origin
        email_message['To'] = destination

        self.server.send_message(email_message)

    def __enter__(self):
        print("Entering GmailSender")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting GmailSender")


if __name__=='__main__':
    import os, json
    try:
        # Load a the email and password from a file outside of the repo
        path_to_config = os.path.join('..', '..', '..', 'non_git_settings.json')
        config = json.load(open(path_to_config))

        gmail_sender = config['gmail_sender']
        gmail_password = config['gmail_password']
    except Exception as e:
        print("Error: {0}".format(str(e)))
        print("The sender __main__ expects to find a json config file "
              "one level above the git repo ")

    with GmailSender(gmail_sender, gmail_password) as sender:
        sender.send(subject='Test again',
                    message='<html><body><h1>This is a message</h1><h4>This is a subheading</h4></body</html>',
                    destination='reikudjinn@gmail.com',
                    origin='tellnotalesnotif@gmail.com')
