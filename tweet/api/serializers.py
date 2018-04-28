from rest_framework import serializers
from tweet.models import Tweet
from accounts.api.serializers import UserDisplaySrializser

class ParentModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser(read_only=True)
    date_display = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    did_like = serializers.SerializerMethodField()
    class Meta():
        model = Tweet
        fields = [
            'id',
            'user',
            'content',
            'timestamp',
            'date_display',
            'likes',
            'did_like'
        ]

    def get_did_like(self,obj):
        request = self.context.get("request")
        user = request.user
        if(user.is_authenticated()):
            if(user in obj.liked.all()):
                return True
        return False

    def get_likes(self,obj):
        return obj.liked.all().count()

    def get_date_display(self,obj):
        return obj.timestamp.strftime(" %b %d, %Y | at %I:%M %p")

class TweetModelSerializer(serializers.ModelSerializer):
    user = UserDisplaySrializser(read_only=True)
    date_display = serializers.SerializerMethodField()
    parent = ParentModelSerializer(read_only=True)
    likes = serializers.SerializerMethodField()
    did_like = serializers.SerializerMethodField()
    class Meta():
        model = Tweet
        fields = [
            'id',
            'user',
            'content',
            'timestamp',
            'date_display',
            'parent',
            'likes',
            'did_like',
            'reply'
        ]

    def get_did_like(self,obj):
        request = self.context.get("request")
        user = request.user
        if(user.is_authenticated()):
            if(user in obj.liked.all()):
                return True
        return False

    def get_likes(self,obj):
        return obj.liked.all().count()

    def get_date_display(self,obj):
        return obj.timestamp.strftime(" %b %d, %Y | at %I:%M %p")
