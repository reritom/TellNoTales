from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    '''
        A profile is directly related to a user
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # The first, surname, the email, and email validation status might be stored here

    def __str__(self):
        return self.user.username
