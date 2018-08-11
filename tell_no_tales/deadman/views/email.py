from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from deadman.models.profile import Profile
from deadman.models.email_validator import EmailValidator

from deadman.tools.email_tools import send_confirmation_email
from deadman.tools.response_tools import response_ok, response_ko

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

