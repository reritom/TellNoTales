from django.db import models
from backend.models.recipient import Recipient
import uuid

class Tracker(models.Model):
    '''
        Once a message has been distributed, this model keeps track of their verification statuses
    '''
    tracker_id = models.CharField(default=0, max_length=255)

    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE)
    type = models.CharField(default=0, max_length=255)
    identifier = models.CharField(default=0, max_length=255)
    status = models.CharField(default=0, max_length=255)
    verified = models.BooleanField(default=False)

    def get_id(self):
        return self.tracker_id

    @staticmethod
    def create_tracker_uuid():
        this_uuid = uuid.uuid4()
        if Tracker.objects.filter(tracker_id=this_uuid).exists():
            return Tracker.create_tracker_uuid()
        else:
            return this_uuid

    def set_identifier(self, identifier):
        self.identifier = identifier
        self.save()

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
