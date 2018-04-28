import re
from django.db.models.signals import post_save
from django.db import models
from django.urls import reverse
from .validators import validate_content
from django.conf import settings
from hashtags.signals import parsed_hashtags
# Create your models here.

class TweetManager(models.Manager):
    def retweet(self,user,parent_obj):
        if(parent_obj.parent):
            og_parent = parent_obj.parent
        else:
            og_parent = parent_obj
        qs = self.get_queryset().filter(user=user,parent=og_parent)
        if(qs.exists()):
            return None
        obj = self.model(
                parent = parent_obj,
                user = user,
                content = parent_obj.content
            )
        obj.save()
        return obj

    def like_toggle(self, user, tweet_obj):
        if user in tweet_obj.liked.all():
            is_liked = False
            tweet_obj.liked.remove(user)
        else:
            is_liked = True
            tweet_obj.liked.add(user)
        return is_liked

class Tweet(models.Model):
    parent    = models.ForeignKey("self",blank=True,null=True)
    user      = models.ForeignKey(settings.AUTH_USER_MODEL)
    liked     = models.ManyToManyField(settings.AUTH_USER_MODEL,blank=True,related_name='liked')
    reply     = models.BooleanField(verbose_name="Is a Reply?", default=False)
    content   = models.CharField(max_length=140,validators=[validate_content])
    updated   = models.DateTimeField(auto_now=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = TweetManager()

    def __str__(self):
        return self.content

    def get_absolute_url(self):
        return reverse("tweet:detail",kwargs={'pk':self.pk})

    class Meta():
        ordering = ['-timestamp']

    # def clean(self,*args,**kwargs):
    #     content = self.content
    #     if(content == "abc"):
    #         raise ValidationError("Content cant be ABC")
    #     return super(Tweet,self).clean(*args,**kwargs)

def tweet_save_receiver(sender,instance,created,*args,**kwargs):
    if(created and not instance.parent):
        user_regex = r'@(?P<username>[\w.@+-]+)'
        username = re.findall(user_regex,instance.content)

        hash_regex = r'#(?P<hashtags>[\w\d]+)'
        hashtags = re.findall(hash_regex,instance.content)
        parsed_hashtags.send(sender=instance.__class__, hashtag_list=hashtags)

post_save.connect(tweet_save_receiver,sender=Tweet)
