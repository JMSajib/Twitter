from rest_framework import serializers
from tweet.models import Tweet
from accounts.api.serializers import UserDisplaySrializser

class TweetModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser(read_only=True)
    date_display = serializers.SerializerMethodField()
    class Meta():
        model = Tweet
        fields = [
            'user',
            'content',
            'timestamp',
            'date_display'
        ]

    def get_date_display(self,obj):
        return obj.timestamp.strftime(" %b %d, %Y | at %I:%M %p")    
