from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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
    recipients = models.CharField(default=default_recipients, max_length=10000)
    subject = models.CharField(default=0, max_length=255)
    message = models.CharField(default=0, max_length=10000)
    last_notified = models.DateTimeField(default=timezone.now, null=True)
    created = models.DateTimeField(default=timezone.now, null=True)
    lifespan = models.IntegerField(default=0)
    expiration = models.IntegerField(default=0)
    expired = models.BooleanField(default=False)

    # Properties for accessing the message
    viewable = models.BooleanField(default=False)
    deletable = models.BooleanField(default=False)

    # Metadata
    number_of_notifies = models.IntegerField(default=0)

    def add_recipient(self, contact_id):
        current_recipients = json.loads(self.recipients)
        current_recipients['contacts'].append(contact_id)
        new_recipients = json.dumps(current_recipients)
        self.recipients = new_recipients
        self.save()

    def notify(self):
        last_notified = models.DateTimeField(default=timezone.now, null=True)
        self.save()       


class Contact(models.Model):
    '''
        A contact belongs to a profile, and is used as a recipient for a message
    '''
    # The user this contact belongs it
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    contact_id = str(uuid.uuid4())

    default_email_addresses = json.dumps({'email_addresses':[]})

    # Contact details
    name = models.CharField(default=0, max_length=255)
    email_addresses = models.CharField(default=default_email_addresses, max_length=255)
    phone_number = models.IntegerField(default=0)

    def add_email_address(self, email_address):
        current_email_addresses = json.loads(self.email_addresses)
        current_email_addresses['email_addresses'].append(email_address)
        new_email_addresses = json.dumps(current_email_addresses)
        self.email_addresses = new_email_addresses
        self.save()

    def remove_email_address(self, email_address):
        current_email_addresses = json.loads(self.email_addresses)
        current_email_addresses['email_addresses'].remove(email_address)
        new_email_addresses = json.dumps(current_email_addresses)
        self.email_addresses = new_email_addresses
        self.save()
