from django.contrib import admin
from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.message import Message
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.tracker import Tracker
from deadman.models.recipient import Recipient
from deadman.models.front_end import FrontEnd
from deadman.models.file_item import FileItem
from deadman.models.email_validator import EmailValidator

# Register your models here.

admin.site.register(Contact)
admin.site.register(Profile)
admin.site.register(Message)
admin.site.register(EmailAddress)
admin.site.register(PhoneNumber)
admin.site.register(EmailValidator)
admin.site.register(Tracker)
admin.site.register(Recipient)
admin.site.register(FrontEnd)
admin.site.register(FileItem)
