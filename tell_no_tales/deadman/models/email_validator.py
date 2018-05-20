from django.db import models
from deadman.models.profile import Profile
import uuid

class EmailValidator(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    validator_id = models.CharField(default=0, max_length=255)
    email = models.CharField(default=0, max_length=255)

    def __str__(self):
        return self.profile.user.username + '_' + "email_validator"

    @staticmethod
    def create_uuid():
        this_uuid = str(uuid.uuid4())
        if EmailValidator.objects.filter(validator_id=this_uuid).exists():
            return EmailValidator.create_uuid()
        else:
            print("Email validator UUID is {0}".format(this_uuid))
            return this_uuid

    def get_id(self):
        return self.validator_id

    def get_email(self):
        return self.email

    def set_email(self, email):
        self.email = email
        self.save()
