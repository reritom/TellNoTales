from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber

from deadman.tools.serialisers.contact_serialiser import ContactSerialiser

from deadman.tools.response_tools import response_ok, response_ko

import json

@csrf_exempt
@login_required
def contact(request):
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        # Check if profile has been validated
        if not profile.is_validated():
            return response_ko("Profile email address not validated")

        print(request.POST.keys())

        # Create new contact using post data
        if not ('name' in request.POST and ('numbers' in request.POST or 'addresses' in request.POST)):
            return response_ko("Missing parameter, contact requires 'name', and ('addresses' and/or 'numbers')")

        contact = Contact.objects.create(profile=profile,
                                         name=request.POST['name'],
                                         contact_id=Contact.create_uuid())

        if 'addresses' in request.POST:
            new_addresses = json.loads(request.POST.get('addresses'))
            for new_address in new_addresses:
                EmailAddress.objects.get_or_create(email=new_address, contact=contact)

        if 'numbers' in request.POST:
            new_numbers = json.loads(request.POST.get('numbers'))
            for new_number in new_numbers:
                PhoneNumber.objects.get_or_create(number=new_number, contact=contact)

        return response_ok({'contact':ContactSerialiser.serialise(contact)})


    elif request.method == 'GET':
        # Return all contacts for this profile
        contacts = Contact.objects.filter(profile=profile, revision=False)

        list_of_contacts = [ContactSerialiser.serialise(contact) for contact in contacts]

        return response_ok({'contacts':list_of_contacts})

    else:
        # Unsupported method
        return response_ko("Unsupported request method")
