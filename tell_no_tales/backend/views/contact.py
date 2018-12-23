from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

from backend.models.contact import Contact
from backend.models.profile import Profile
from backend.models.email_address import EmailAddress
from backend.models.phone_number import PhoneNumber

from backend.tools.serialisers.contact_serialiser import ContactSerialiser
from backend.tools.validation.decorators import attach_profile, profile_validated
from backend.tools.response_tools import response_ok, response_ko

import json

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
@method_decorator(attach_profile, name='dispatch')
@method_decorator(profile_validated, name='post')
class ContactView(View):

    def post(self, request, profile):
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


    def get(self, request, profile):
        # Return all contacts for this profile
        contacts = Contact.objects.filter(profile=profile, revision=False).order_by('name')
        list_of_contacts = [ContactSerialiser.serialise(contact) for contact in contacts]

        return response_ok({'contacts':list_of_contacts})

