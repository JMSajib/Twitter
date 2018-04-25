from rest_framework import serializers
from tweet.models import Tweet
from accounts.api.serializers import UserDisplaySrializser

class ParentModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser(read_only=True)
    date_display = serializers.SerializerMethodField()
    class Meta():
        model = Tweet
        fields = [
            'id',
            'user',
            'content',
            'timestamp',
            'date_display'
        ]

    def get_date_display(self,obj):
        return obj.timestamp.strftime(" %b %d, %Y | at %I:%M %p")

class TweetModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser(read_only=True)
    date_display = serializers.SerializerMethodField()
    parent = ParentModelSerializer(read_only=True)
    class Meta():
        model = Tweet
        fields = [
            'id',
            'user',
            'content',
            'timestamp',
            'date_display',
            'parent'
        ]

    def get_date_display(self,obj):
        return obj.timestamp.strftime(" %b %d, %Y | at %I:%M %p")
