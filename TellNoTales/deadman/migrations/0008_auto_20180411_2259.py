# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-04-11 20:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deadman', '0007_auto_20180411_2243'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='contact_id',
            field=models.CharField(default='1d72d7e1-dffa-43cf-b248-49cec17f887f', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='message_id',
            field=models.CharField(default='2c6561f7-cb8f-46fb-b41f-01ed47aec55f', max_length=255, unique=True),
        ),
    ]
