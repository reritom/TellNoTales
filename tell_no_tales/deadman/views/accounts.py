from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from deadman.models.profile import Profile
from deadman.models.email_validator import EmailValidator

from deadman.helpers.sender.sender import GmailSender
from deadman.helpers.messages.template_handler import TemplateHandler

from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools.core_tools import load_config
from deadman import app_settings

def email_confirmed(request, validator_id):
    if EmailValidator.objects.filter(validator_id=validator_id).exists():
        validator = EmailValidator.objects.get(validator_id=validator_id)
        validator.profile.set_email_validated()

        EmailValidator.objects.filter(validator_id=validator_id).delete()

        # TODO depending on the FE, we either redirect, or render our own confirmation page
        # TODO set a timeout and the option to resend the email
        return response_ok({})

    return response_ko("Invalid validator id")

@csrf_exempt
def signup(request):
    if request.user.is_authenticated:
        return response_ko("Already logged in")

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']

        # TODO, add field to profile or user "validated", send email with confirmation link

        if User.objects.filter(username=username).exists():
            return response_ko("This username already exists")

        user = User.objects.create_user(username=username, email=email, password=password)

        profile = Profile.objects.get_or_create(user=user)[0]

        gmail_sender, gmail_password = load_config()
        # Create EmailValidator
        email_validator = EmailValidator.objects.get_or_create(profile=profile, validator_id=EmailValidator.create_uuid())[0]
        # Create UUID
        # Send email
        bom = {'username':username,
               'validation_url': app_settings.BASE_URL + "/confirm/email/" + email_validator.get_id()}
        # TODO send the confirmation email

        with GmailSender(gmail_sender, gmail_password) as sender:
            # Format the message
            handler = TemplateHandler()
            rendered = handler.render_template("confirm_address.html", bom)

            print("Rendered message is {0}".format(rendered))

            try:
                sender.send(subject="Confirm your email address",
                            message=rendered,
                            destination=email,
                            origin='tellnotalesnotif@gmail.com')

            except:
                print("Failed to send email to {0}".format(email))


        return response_ok({'message':'User account successfully created'})

    else:
        return response_ko("Unsupported request method")

@csrf_exempt
def login_user(request):
    if request.user.is_authenticated:
        return response_ok({"message": "Already logged in"})

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        if not User.objects.filter(username=username).exists():
            return response_ko("Username doesn't exist")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return response_ok({'message':'User successfully logged in'})
        else:
            return response_ko("Unsuccessful login")

    else:
        return response_ko("Unsupported request method")

def logout_user(request):
     logout(request)
     return response_ok({'message':'User successfully logged out'})
