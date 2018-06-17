from django.db import models
from deadman.models.profile import Profile
import uuid

class Contact(models.Model):
    '''
        A contact belongs to a profile, and is used as a recipient for a message
    '''
    # The user this contact belongs it
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    contact_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)
    revision = models.BooleanField(default=False)

    # Contact details
    name = models.CharField(default=0, max_length=255)

    @staticmethod
    def create_uuid():
        this_uuid = uuid.uuid4()
        if Contact.objects.filter(contact_id=this_uuid).exists():
            return Contact.create_uuid()
        else:
            return this_uuid

    def rename(self, name):
        self.name = name
        self.save()

    def __str__(self):
        return self.name
