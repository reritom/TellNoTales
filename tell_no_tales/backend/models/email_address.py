from django.db import models
from backend.models.contact import Contact

class EmailAddress(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    email = models.CharField(default=0, max_length=255)

    def __str__(self):
        return self.contact.name + ':' + self.email
