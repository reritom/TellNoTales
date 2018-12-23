from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from backend.models.profile import Profile
from backend.models.email_validator import EmailValidator

from backend.tools.email_tools import send_confirmation_email
from backend.tools.response_tools import response_ok, response_ko
from backend.tools.serialisers.profile_serialiser import ProfileSerialiser

@csrf_exempt
@login_required
def profile(request):
    # This returns the profile details (message count, contact count, delivered messages, pending messages, and email validation setting with a resend link)
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'GET':
        return response_ok(ProfileSerialiser.serialise(profile))

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
        return response_ok(ProfileSerialiser.serialise(profile))
    else:
        return response_ko("Unsupported request method")