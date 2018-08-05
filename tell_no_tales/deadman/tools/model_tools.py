from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.message import Message
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.tracker import Tracker
from deadman.models.recipient import Recipient
from deadman.models.file_item import FileItem

from deadman.tools import core_tools

def get_profile_bom(profile_obj):
    '''
        This method constructs a profile bom
    '''

    profile_bom = profile_obj.get_profile_as_json()

    messages_delivered = Message.objects.filter(profile=profile_obj, delivered=True).count()
    profile_bom['messages_delivered'] = messages_delivered

    messages_undelivered = Message.objects.filter(profile=profile_obj, delivered=False).count()
    profile_bom['messages_undelivered'] = messages_undelivered

    return profile_bom

def get_contact(contact):
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

def get_message(message):
    '''
        This function creates a json object representing a message.
        It grabs the message, and any related recipients
    '''
    if not message.viewable:
        message_string = "This message can't be viewed"
    else:
        message_string = message.message

    recipients = Recipient.objects.filter(message=message)
    recipients_list = [{'id': recipient.contact.contact_id, 'name': recipient.contact.name} for recipient in recipients]

    message_representation = {'subject': message.subject,
                              'message': message_string,
                              'recipients': recipients_list,
                              'notify': {'within': {'full': str(message.sending_in()),
                                                    'days': core_tools.timedelta_to_days_hours_minutes(message.sending_in())[0],
                                                    'hours': core_tools.timedelta_to_days_hours_minutes(message.sending_in())[1],
                                                    'minutes': core_tools.timedelta_to_days_hours_minutes(message.sending_in())[2]},
                                         'before': str(message.sending_at())},
                              'cutoff': {'in': {'full': str(message.cutoff_in()),
                                                'days': core_tools.timedelta_to_days_hours_minutes(message.cutoff_in())[0],
                                                'hours': core_tools.timedelta_to_days_hours_minutes(message.cutoff_in())[1],
                                                'minutes': core_tools.timedelta_to_days_hours_minutes(message.cutoff_in())[2]},
                                         'at': str(message.cutoff_at())},
                              'message_id': message.message_id,
                              'anonymous': message.anonymous,
                              'deletable': message.deletable,
                              'delivered': message.get_delivered(),
                              'locked': message.locked,
                              'expired': message.expired,
                              'viewable': message.viewable,
                              'attachments': []}

    for file_item in FileItem.objects.filter(message=message):
        message_representation['attachments'].append(file_item.file_name)

    if message.get_delivered():
        message_representation['delivery_status'] = {}

        recipients = Recipient.objects.filter(message=message)
        for recipient in recipients:
            message_representation['delivery_status'][recipient.contact.name] = []
            trackers = Tracker.objects.filter(recipient=recipient)
            for tracker in trackers:
                message_representation['delivery_status'][recipient.contact.name].append({'identifier':tracker.identifier,
                                                                                          'delivery_status': tracker.status,
                                                                                          'delivery_verified': tracker.verified})



    return message_representation


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
