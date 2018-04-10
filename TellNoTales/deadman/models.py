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

    # Message details
    message_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)
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

    def get_time_until_sending(self):
        return (self.last_notified + timedelta(days=int(self.lifespan))) - timezone.now()

    def get_time_since_last_reminder(self):
        return timezone.now() - self.last_reminder

    def get_id(self):
        return self.message_id

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

    def cutoff_in(self):
        return (self.created + timedelta(days=int(self.cutoff))) - timezone.now()

    def sending_in(self):
        return (self.last_notified + timedelta(days=int(self.lifespan))) - timezone.now()


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

    # Contact details
    name = models.CharField(default=0, max_length=255)

    def rename(self, name):
        self.name = name
        self.save()

class Recipient(models.Model):
    '''
        A model represents the link between between a message and a contact
    '''
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)

class PhoneNumber(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    number = models.CharField(default=0, max_length=255)

class EmailAddress(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    email = models.CharField(default=0, max_length=255)
