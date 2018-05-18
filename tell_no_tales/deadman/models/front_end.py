'''
    As this is an api, there can be multiple front end implementations.
    So a front end is a model which is used for setting up specific cases where users need to interact directly with the api
    such as for tracker validation, email validation, etc.

    So once a front end is created, it needs to be populated with a template for each of these cases
    Then when a user is created from a front end, the profile belongs to that front end and will render the correct template

    If a user belongs to no front end, we render a basic template for each case
'''

from django.db import models
from deadman.models.profile import Profile
import uuid

class FrontEnd(models.Model):
    # Name of the frontend
    name = models.CharField(default=0, max_length=255, unique=True)

    # The frontend needs to be created by an existing user with frontend permissions
    # The profile can't be deleted while the frontend exists, this is for safety
    profile = models.ForeignKey(Profile, on_delete=models.PROTECT)

    frontend_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)

    # TODO - The front end needs to specify redirect URLs for both the signup_confirmed and tracker_verified cases, if they aren't set, the APIs default ones are used

    def __str__(self):
        return self.name

    @staticmethod
    def create_uuid():
        this_uuid = str(uuid.uuid4())
        if FrontEnd.objects.filter(frontend_id=this_uuid).exists():
            return FrontEnd.create_uuid()
        else:
            print("Frontend UUID is {0}".format(this_uuid))
            return this_uuid

    def get_details(self):
        return {'name': name,
                'owner': profile.user.username,
                'id': frontend_id}
