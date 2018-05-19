from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber

from deadman.tools.model_tools import get_contact
from deadman.tools.response_tools import response_ok, response_ko

@csrf_exempt
@login_required
def contact(request):
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        # Check if profile has been validated
        if not profile.is_validated():
            return response_ko("Profile email address not validated")

        # Create new contact using post data
        if not ('name' in request.POST and ('phone_number' in request.POST or 'email_address' in request.POST)):
            return response_ko("Missing parameter, contact requires 'name', and ('email_address' and/or 'phone_number')")

        contact = Contact.objects.create(profile=profile,
                                         name=request.POST['name'],
                                         contact_id=Contact.create_uuid())

        if request.POST.get("phone_number", False):
            if not isinstance(request.POST['phone_number'], str):
                return response_ko("Phone number needs to be a string")

            number = PhoneNumber.objects.create(number=request.POST['phone_number'], contact=contact)

        if request.POST.get("email_address", False):
            if not isinstance(request.POST['email_address'], str):
                return response_ko("Email address needs to be a string")

            email = EmailAddress.objects.create(email=request.POST['email_address'], contact=contact)

        return response_ok({'contact':get_contact(contact)})


    elif request.method == 'GET':
        # Return all contacts for this profile
        contacts = Contact.objects.filter(profile=profile)

        list_of_contacts = [get_contact(contact) for contact in contacts]

        return response_ok({'contacts':list_of_contacts})

    else:
        # Unsupported method
        return response_ko("Unsupported request method")
