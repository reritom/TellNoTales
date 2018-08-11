from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.recipient import Recipient

class ContactSerialiser():
    @staticmethod
    def serialise(contact):
        '''
            This function creates a json object representing a contact.
            It collects and formats the email addresses and phone numbers related to a given contact object
        '''

        contact_representation = {'name': contact.name,
                                  'email_addresses': None,
                                  'phone_numbers': None,
                                  'contact_id': contact.contact_id}

        email_addresses = EmailAddress.objects.filter(contact=contact)
        contact_representation['email_addresses'] = [email.email for email in email_addresses]

        phone_numbers = PhoneNumber.objects.filter(contact=contact)
        contact_representation['phone_numbers'] = [number.number for number in phone_numbers]

        # Only deletable if not being used by an unlocked message
        contact_representation['deletable'] = not Recipient.objects.filter(contact=contact).exists()

        return contact_representation