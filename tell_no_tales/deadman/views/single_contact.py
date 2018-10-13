from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.recipient import Recipient

from deadman.tools.serialisers.contact_serialiser import ContactSerialiser

from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools.validation.decorators import validate_contact_id
import json

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
@method_decorator(validate_contact_id, name='dispatch')
class SingleContactView(View):

    def post(self, request, contact_id):
        # Update and append new data to the contact
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]
        contact = Contact.objects.get(contact_id=contact_id, profile=profile, revision=False)

        print(request.POST)

        if 'new_addresses' in request.POST:
            new_addresses = json.loads(request.POST.get('new_addresses'))
            for new_address in new_addresses:
                EmailAddress.objects.get_or_create(email=new_address, contact=contact)

        if 'deleted_addresses' in request.POST:
            deleted_addresses = json.loads(request.POST.get('deleted_addresses'))
            for deleted_address in deleted_addresses:
                if EmailAddress.objects.filter(email=deleted_address, contact=contact).exists():
                    EmailAddress.objects.filter(email=deleted_address, contact=contact).delete()

        if 'new_numbers' in request.POST:
            new_numbers = json.loads(request.POST.get('new_numbers'))
            for new_number in new_numbers:
                PhoneNumber.objects.get_or_create(number=new_number, contact=contact)

        if 'deleted_numbers' in request.POST:
            deleted_numbers = json.loads(request.POST.get('deleted_numbers'))
            for deleted_number in deleted_numbers:
                if PhoneNumber.objects.filter(number=deleted_number, contact=contact).exists():
                    PhoneNumber.objects.filter(number=deleted_number, contact=contact).delete()

        if 'name' in request.POST:
            contact.rename(request.POST['name'])

        return response_ok({'contact':get_contact(contact)})

    def get(self, request, contact_id):
        # Return the contact
        contact = Contact.objects.get(contact_id=contact_id)
        return response_ok({'contact':get_contact(contact)})

    def delete(self, request, contact_id):
        contact = Contact.objects.get(contact_id=contact_id, revision=False)
        print("Contact is {0}".format(contact))
        # Delete contact (But remain accessable to preexisting messages)
        print(Recipient.objects.filter(contact=contact))
        print("Deleting contact {0}".format(contact.contact_id))
        if Recipient.objects.filter(contact=contact).exists():
            return response_ko("This contact is being used by an active message")

        Contact.objects.filter(contact_id=contact_id, revision=False).delete()
        return response_ok({'message':'Contact has been deleted'})

