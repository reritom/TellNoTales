from deadman.models.email_validator import EmailValidator

from deadman.helpers.sender.sender import GmailSender
from deadman.helpers.messages.template_handler import TemplateHandler

from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools.core_tools import load_config
from deadman import app_settings

def send_confirmation_email(validator_id):
    try:
        validator = EmailValidator.objects.get(validator_id=validator_id)
        email = validator.get_email()
        username = validator.profile.user.username

        print("Email {0}".format(email))

        print("Sending confirmation for {0} to {1} with id {2}".format(username, email, validator.get_id()))

        bom = {'username':username,
               'validation_url': app_settings.BASE_URL + "/confirm/email/" + validator_id}

        # We will load some gmail account details
        gmail_sender, gmail_password = load_config()
        with GmailSender(gmail_sender, gmail_password) as sender:
            # Format the message
            handler = TemplateHandler()
            rendered = handler.render_template("confirm_address.html", bom)

            print("Rendered message is {0}".format(rendered))
            sender.send(subject="Confirm your email address",
                        message=rendered,
                        destination=email,
                        origin='tellnotalesnotif@gmail.com')

    except:
        print("Failed to send email to {0}".format(email))