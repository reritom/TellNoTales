from django.db import models
from django.contrib.auth.models import User
from deadman.models.profile import Profile
from django.utils import timezone
from datetime import timedelta
import json, uuid

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
    delivered = models.BooleanField(default=False)
    anonymous = models.BooleanField(default=False)

    # Properties for accessing the message
    viewable = models.BooleanField(default=True)
    deletable = models.BooleanField(default=True)
    locked = models.BooleanField(default=False)

    # Metadata
    number_of_notifies = models.IntegerField(default=0)

    def get_delivered(self):
        return self.delivered

    def set_anonymous(self, anon):
        self.anonymous = anon
        self.save()

    def is_edittable(self):
        return not self.locked and not self.expired

    def set_delivered(self):
        self.delivered = True
        self.expire()

    def set_message(self, message):
        self.message = message
        self.save()

    def set_subject(self, subject):
        self.subject = subject
        self.save()

    @staticmethod
    def create_uuid():
        this_uuid = str(uuid.uuid4())
        if Message.objects.filter(message_id=this_uuid).exists():
            return Message.create_uuid()
        else:
            print("Message UUID is {0}".format(this_uuid))
            return this_uuid

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

    def set_locked(self, lock):
        self.locked = lock
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

    def __str__(self):
        return self.subject
