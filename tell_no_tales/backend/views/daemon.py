from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from django.utils import timezone

from backend.models.contact import Contact
from backend.models.profile import Profile
from backend.models.message import Message
from backend.models.email_address import EmailAddress
from backend.models.phone_number import PhoneNumber
from backend.models.tracker import Tracker
from backend.models.recipient import Recipient

from backend.tools.core_tools import load_config
from backend.helpers.sender.sender import GmailSender
from backend.helpers.messages.template_handler import TemplateHandler

import json, uuid, os

global gmail_sender
global gmail_password

def daemon(request):
    expire_by_cutoff()
    send_reminders()
    send_messages()

    return JsonResponse({'status':"OK"})

def send_validation_emails():
    # # TODO: Emails for address validation will be sent from here instead of from the signup process
    pass


def expire_by_cutoff():
    # Filter non-expired messages
    messages = Message.objects.filter(expired=False)
    print("All messages are {0}".format(Message.objects.all()))
    print("Messages to expire are {0}".format(messages))
    # Filter messages over their cutoff and expire them
    for message in messages:
        print("In expiration loop")
        cutoff = message.created + timedelta(days=int(message.cutoff))
        if timezone.now() > cutoff:
            print("Expiring a message")
            message.expire()

def send_reminders():
    # Filter non-expired messages

    gmail_sender, gmail_password = load_config()
    print("In Send Reminders")
    for profile in Profile.objects.all():
        print("Profile is {0}".format(profile.user.username))
        messages = Message.objects.filter(expired=False, profile=profile)
        print("Messages are {0}".format(messages))

        with GmailSender(gmail_sender, gmail_password) as sender:
            flag = False
            bom = {'username': profile.user.username,
                   'messages': [],
                   'base_notify_url': '127.0.0.1:8000/notify'}

            # Get messages
            for message in messages:
                message_id = message.get_id()
                notify_url = '127.0.0.1:8000/notify/' + message_id

                bom['messages'].append({'time_until_sending': message.get_time_until_sending(),
                                        'notify_url': notify_url,
                                        'subject': message.subject})

                print("Time since last reminder {0}".format(message.get_time_since_last_reminder()))

                if message.get_time_since_last_reminder() > timedelta(days=5) or (message.get_time_until_sending() < timedelta(days=2) and message.get_time_since_last_reminder() > timedelta(days=1)):
                    flag = True

            print("Bom is {0}".format(bom))
            print("Flag is {0}".format(flag))
            if flag:
                # At least one message hasn't been notified in the last 5 days

                handler = TemplateHandler()
                rendered = handler.render_template("reminder.html", bom)

                print("Rendered message is {0}".format(rendered))

                sender.send(subject='Reminder: Notify you messages',
                            message=rendered,
                            destination=profile.user.email,
                            origin='tellnotalesnotif@gmail.com')

                # Update message last reminder
                for message in messages:
                    message.last_reminder = timezone.now()
                    message.save()


def send_messages():
    print("In send_messages")
    gmail_sender, gmail_password = load_config()
    # Filter unexpired messages
    messages = Message.objects.filter(expired=False)

    # Filter unnotified messaged passed their lifespan
    for message in messages:
        time_since_last_notify = timezone.now() - message.last_notified

        if time_since_last_notify > timedelta(days=int(message.lifespan)):
            print("Message {0} has passed its lifespan".format(message.get_id()))
            # The message needs to be sent

            # Get the recipients
            recipients = Recipient.objects.filter(message=message)
            print("It has {0} recipients".format(len(recipients)))

            # For each contact
            for recipient in recipients:
                email_addresses = EmailAddress.objects.filter(contact=recipient.contact)
                print("This recipient has {0} email addresses".format(len(email_addresses)))

                with GmailSender(gmail_sender, gmail_password) as sender:
                    # For each email address
                    for email_address in email_addresses:
                        # Create a tracker
                        tracker = Tracker.objects.create(recipient=recipient, tracker_id=Tracker.create_tracker_uuid())
                        tracker.set_type_email()
                        tracker.set_identifier(email_address.email)

                        bom = {'subject': message.subject,
                               'message': message.message,
                               'tracker_url': '127.0.0.1:8000/verify/' + str(tracker.get_id())}

                        # Format the message
                        handler = TemplateHandler()
                        rendered = handler.render_template("message.html", bom)

                        print("Rendered message is {0}".format(rendered))

                        try:
                            sender.send(subject=message.subject,
                                        message=rendered,
                                        destination=email_address.email,
                                        origin='tellnotalesnotif@gmail.com')

                            tracker.set_status_ok()
                        except:
                            tracker.set_status_ko()

                phone_numbers = PhoneNumber.objects.filter(contact=recipient.contact)
                # If there are phone numbers
                    # Encrypt the message
                    # For each phone number
                        # Create tracker
                        # Publish encrypted message with verify/tracker url

            # Expire the message
            message.set_delivered()
