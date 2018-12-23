from django.db import models
from backend.models.message import Message
import uuid

class FileItem(models.Model):

    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    file_type = models.CharField(default=0, max_length=255)
    file_name = models.CharField(default=0, max_length=255)
    file_id = models.CharField(default=str(uuid.uuid4()), max_length=255, unique=True)

    def __str__(self):
        return self.message.message_id + "_" + self.file_name + "_" + self.file_id

    @staticmethod
    def create_uuid():
        file_id = str(uuid.uuid4())
        if FileItem.objects.filter(file_id=file_id).exists():
            return FileItem.create_uuid()
        else:
            print("File UUID is {0}".format(file_id))
            return file_id

    def get_id(self):
        return self.file_id
