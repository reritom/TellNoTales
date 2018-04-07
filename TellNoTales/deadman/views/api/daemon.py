from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from deadman.models import Contact, Message, Profile, Tracker
from django.utils import timezone
from datetime import timedelta

from deadman.views.constructors import ResponseObject
from tools.sender import GmailSender
from deadman.helpers.messages.template_handler import TemplateHandler

import json, uuid, os

global gmail_sender
global gmail_password

def daemon(request):
    load_config()
    expire_by_cutoff()
    send_reminders()
    send_messages()

    return JsonResponse({'status':"OK"})


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
            #message.expire()

def send_reminders():
    # Filter non-expired messages
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
                time_since_last_reminder = timezone.now() - message.last_reminder
                time_until_sending = (message.last_notified + timedelta(days=int(message.lifespan))) - timezone.now()
                message_id = message.get_id()
                notify_url = '127.0.0.1:8000/notify/' + message_id

                bom['messages'].append({'time_until_sending': time_until_sending,
                                        'notify_url': notify_url,
                                        'subject': message.subject})

                print("Time since last reminder {0}".format(time_since_last_reminder))
                if time_since_last_reminder > timedelta(days=5): # Or (time until sending < 1 day and )
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
                '''
                for message in messages:
                    message.last_reminder = timezone.now()
                    message.save()
                '''

    pass

def send_messages():
    # Filter unnotified messaged passed their lifespan

    # Instanciate the email sender

    # For each message

        # Retrieve the contacts

        # Format the message and send it

        # Expire the message
    pass

def load_config():
    # Load a the email and password from a file outside of the repo
    print(os.listdir(os.path.join('..', '..')))
    path_to_config = os.path.join('..', '..', 'non_git_settings.json')
    config = json.load(open(path_to_config))

    global gmail_sender
    gmail_sender = config['gmail_sender']

    global gmail_password
    gmail_password = config['gmail_password']
