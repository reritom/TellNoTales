from deadman.models.contact import Contact
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.recipient import Recipient

from deadman.tools import core_tools

def create_contact_revisions(message_object):
    for recipient in Recipient.objects.filter(message=message_object):
        # Create a new contact with the same values as the existing one
        revision_contact = Contact.objects.create(contact_id=Contact.create_uuid(),
                                                   name=recipient.contact.name,
                                                   profile=recipient.contact.profile,
                                                   revision=True)

        print("New contact id for this revision is {0}".format(revision_contact.contact_id))

        for email_address in EmailAddress.objects.filter(contact=recipient.contact):
            print("Email address {0}".format(email_address.email))
            EmailAddress.objects.create(contact=revision_contact,
                                        email=email_address.email)

        for phone_number in PhoneNumber.objects.filter(contact=recipient.contact):
            print("Phone number {0}".format(phone_number.number))
            PhoneNumber.objects.create(contact=revision_contact,
                                       number=phone_number.number)

        recipient.contact = revision_contact
        recipient.save()
