from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

import json, uuid


'''
    A message belongs to user, and can be linked to multiple contacts
'''

class Profile(models.Model):
    '''
        A profile is directly related to a user
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Message(models.Model):
    '''
        A message contains the message string, the lifespan of a message, and the last time it was notified.
    '''
    # The user is belongs it
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    default_recipients = json.dumps({'contacts':[]})

    # Message details
    message_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)
    recipients = models.CharField(default=default_recipients, max_length=10000)
    subject = models.CharField(default=0, max_length=255)
    message = models.CharField(default=0, max_length=10000)
    last_notified = models.DateTimeField(default=timezone.now, null=True)
    last_reminder = models.DateTimeField(default=timezone.now, null=True)
    created = models.DateTimeField(default=timezone.now, null=True)
    lifespan = models.IntegerField(default=0)
    cutoff = models.IntegerField(default=0)
    expired = models.BooleanField(default=False)

    # Properties for accessing the message
    viewable = models.BooleanField(default=True)
    deletable = models.BooleanField(default=True)
    locked = models.BooleanField(default=False)

    # Metadata
    number_of_notifies = models.IntegerField(default=0)

    def get_id(self):
        return self.message_id

    def add_recipient(self, contact_id):
        current_recipients = json.loads(self.recipients)

        if contact_id in current_recipients['contacts']:
            return

        current_recipients['contacts'].append(contact_id)
        new_recipients = json.dumps(current_recipients)
        self.recipients = new_recipients
        self.save()

    def remove_recipient(self, contact_id):
        current_recipients = json.loads(self.recipients)

        if contact_id not in current_recipients['contacts']:
            return

        current_recipients['contacts'].remove(contact_id)
        new_recipients = json.dumps(current_recipients)
        self.recipients = new_recipients
        self.save()

    def notify(self):
        self.last_notified = timezone.now()
        self.number_of_notifies = self.number_of_notifies + 1
        self.save()

    def set_viewable(self, viewable):
        self.viewable = viewable
        self.save()

    def set_deletable(self, deletable):
        self.deletable = deletable
        self.save()

    def is_locked(self):
        return self.locked

    def expire(self):
        self.expired = True
        self.save()

    def as_json(self):
        recipients = json.loads(self.recipients)
        recipients_list = recipients['contacts']

        cutoff_in = (self.created + timedelta(days=int(self.cutoff))) - timezone.now()
        remaining = (self.last_notified + timedelta(days=int(self.lifespan))) - timezone.now()

        if not self.viewable:
            message = "This message can't be viewed"
        else:
            message = self.message

        json_self = {'subject': self.subject,
                     'message': message,
                     'notify_within': str(remaining),
                     'recipients': recipients,
                     'cutoff_in': str(cutoff_in),
                     'message_id': self.message_id}

        return json_self

class Tracker(models.Model):
    '''
        Once a message has been distributed, this model keeps track of their verification statuses
    '''
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    type = models.CharField(default=0, max_length=255)
    status = models.CharField(default=0, max_length=255)
    verified = models.BooleanField(default=False)

    def set_status_ok(self):
        self.status = "OK"
        self.save()

    def set_status_ko(self):
        self.status = "KO"
        self.save()

    def set_verified(self):
        self.verified = True
        self.save()

    def set_type_email(self):
        self.type = "Email"
        self.save()

    def set_type_text(self):
        self.type = "Text"
        self.save()

class Contact(models.Model):
    '''
        A contact belongs to a profile, and is used as a recipient for a message
    '''
    # The user this contact belongs it
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    contact_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)

    default_email_addresses = json.dumps({'email_addresses':[]})

    # Contact details
    name = models.CharField(default=0, max_length=255)
    email_addresses = models.TextField(default=default_email_addresses, max_length=255)
    phone_number = models.IntegerField(default=0)

    def add_email_address(self, email_address):
        current_email_addresses = json.loads(self.email_addresses)

        if email_address in current_email_addresses['email_addresses']:
            return

        current_email_addresses['email_addresses'].append(email_address)
        new_email_addresses = json.dumps(current_email_addresses)
        self.email_addresses = new_email_addresses
        self.save()

    def remove_email_address(self, email_address):
        current_email_addresses = json.loads(self.email_addresses)

        if email_address not in current_email_addresses['email_addresses']:
            return

        current_email_addresses['email_addresses'].remove(email_address)
        new_email_addresses = json.dumps(current_email_addresses)
        self.email_addresses = new_email_addresses
        self.save()

    def rename(self, name):
        self.name = name
        self.save()

    def update_number(self, number):
        self.phone_number = number
        self.save()

    def get_contact_as_json(self):
        addresses = json.loads(self.email_addresses)
        address_list = [address for address in addresses['email_addresses']]

        return {'name': self.name,
                'email_addresses': address_list,
                'phone_number': self.phone_number,
                'contact_id': self.contact_id}

class PhoneNumber(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    number = models.CharField(default=0, max_length=255)

class EmailAddress(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    email = models.CharField(default=0, max_length=255)
