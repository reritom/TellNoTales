# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-04-01 22:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deadman', '0007_auto_20180402_0011'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='contact_id',
            field=models.CharField(default='6c28945a-6309-4e0d-b9d6-78b31111c572', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='message_id',
            field=models.CharField(default='c6bab2be-6d2c-4720-8885-e3ffdc65c368', max_length=255, unique=True),
        ),
    ]