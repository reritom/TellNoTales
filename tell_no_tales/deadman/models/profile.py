from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    '''
        A profile is directly related to a user
    '''
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    email_validated = models.BooleanField(default=False)

    # The first, surname, the email, and email validation status might be stored here

    def __str__(self):
        return self.user.username

    def set_email_validated(self):
        self.email_validated = True
        self.save()

    def is_validated(self):
        return self.email_validated

    def get_profile_as_json(self):
        return {'username': self.user.username,
                'email': self.user.email,
                'validated': self.email_validated}

        # TODO - check if there is a new email waiting to be validated
