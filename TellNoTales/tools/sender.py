import smtplib
from email.message import EmailMessage

class GmailSender():
    def __init__(self, gmail_sender, gmail_password):
        gmail_sender = gmail_sender
        gmail_password = gmail_password

        self.server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        self.server.login(gmail_sender, gmail_password)

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
                    message='This is a message',
                    destination='reikudjinn@gmail.com',
                    origin='tellnotalesnotif@gmail.com')
