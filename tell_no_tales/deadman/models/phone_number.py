from django.db import models
from deadman.models.contact import Contact

class PhoneNumber(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    number = models.CharField(default=0, max_length=255)

    def __str__(self):
        return self.contact.name + ':' + self.number
