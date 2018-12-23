from backend.tools import core_tools

from backend.models.tracker import Tracker
from backend.models.recipient import Recipient
from backend.models.file_item import FileItem

class MessageSerialiser():
    @staticmethod
    def serialise(message):
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