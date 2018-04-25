from django.db import models
from django.urls import reverse
from .validators import validate_content
from django.conf import settings
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

class Tweet(models.Model):
    parent    = models.ForeignKey("self",blank=True,null=True)
    user      = models.ForeignKey(settings.AUTH_USER_MODEL)
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
