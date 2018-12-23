from backend.models.message import Message
from backend.models.contact import Contact
from django.db import models

class Recipient(models.Model):
    '''
        A model represents the link between between a message and a contact
    '''
    recipient_id = models.CharField(default=0, max_length=255)

    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)

    def __str__(self):
        return self.message.subject + ":" + self.contact.name
