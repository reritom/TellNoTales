# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-04-14 17:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deadman', '0010_auto_20180411_2309'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='contact_id',
            field=models.CharField(default='a5a673ef-3b51-4238-9cf8-a7e361c17e92', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='message_id',
            field=models.CharField(default='9fab5ec3-2406-4f96-838a-7168cdcfe837', max_length=255, unique=True),
        ),
    ]