# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-04-21 19:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deadman', '0011_auto_20180414_1939'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='contact_id',
            field=models.CharField(default='33718d33-e090-4bcf-9fdd-cdf636f275d6', max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='message',
            name='message_id',
            field=models.CharField(default='c5c5088f-3753-4d9a-8cb1-2d46ddfa32e0', max_length=255, unique=True),
        ),
    ]