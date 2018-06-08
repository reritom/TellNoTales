from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.message import Message
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.tracker import Tracker
from deadman.models.recipient import Recipient

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
    recipients_list = [recipient.contact.contact_id for recipient in recipients]

    message_representation = {'subject': message.subject,
                              'message': message_string,
                              'notify_within': str(message.sending_in()),
                              'recipients': recipients_list,
                              'cutoff_in': str(message.cutoff_in()),
                              'message_id': message.message_id,
                              'anonymous': message.anonymous,
                              'deletable': message.deletable,
                              'delivered': message.get_delivered(),
                              'locked': message.locked}

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
