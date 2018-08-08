from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from deadman.models.profile import Profile
from deadman.models.email_validator import EmailValidator

from deadman.helpers.sender.sender import GmailSender
from deadman.helpers.messages.template_handler import TemplateHandler

from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools.model_tools import get_profile_bom
from deadman.tools.core_tools import load_config
from deadman import app_settings

@csrf_exempt
@login_required
def get_profile(request):
    # This returns the profile details (message count, contact count, delivered messages, pending messages, and email validation setting with a resend link)
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'GET':
        bom = get_profile_bom(profile)

        return response_ok(bom)

    elif request.method == 'POST':
        #Post new name, new email, new password (+ old)
        if 'new_address' in request.POST:
            if not len(request.POST['new_address']) > 5:
                return response_ko("Invalid address")

            if EmailValidator.objects.filter(profile=profile).exists():
                EmailValidator.objects.filter(profile=profile).delete()

            new_id = EmailValidator.create_uuid()
            new_validator = EmailValidator.objects.get_or_create(validator_id=new_id,
                                                                 email=request.POST['new_address'],
                                                                 profile=profile)[0]

            print("Creating new validator with email {0} and uuid {1}".format(request.POST['new_address'], new_id))

            send_confirmation_email(new_id)
            return response_ok({'message': "Confirmation email sent"})
        return response_ok({})
    else:
        return response_ko("Unsupported request method")


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

@login_required
def resend_confirmation_email(request):
    print("In resend")
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if EmailValidator.objects.filter(profile=profile).exists():
        print("Validator exists")
        email_validator = EmailValidator.objects.get(profile=profile)
        validator_id = email_validator.get_id()
        print("Validator email is {0}".format(email_validator.get_email()))
        send_confirmation_email(validator_id)
        return response_ok({'message':"Confirmation email has been sent"})

    else:
        email_validator = EmailValidator.objects.get_or_create(profile=profile, validator_id=EmailValidator.create_uuid(), email=profile.user.email)[0]
        validator_id = email_validator.get_id()
        send_confirmation_email(validator_id)
        return response_ok({'message':"Confirmation email has been sent"})

    return response_ko("")

def email_confirmed(request, validator_id):
    if EmailValidator.objects.filter(validator_id=validator_id).exists():
        validator = EmailValidator.objects.get(validator_id=validator_id)
        validator.profile.set_email_validated()
        validator.profile.user.email = validator.get_email()
        validator.profile.user.save()

        EmailValidator.objects.filter(validator_id=validator_id).delete()

        # TODO depending on the FE, we either redirect, or render our own confirmation page
        # TODO set a timeout and the option to resend the email
        return response_ok({})

    else:
        #TODO - this will happen if they have changed their email, so the original validator is deleted
        # So maybe have another template for this case
        pass

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
        email_validator = EmailValidator.objects.get_or_create(profile=profile, validator_id=EmailValidator.create_uuid(), email=email)[0]
        validator_id = email_validator.get_id()

        login(request, user)

        send_confirmation_email(validator_id)

        return response_ok({'message':'User account successfully created'})

    else:
        return response_ko("Unsupported request method")

@csrf_exempt
def login_user(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return response_ok({'logged_in': True})
        else:
            return response_ok({'logged_in': False})

    elif request.method == 'POST':
        if request.user.is_authenticated:
            return response_ko("User already logged in")

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
