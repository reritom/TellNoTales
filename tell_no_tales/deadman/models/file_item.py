from django.db import models
from deadman.models.message import Message
import uuid

class FileItem(models.Model):

    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    file_type = models.CharField(default=0, max_length=255)
    file_path = models.CharField(default=0, max_length=255)

    file_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)

    def __str__(self):
        return self.message.message_id + "_" + self.name

    @staticmethod
    def create_uuid():
        file_id = str(uuid.uuid4())
        if FileItem.objects.filter(file_id=this_uuid).exists():
            return FileItem.create_uuid()
        else:
            print("File UUID is {0}".format(this_uuid))
            return this_uuid
