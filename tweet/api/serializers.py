from rest_framework import serializers
from tweet.models import Tweet
from accounts.api.serializers import UserDisplaySrializser

class TweetModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser()
    class Meta():
        model = Tweet
        fields = [
            'user',
            'content'
        ]
