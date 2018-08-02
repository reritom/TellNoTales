# TODO: For handling any interaction with the media dir

import os, shutil, stat
from django.conf import settings
from deadman.app_settings import APP_NAME

def create_media_dir(message_id):
    if not APP_NAME in os.listdir(settings.MEDIA_ROOT):
        os.mkdir(os.path.join(settings.MEDIA_ROOT, APP_NAME))

    if not 'temp' in os.listdir(os.path.join(settings.MEDIA_ROOT, APP_NAME)):
        os.mkdir(os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp'))

    if not message_id in os.listdir(os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp')):
        os.mkdir(os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp', message_id))

    media_path = os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp', message_id)

    return media_path

def get_media_path(message_id):
    return os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp', message_id)

def delete_dir(message_id):
    '''
        This method checks if the message id dir is present and deletes it if it is.
    '''

    if APP_NAME in os.listdir(settings.MEDIA_ROOT):
        if 'temp' in os.listdir(os.path.join(settings.MEDIA_ROOT, APP_NAME)):
            if message_id in os.listdir(os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp')):
                message_dir = os.path.join(settings.MEDIA_ROOT, APP_NAME, 'temp', message_id)

                os.chmod(message_dir, stat.S_IWUSR)
                shutil.rmtree(message_dir)
