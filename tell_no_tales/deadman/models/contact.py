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

    # Contact details
    name = models.CharField(default=0, max_length=255)

    def rename(self, name):
        self.name = name
        self.save()

    def __str__(self):
        return self.name
